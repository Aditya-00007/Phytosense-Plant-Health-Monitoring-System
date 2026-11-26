from app.services.weather_service import build_alerts, build_forecast, build_weather_response


def test_build_weather_response_and_alerts():
    sample = {
        "name": "Pune",
        "dt": 1732615200,
        "main": {"temp": 39.2, "feels_like": 41.0, "humidity": 88, "pressure": 1005},
        "wind": {"speed": 16.0, "deg": 270},
        "clouds": {"all": 20},
        "rain": {"1h": 12.0},
        "weather": [{"id": 200, "description": "thunderstorm with rain", "icon": "11d"}],
    }
    weather = build_weather_response(sample)
    assert weather.location_name == "Pune"
    assert weather.wind_dir == "W"
    assert weather.et0 >= 0.0

    alerts = build_alerts(sample)
    ids = {a.id for a in alerts}
    assert {"heat-extreme", "humidity-high", "rain-heavy", "wind-high", "storm"}.issubset(ids)


def test_build_forecast():
    raw = {
        "list": [
            {
                "dt": 1732615200,
                "main": {"temp_min": 20.0, "temp_max": 30.0, "humidity": 60},
                "wind": {"speed": 3.5},
                "weather": [{"description": "clear sky", "icon": "01d"}],
            },
            {
                "dt": 1732626000,
                "main": {"temp_min": 22.0, "temp_max": 32.0, "humidity": 50},
                "wind": {"speed": 4.5},
                "rain": {"3h": 3.0},
                "weather": [{"description": "clear sky", "icon": "01d"}],
            },
        ]
    }
    days = build_forecast(raw)
    assert len(days) == 1
    assert days[0].min_temp == 20.0
    assert days[0].max_temp == 32.0
    assert days[0].total_rain == 3.0
