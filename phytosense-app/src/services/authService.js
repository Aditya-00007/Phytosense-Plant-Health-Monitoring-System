import { USE_MOCK } from '../config/env';
import { request } from './api';
import { ENDPOINTS } from './endpoints';
import { mock } from './mock';
import { User } from '../models/User';

const toSession = (raw) => ({ user: User.fromApi(raw.user), token: raw.token });

export async function login(email, password) {
  const raw = USE_MOCK
    ? await mock.login(email)
    : await request(ENDPOINTS.login, { method: 'POST', body: { email, password } });
  return toSession(raw);
}

export async function register(name, email, password) {
  const raw = USE_MOCK
    ? await mock.register(name, email)
    : await request(ENDPOINTS.register, { method: 'POST', body: { name, email, password } });
  return toSession(raw);
}
