import { USE_MOCK } from '../config/env';
import { request } from './api';
import { ENDPOINTS } from './endpoints';
import { mock } from './mock';
import { Post } from '../models/Post';

export async function getPosts() {
  const raw = USE_MOCK ? await mock.posts() : await request(ENDPOINTS.posts);
  return (Array.isArray(raw) ? raw : raw?.posts ?? []).map(Post.fromApi);
}

export async function createPost({ text, crop, author }) {
  const raw = USE_MOCK
    ? await mock.createPost({ text, crop, author })
    : await request(ENDPOINTS.posts, { method: 'POST', body: { text, crop } });
  return Post.fromApi(raw);
}
