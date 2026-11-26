from typing import Optional
from fastapi import APIRouter, Query

from app.schemas.weather import ForecastDay, WeatherAlertItem, WeatherResponse
from app.services.weather_service import get_current_weather, get_forecast, get_weather_alerts

router = APIRouter(tags=["weather"])


@router.get("/weather", response_model=WeatherResponse)
async def weather_endpoint(
    location: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
):
    return await get_current_weather(location=location, lat=lat, lon=lon)


@router.get("/weather/forecast", response_model=list[ForecastDay])
async def forecast_endpoint(
    location: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
):
    return await get_forecast(location=location, lat=lat, lon=lon)


@router.get("/alerts", response_model=list[WeatherAlertItem])
async def alerts_endpoint(
    location: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
):
    return await get_weather_alerts(location=location, lat=lat, lon=lon)
