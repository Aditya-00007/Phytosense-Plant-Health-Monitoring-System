export const Alert = {
  fromApi(raw = {}) {
    return {
      id: String(raw.id ?? raw._id),
      title: raw.title ?? 'Alert',
      message: raw.message ?? raw.description ?? '',
      severity: raw.severity ?? 'info', // info | warning | danger
      createdAt: raw.createdAt ?? raw.created_at ?? Date.now(),
    };
  },
};

export const Weather = {
  fromApi(raw = {}) {
    return {
      temp: Math.round(raw.temp ?? raw.temperature ?? 0),
      condition: raw.condition ?? raw.description ?? '',
      humidity: raw.humidity ?? null,
    };
  },
};
