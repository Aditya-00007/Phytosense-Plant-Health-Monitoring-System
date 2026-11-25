import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config/env';

let token = null;
export const setToken = (t) => {
  token = t;
};

// Thin fetch wrapper: JSON or multipart (pass `form`), bearer token, timeout.
export async function request(path, { method = 'GET', body, form } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    let payload;
    if (form) {
      payload = form;
    } else if (body) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await fetch(API_BASE_URL + path, { method, headers, body: payload, signal: ctrl.signal });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.detail || data?.message || `Request failed (${res.status})`);
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Server took too long to respond. Please try again.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
