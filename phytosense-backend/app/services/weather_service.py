import math
import time
from collections import Counter
from datetime import datetime
from typing import Optional

import httpx
from fastapi import HTTPException

from app.core.config import OPENWEATHER_API_KEY, WEATHER_CACHE_TTL
from app.schemas.weather import ForecastDay, WeatherAlertItem, WeatherResponse

OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"
_CACHE: dict[str, tuple[float, dict]] = {}


def _cache_key(endpoint: str, location: Optional[str], lat: Optional[float], lon: Optional[float]) -> str:
    if lat is not None and lon is not None:
        return f"{endpoint}:{lat:.2f},{lon:.2f}"
    return f"{endpoint}:{(location or '').strip().lower()}"


def _get_cached(key: str) -> Optional[dict]:
    entry = _CACHE.get(key)
    if entry and (time.time() - entry[0]) < WEATHER_CACHE_TTL:
        return entry[1]
    return None


def _set_cached(key: str, data: dict) -> None:
    _CACHE[key] = (time.time(), data)


async def _fetch_owm(endpoint: str, location: Optional[str], lat: Optional[float], lon: Optional[float]) -> dict:
    if not OPENWEATHER_API_KEY:
        raise HTTPException(status_code=503, detail="OPENWEATHER_API_KEY is not configured on the backend.")
    if (lat is None or lon is None) and not (location and location.strip()):
        raise HTTPException(status_code=400, detail="Provide either location or lat/lon coordinates.")

    key = _cache_key(endpoint, location, lat, lon)
    cached = _get_cached(key)
    if cached is not None:
        return cached

    params: dict[str, str | float] = {"appid": OPENWEATHER_API_KEY, "units": "metric"}
    if lat is not None and lon is not None:
        params["lat"] = lat
        params["lon"] = lon
    else:
        params["q"] = location.strip()

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(f"{OPENWEATHER_BASE}/{endpoint}", params=params)

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Weather API error ({resp.status_code}): {resp.text}")

    data = resp.json()
    _set_cached(key, data)
    return data


def _wind_direction(deg: Optional[float]) -> str:
    if deg is None:
        return "Unknown"
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    return dirs[round(deg / 22.5) % 16]


def _estimate_uv(clouds: int, dt_ts: int) -> tuple[int, str]:
    dt = datetime.fromtimestamp(dt_ts) if dt_ts else datetime.now()
    base_map = {1: 3, 2: 4, 3: 6, 4: 8, 5: 9, 6: 10, 7: 9, 8: 8, 9: 6, 10: 4, 11: 3, 12: 2}
    base = base_map.get(dt.month, 5)
    time_factor = max(0.1, 1 - abs(12 - dt.hour) / 12)
    uv = round(max(0, min(12, base * time_factor * (1 - (clouds / 100) * 0.7))))
    if uv < 3:
        risk = "Low"
    elif uv < 6:
        risk = "Moderate"
    elif uv < 8:
        risk = "High"
    elif uv < 11:
        risk = "Very High"
    else:
        risk = "Extreme"
    return uv, risk


def _estimate_solar(clouds: int, dt_ts: int) -> int:
    dt = datetime.fromtimestamp(dt_ts) if dt_ts else datetime.now()
    max_map = {1: 500, 2: 600, 3: 700, 4: 800, 5: 900, 6: 1000, 7: 950, 8: 850, 9: 750, 10: 650, 11: 550, 12: 450}
    max_rad = max_map.get(dt.month, 700)
    time_factor = max(0.05, 1 - abs(12 - dt.hour) / 12)
    return round(max(0, min(1200, max_rad * time_factor * (1 - (clouds / 100) * 0.8))))


def _calculate_et0(temp: float, humidity: int, wind_speed: float, solar_rad: int) -> float:
    solar_mj = solar_rad * 0.0864
    es = 0.6108 * math.exp((17.27 * temp) / (temp + 237.3)) if temp > -200 else 1.0
    ea = es * (humidity / 100.0)
    delta = (4098 * es) / ((temp + 237.3) ** 2)
    gamma = 0.665e-3 * 101.3
    num = (0.408 * delta * solar_mj) + (gamma * (900 / (temp + 273)) * wind_speed * (es - ea))
    den = delta + (gamma * (1 + 0.34 * wind_speed))
    return max(0.0, round(num / den, 1)) if den else 0.0


def build_weather_response(raw: dict) -> WeatherResponse:
    main = raw.get("main", {})
    wind = raw.get("wind", {})
    weather = (raw.get("weather") or [{}])[0]
    clouds = int(raw.get("clouds", {}).get("all", 0))
    dt_ts = int(raw.get("dt", 0))
    temp = float(main.get("temp", 0.0))
    humidity = int(main.get("humidity", 50))
    wind_speed = float(wind.get("speed", 0.0))

    uv, uv_risk = _estimate_uv(clouds, dt_ts)
    solar = _estimate_solar(clouds, dt_ts)
    et0 = _calculate_et0(temp, humidity, wind_speed, solar)

    return WeatherResponse(
        temp=round(temp, 1),
        feels_like=round(float(main.get("feels_like", temp)), 1),
        condition=str(weather.get("description", "Clear")).capitalize(),
        humidity=humidity,
        pressure=main.get("pressure"),
        wind_speed=round(wind_speed, 1),
        wind_dir=_wind_direction(wind.get("deg")),
        rain_1h=float(raw.get("rain", {}).get("1h", 0.0)),
        clouds=clouds,
        icon=weather.get("icon"),
        location_name=str(raw.get("name", "")),
        uv_index=uv,
        uv_risk=uv_risk,
        solar_radiation=solar,
        et0=et0,
    )


def build_alerts(raw: dict) -> list[WeatherAlertItem]:
    alerts: list[WeatherAlertItem] = []
    main = raw.get("main", {})
    temp = main.get("temp")
    humidity = main.get("humidity")
    pressure = main.get("pressure")
    wind = raw.get("wind", {})
    wind_speed = wind.get("speed")
    wind_gust = wind.get("gust")
    rain_1h = raw.get("rain", {}).get("1h", 0)
    rain_3h = raw.get("rain", {}).get("3h", 0)
    weather_id = (raw.get("weather") or [{}])[0].get("id")

    if temp is not None:
        if temp > 38:
            alerts.append(WeatherAlertItem(
                id="heat-extreme",
                title="Extreme Heat Warning",
                message="Dangerously high temperatures may cause heat stress in crops.",
                severity="danger",
                recommendations=["Increase irrigation frequency", "Provide shade for sensitive crops", "Avoid midday spraying"],
            ))
        elif temp > 32:
            alerts.append(WeatherAlertItem(
                id="heat-high",
                title="High Temperature Alert",
                message="Elevated temperatures increase crop evaporation.",
                severity="warning",
                recommendations=["Adjust irrigation schedule for higher evaporation", "Apply mulch to retain soil moisture"],
            ))
        elif temp < 0:
            alerts.append(WeatherAlertItem(
                id="frost-freeze",
                title="Freezing Conditions",
                message="Freezing temperatures pose frost damage risk.",
                severity="danger",
                recommendations=["Protect sensitive crops with frost covers or mulch", "Harvest mature sensitive crops"],
            ))
        elif temp < 5:
            alerts.append(WeatherAlertItem(
                id="cold-alert",
                title="Cold Temperature Alert",
                message="Cold conditions may slow plant growth.",
                severity="warning",
                recommendations=["Delay planting sensitive seedlings", "Monitor young plants for cold stress"],
            ))

    if humidity is not None:
        if humidity > 85:
            alerts.append(WeatherAlertItem(
                id="humidity-high",
                title="High Humidity Alert",
                message="High humidity increases fungal disease risk.",
                severity="warning",
                recommendations=["Monitor crops for fungal infection", "Avoid overhead irrigation to keep leaves dry"],
            ))
        elif humidity < 30:
            alerts.append(WeatherAlertItem(
                id="humidity-low",
                title="Low Humidity Alert",
                message="Dry air increases water loss through transpiration.",
                severity="warning",
                recommendations=["Increase irrigation frequency", "Apply mulch to reduce moisture loss"],
            ))

    if rain_1h > 10 or rain_3h > 20:
        alerts.append(WeatherAlertItem(
            id="rain-heavy",
            title="Heavy Rainfall Warning",
            message="Heavy rain may cause waterlogging and soil erosion.",
            severity="danger",
            recommendations=["Clear field drainage channels", "Postpone fertilizer and spray applications"],
        ))
    elif rain_1h > 5 or rain_3h > 10:
        alerts.append(WeatherAlertItem(
            id="rain-moderate",
            title="Moderate Rainfall Alert",
            message="Moderate rain may affect spraying and field work.",
            severity="warning",
            recommendations=["Check drainage systems", "Delay foliar spraying until dry"],
        ))

    if wind_speed is not None:
        if wind_speed > 15 or (wind_gust and wind_gust > 20):
            alerts.append(WeatherAlertItem(
                id="wind-high",
                title="High Wind Warning",
                message="Strong winds may damage tall crops and structures.",
                severity="danger",
                recommendations=["Stake tall crops", "Postpone pesticide spraying to prevent drift"],
            ))
        elif wind_speed > 10:
            alerts.append(WeatherAlertItem(
                id="wind-mod",
                title="Windy Conditions",
                message="Moderate winds may cause spray drift and higher evaporation.",
                severity="warning",
                recommendations=["Avoid spraying pesticides in windy hours"],
            ))

    if weather_id and 200 <= weather_id < 300:
        alerts.append(WeatherAlertItem(
            id="storm",
            title="Thunderstorm Alert",
            message="Thunderstorms may bring lightning, hail, and strong gusts.",
            severity="danger",
            recommendations=["Seek shelter indoors", "Protect vulnerable nurseries if possible"],
        ))

    if pressure is not None and pressure < 980:
        alerts.append(WeatherAlertItem(
            id="pressure-low",
            title="Low Pressure System",
            message="Low atmospheric pressure indicates possible stormy weather.",
            severity="warning",
            recommendations=["Prepare field drainage for incoming rain"],
        ))

    return alerts


def build_forecast(raw: dict) -> list[ForecastDay]:
    days: dict[str, list[dict]] = {}
    for entry in raw.get("list", []):
        day_key = datetime.fromtimestamp(entry["dt"]).strftime("%Y-%m-%d")
        days.setdefault(day_key, []).append(entry)

    result: list[ForecastDay] = []
    for day_key, entries in list(days.items())[:5]:
        dt = datetime.strptime(day_key, "%Y-%m-%d")
        descs = [e["weather"][0]["description"] for e in entries if e.get("weather")]
        icons = [e["weather"][0]["icon"] for e in entries if e.get("weather")]
        common_desc = Counter(descs).most_common(1)[0][0] if descs else "Clear"
        common_icon = next((ic for d, ic in zip(descs, icons) if d == common_desc), icons[0] if icons else None)

        min_t = min(e["main"]["temp_min"] for e in entries)
        max_t = max(e["main"]["temp_max"] for e in entries)
        avg_hum = round(sum(e["main"]["humidity"] for e in entries) / len(entries))
        total_rain = round(sum(e.get("rain", {}).get("3h", 0) for e in entries), 1)
        avg_wind = round(sum(e.get("wind", {}).get("speed", 0) for e in entries) / len(entries), 1)

        advice: list[str] = []
        if max_t > 35:
            advice.append("Increase irrigation frequency and avoid midday fieldwork")
        elif min_t < 5:
            advice.append("Protect frost-sensitive crops overnight")
        if total_rain > 10:
            advice.append("Check drainage channels and postpone fertilizer application")
        elif total_rain > 2:
            advice.append("Reduce irrigation and monitor for fungal issues")
        if avg_wind > 10:
            advice.append("Avoid pesticide spraying due to wind drift")
        if not advice:
            advice.append("Good conditions for routine field operations")

        result.append(ForecastDay(
            day=day_key,
            day_name=dt.strftime("%A"),
            min_temp=round(min_t, 1),
            max_temp=round(max_t, 1),
            avg_humidity=avg_hum,
            total_rain=total_rain,
            avg_wind_speed=avg_wind,
            weather_description=common_desc.capitalize(),
            weather_icon=common_icon,
            advice=advice,
        ))
    return result


async def get_current_weather(location: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> WeatherResponse:
    raw = await _fetch_owm("weather", location, lat, lon)
    return build_weather_response(raw)


async def get_weather_alerts(location: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> list[WeatherAlertItem]:
    raw = await _fetch_owm("weather", location, lat, lon)
    return build_alerts(raw)


async def get_forecast(location: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> list[ForecastDay]:
    raw = await _fetch_owm("forecast", location, lat, lon)
    return build_forecast(raw)
