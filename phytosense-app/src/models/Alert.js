export const Alert = {
  fromApi(raw = {}) {
    return {
      id: String(raw.id ?? raw._id ?? raw.title ?? Date.now()),
      title: raw.title ?? 'Alert',
      message: raw.message ?? raw.description ?? '',
      severity: raw.severity ?? raw.type ?? 'info', // info | warning | danger
      recommendations: Array.isArray(raw.recommendations) ? raw.recommendations : [],
      createdAt: raw.createdAt ?? raw.created_at ?? Date.now(),
    };
  },
};

export const Weather = {
  fromApi(raw = {}) {
    return {
      temp: Math.round((raw.temp ?? raw.temperature ?? 0) * 10) / 10,
      feelsLike: Math.round((raw.feelsLike ?? raw.feels_like ?? raw.temp ?? 0) * 10) / 10,
      condition: raw.condition ?? raw.description ?? '',
      humidity: raw.humidity ?? null,
      pressure: raw.pressure ?? null,
      windSpeed: raw.windSpeed ?? raw.wind_speed ?? 0,
      windDir: raw.windDir ?? raw.wind_dir ?? 'Unknown',
      rain1h: raw.rain1h ?? raw.rain_1h ?? 0,
      clouds: raw.clouds ?? 0,
      icon: raw.icon ?? null,
      locationName: raw.locationName ?? raw.location_name ?? '',
      uvIndex: raw.uvIndex ?? raw.uv_index ?? 0,
      uvRisk: raw.uvRisk ?? raw.uv_risk ?? 'Low',
      solarRadiation: raw.solarRadiation ?? raw.solar_radiation ?? 0,
      et0: raw.et0 ?? 0,
    };
  },
};

export const ForecastDay = {
  fromApi(raw = {}) {
    return {
      day: raw.day ?? '',
      dayName: raw.dayName ?? raw.day_name ?? '',
      minTemp: raw.minTemp ?? raw.min_temp ?? 0,
      maxTemp: raw.maxTemp ?? raw.max_temp ?? 0,
      avgHumidity: raw.avgHumidity ?? raw.avg_humidity ?? 0,
      totalRain: raw.totalRain ?? raw.total_rain ?? 0,
      avgWindSpeed: raw.avgWindSpeed ?? raw.avg_wind_speed ?? 0,
      weatherDescription: raw.weatherDescription ?? raw.weather_description ?? '',
      weatherIcon: raw.weatherIcon ?? raw.weather_icon ?? null,
      advice: Array.isArray(raw.advice) ? raw.advice : [],
    };
  },
};
