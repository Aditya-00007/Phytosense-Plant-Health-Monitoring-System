export const FARMING_TYPES = ['Conventional', 'Organic', 'Mixed', 'Transitioning to Organic'];
export const IRRIGATION_METHODS = ['Drip', 'Sprinkler', 'Flood', 'Rainwater Only', 'Multiple Methods'];
export const WATER_LEVELS = ['Low', 'Medium', 'High'];
export const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Bengali'];

const REGIONS = {
  Konkan: ['mumbai', 'thane', 'palghar', 'raigad', 'ratnagiri', 'sindhudurg'],
  'Western Maharashtra': ['pune', 'satara', 'sangli', 'kolhapur', 'solapur'],
  Khandesh: ['nashik', 'dhule', 'nandurbar', 'jalgaon'],
  Marathwada: ['aurangabad', 'chhatrapati sambhajinagar', 'jalna', 'parbhani', 'hingoli', 'nanded', 'beed', 'latur', 'osmanabad', 'dharashiv'],
  Vidarbha: ['nagpur', 'wardha', 'bhandara', 'gondia', 'chandrapur', 'gadchiroli', 'yavatmal', 'akola', 'amravati', 'buldhana', 'washim'],
};

const INDIAN_PLACES = [
  'india', 'bharat', 'maharashtra', 'delhi', 'bangalore', 'bengaluru', 'hyderabad',
  'chennai', 'kolkata', 'rajasthan', 'gujarat', 'punjab', 'haryana', 'uttar pradesh',
  'madhya pradesh', 'karnataka', 'tamil nadu', 'andhra pradesh', 'telangana', 'kerala',
  'bihar', 'west bengal', 'assam', 'odisha', 'goa',
];

const SH_COUNTRIES = ['australia', 'brazil', 'south africa', 'new zealand', 'argentina', 'chile', 'peru', 'angola', 'mozambique', 'indonesia'];
const SH_CODES = [',au', ', au', ' au', ',br', ', br', ' br', ',za', ', za', ' za', ',nz', ', nz', ' nz', ',ar', ', ar', ' ar', ',cl', ', cl', ' cl'];

export function getFarmSizeCategory(farmSizeStr) {
  const num = parseFloat(String(farmSizeStr ?? '').replace(/[^\d.]/g, ''));
  if (!Number.isFinite(num) || num <= 0) return 'Unknown';
  if (num < 2.5) return 'Marginal';
  if (num < 5) return 'Small';
  if (num < 10) return 'Medium';
  return 'Large';
}

export function parseCropList(cropsStr) {
  if (!cropsStr) return [];
  return String(cropsStr)
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

export function getMainCrop(profile) {
  const crops = parseCropList(profile?.primaryCrops);
  return crops[0] || null;
}

export function getRegionFromLocation(location) {
  if (!location) return null;
  const lower = String(location).toLowerCase();
  for (const [region, districts] of Object.entries(REGIONS)) {
    if (lower.includes(region.toLowerCase())) return region;
    if (districts.some((d) => lower.includes(d))) return region;
  }
  return null;
}

export function getWeatherRiskFactors(profile) {
  const risks = { droughtRisk: 'Low', floodRisk: 'Low', frostRisk: 'Low' };
  const region = getRegionFromLocation(profile?.farmLocation);

  if (region === 'Marathwada' || region === 'Vidarbha') {
    risks.droughtRisk = 'High';
  } else if (region === 'Konkan') {
    risks.floodRisk = 'High';
  } else if (region === 'Western Maharashtra') {
    risks.frostRisk = 'Medium';
  }

  const crops = parseCropList(profile?.primaryCrops).map((c) => c.toLowerCase());
  if (crops.includes('rice') && risks.droughtRisk === 'Low') risks.droughtRisk = 'Medium';
  if (crops.includes('sugarcane') && risks.frostRisk === 'Low') risks.frostRisk = 'Medium';
  return risks;
}

function isLocationIndia(location) {
  if (!location) return true;
  const lower = String(location).toLowerCase().trim();
  if (lower.endsWith(',in') || lower.endsWith(', in') || lower.endsWith(' in')) return true;
  if (getRegionFromLocation(location)) return true;
  return INDIAN_PLACES.some((place) => lower.includes(place));
}

function isSouthernHemisphere(location) {
  if (!location) return false;
  const lower = String(location).toLowerCase().trim();
  return SH_COUNTRIES.some((c) => lower.includes(c)) || SH_CODES.some((code) => lower.endsWith(code));
}

export function getSeasonDetails(location, month = new Date().getMonth() + 1) {
  if (isLocationIndia(location)) {
    if (month >= 6 && month <= 9) {
      return {
        season: 'Monsoon (Kharif)',
        color: '#2196F3',
        icon: 'rainy',
        tips: [
          'Sow Kharif crops (Rice, Cotton, Soybean, Maize)',
          'Ensure proper field drainage to prevent waterlogging',
          'Monitor for fungal diseases due to high humidity',
        ],
      };
    }
    if (month >= 10 && month <= 11) {
      return {
        season: 'Post-monsoon (Autumn)',
        color: '#E65100',
        icon: 'leaf',
        tips: [
          'Harvest mature Kharif crops',
          'Prepare land and treat seeds for Rabi crops',
          'Apply pre-sowing irrigation',
        ],
      };
    }
    if (month === 12 || month <= 2) {
      return {
        season: 'Winter (Rabi)',
        color: '#0097A7',
        icon: 'snow',
        tips: [
          'Manage Rabi crops (Wheat, Mustard, Potato)',
          'Apply light but regular irrigation',
          'Watch for aphid infestations and powdery mildew',
        ],
      };
    }
    return {
      season: 'Summer (Zaid)',
      color: '#EF6C00',
      icon: 'sunny',
      tips: [
        'Apply mulch to conserve moisture and use shade nets',
        'Maintain regular irrigation for Zaid crops',
        'Monitor soil moisture frequently during high heat',
      ],
    };
  }

  const southern = isSouthernHemisphere(location);
  const summerMonths = southern ? [12, 1, 2] : [6, 7, 8];
  const autumnMonths = southern ? [3, 4, 5] : [9, 10, 11];
  const winterMonths = southern ? [6, 7, 8] : [12, 1, 2];

  if (summerMonths.includes(month)) {
    return {
      season: 'Summer',
      color: '#EF6C00',
      icon: 'sunny',
      tips: ['Monitor for heat stress', 'Apply mulch to retain moisture', 'Watch for pest outbreaks'],
    };
  }
  if (autumnMonths.includes(month)) {
    return {
      season: 'Autumn',
      color: '#E65100',
      icon: 'leaf',
      tips: ['Harvest mature crops', 'Plant cover crops', 'Test and amend soil'],
    };
  }
  if (winterMonths.includes(month)) {
    return {
      season: 'Winter',
      color: '#0097A7',
      icon: 'snow',
      tips: ['Protect sensitive plants', 'Service farm equipment', "Plan next season's crops"],
    };
  }
  return {
    season: 'Spring',
    color: '#2E7D32',
    icon: 'flower',
    tips: ['Prepare soil for planting', 'Start summer seedlings', 'Check irrigation systems'],
  };
}

