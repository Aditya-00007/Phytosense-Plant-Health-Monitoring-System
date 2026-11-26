from typing import Optional
from pydantic import BaseModel


class WeatherResponse(BaseModel):
    temp: float
    feels_like: float
    condition: str
    humidity: Optional[int] = None
    pressure: Optional[int] = None
    wind_speed: float = 0.0
    wind_dir: str = "Unknown"
    rain_1h: float = 0.0
    clouds: int = 0
    icon: Optional[str] = None
    location_name: str = ""
    uv_index: int = 0
    uv_risk: str = "Low"
    solar_radiation: int = 0
    et0: float = 0.0


class WeatherAlertItem(BaseModel):
    id: str
    title: str
    message: str
    severity: str  # info | warning | danger
    recommendations: list[str] = []


class ForecastDay(BaseModel):
    day: str
    day_name: str
    min_temp: float
    max_temp: float
    avg_humidity: int
    total_rain: float
    avg_wind_speed: float
    weather_description: str
    weather_icon: Optional[str] = None
    advice: list[str] = []
