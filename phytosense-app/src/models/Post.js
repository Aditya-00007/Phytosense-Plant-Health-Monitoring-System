export const Post = {
  fromApi(raw = {}) {
    return {
      id: String(raw.id ?? raw._id),
      author: raw.author ?? raw.user ?? 'Farmer',
      crop: raw.crop ?? '',
      text: raw.text ?? raw.content ?? '',
      likes: raw.likes ?? 0,
      comments: raw.comments ?? 0,
      createdAt: raw.createdAt ?? raw.created_at ?? Date.now(),
    };
  },
};

export function timeAgo(ts) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(ts).getTime()) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return hrs < 24 ? `${hrs} hours ago` : `${Math.round(hrs / 24)} day(s) ago`;
}
