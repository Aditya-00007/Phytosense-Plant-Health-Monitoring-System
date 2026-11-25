// Sample data so the app runs without a backend (USE_MOCK = true).
const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));

let posts = [
  { id: '1', author: 'Farmer123', crop: 'Tomato', text: 'Has anyone faced this on tomato plants? What treatment worked for you?', likes: 12, comments: 5, createdAt: Date.now() - 2 * 3600e3 },
  { id: '2', author: 'GreenFields', crop: 'Tomato', text: 'Useful tip: keep proper spacing between plants to reduce fungal infections.', likes: 8, comments: 1, createdAt: Date.now() - 24 * 3600e3 },
];

export const mock = {
  async login(email) {
    await wait();
    return {
      token: 'mock-token',
      user: {
        id: '1',
        name: email.split('@')[0],
        email,
        farm_location: 'Pune, Maharashtra',
        farm_size: '4.5',
        farming_type: 'Mixed',
        irrigation: 'Drip',
        Water_Availability: 'Medium',
        primary_crops: 'Tomato, Onion',
        receive_weather_alerts: true,
        preferred_language: 'English',
      },
    };
  },
  async register(name, email, extra = {}) {
    await wait();
    return {
      token: 'mock-token',
      user: {
        id: '1',
        name,
        email,
        phone: extra.phone || '',
        farm_location: extra.farmLocation || '',
        farming_type: 'Conventional',
        irrigation: 'Drip',
        Water_Availability: 'Medium',
        receive_weather_alerts: true,
        preferred_language: 'English',
      },
    };
  },
  async updateProfile(user, updates) {
    await wait(400);
    return { ...user, ...updates, lastUpdated: new Date().toISOString() };
  },
  async diagnose() {
    await wait(1500);
    return {
      disease: 'Early Blight',
      crop: 'Tomato',
      confidence: 0.94,
      explanation: 'Dark brown spots with a yellow halo on the leaves. A fungal disease common in warm, humid conditions.',
      causes: ['High humidity', 'Warm temperature (20-30°C)', 'Poor air circulation'],
      treatment: ['Apply a fungicide (e.g., Mancozeb)', 'Follow the recommended dosage', 'Remove heavily infected leaves'],
      prevention: ['Rotate crops', 'Use resistant varieties', 'Maintain field hygiene'],
      irrigation: ['Maintain moderate moisture', 'Avoid water stagnation', 'Water at the base, not on leaves'],
    };
  },
  async weather() {
    await wait(400);
    return { temp: 24, condition: 'Clear', humidity: 58 };
  },
  async alerts() {
    await wait(400);
    return [
      { id: 'a1', title: 'Unseasonal rain expected', message: 'Rain likely in the next 24 hours. Delay spraying and check drainage.', severity: 'warning', createdAt: Date.now() - 3600e3 },
    ];
  },
  async posts() {
    await wait(400);
    return posts;
  },
  async createPost(p) {
    await wait(400);
    const post = { id: String(Date.now()), author: p.author, crop: p.crop, text: p.text, likes: 0, comments: 0, createdAt: Date.now() };
    posts = [post, ...posts];
    return post;
  },
};
