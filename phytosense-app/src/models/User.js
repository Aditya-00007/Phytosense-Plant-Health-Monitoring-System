export const User = {
  fromApi(raw = {}) {
    return {
      id: String(raw.id ?? raw._id ?? ''),
      name: raw.name ?? raw.username ?? 'Farmer',
      email: raw.email ?? '',
    };
  },
};
