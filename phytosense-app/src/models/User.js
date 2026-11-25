export const User = {
  fromApi(raw = {}) {
    return {
      id: String(raw.id ?? raw._id ?? ''),
      name: raw.name ?? raw.username ?? 'Farmer',
      email: raw.email ?? '',
      phone: raw.phone ?? '',
      farmLocation: raw.farmLocation ?? raw.farm_location ?? '',
      farmSize: raw.farmSize ?? raw.farm_size ?? '',
      farmingType: raw.farmingType ?? raw.farming_type ?? 'Conventional',
      irrigation: raw.irrigation ?? 'Drip',
      waterAvailability: raw.waterAvailability ?? raw.Water_Availability ?? raw.water_availability ?? 'Medium',
      income: raw.income ?? raw.Income ?? '',
      primaryCrops: raw.primaryCrops ?? raw.primary_crops ?? '',
      secondaryCrops: raw.secondaryCrops ?? raw.secondary_crops ?? '',
      receiveWeatherAlerts: raw.receiveWeatherAlerts ?? raw.receive_weather_alerts ?? true,
      preferredLanguage: raw.preferredLanguage ?? raw.preferred_language ?? 'English',
      lastUpdated: raw.lastUpdated ?? raw.last_updated ?? null,
    };
  },
  toApi(profile = {}) {
    return {
      name: profile.name ?? '',
      phone: profile.phone ?? '',
      farm_location: profile.farmLocation ?? '',
      farm_size: profile.farmSize ?? '',
      farming_type: profile.farmingType ?? 'Conventional',
      irrigation: profile.irrigation ?? 'Drip',
      Water_Availability: profile.waterAvailability ?? 'Medium',
      Income: profile.income ?? '',
      primary_crops: profile.primaryCrops ?? '',
      secondary_crops: profile.secondaryCrops ?? '',
      receive_weather_alerts: profile.receiveWeatherAlerts ?? true,
      preferred_language: profile.preferredLanguage ?? 'English',
      last_updated: new Date().toISOString(),
    };
  },
};
