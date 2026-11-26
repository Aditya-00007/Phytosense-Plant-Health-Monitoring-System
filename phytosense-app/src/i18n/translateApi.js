import { storage } from '../utils/storage';

const MAX_CHARS = 450; // Safe below MyMemory's 500-char query limit
const memCache = {};
const loadedLangs = new Set();
const inFlight = new Map();

function storageKey(langCode) {
  return `i18n_cache_${langCode}`;
}

export async function preloadLangCache(langCode) {
  if (!langCode || langCode === 'en' || loadedLangs.has(langCode)) return memCache[langCode] || {};
  loadedLangs.add(langCode);
  const raw = await storage.get(storageKey(langCode));
  if (raw) {
    try {
      memCache[langCode] = { ...JSON.parse(raw), ...(memCache[langCode] || {}) };
    } catch {}
  }
  if (!memCache[langCode]) memCache[langCode] = {};
  return memCache[langCode];
}

export function getCachedTranslation(text, langCode) {
  if (!text || !langCode || langCode === 'en') return null;
  return memCache[langCode]?.[text] ?? null;
}

async function persistCache(langCode) {
  try {
    await storage.set(storageKey(langCode), JSON.stringify(memCache[langCode] || {}));
  } catch {}
}

async function fetchMyMemory(chunk, targetLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${encodeURIComponent(`en|${targetLang}`)}`;
  const res = await fetch(url);
  if (!res.ok) return chunk;
  const json = await res.json();
  return json?.responseData?.translatedText || chunk;
}

export async function translateViaApi(text, targetLang) {
  const key = String(text ?? '').trim();
  if (!key || !targetLang || targetLang === 'en') return key;

  await preloadLangCache(targetLang);
  if (memCache[targetLang]?.[key]) return memCache[targetLang][key];

  const flightKey = `${targetLang}:${key}`;
  if (inFlight.has(flightKey)) return inFlight.get(flightKey);

  const job = (async () => {
    try {
      let translated;
      if (key.length > MAX_CHARS) {
        const chunks = [];
        for (let i = 0; i < key.length; i += MAX_CHARS) {
          chunks.push(key.slice(i, i + MAX_CHARS));
        }
        const parts = await Promise.all(chunks.map((c) => fetchMyMemory(c, targetLang)));
        translated = parts.join(' ');
      } else {
        translated = await fetchMyMemory(key, targetLang);
      }
      if (!memCache[targetLang]) memCache[targetLang] = {};
      memCache[targetLang][key] = translated || key;
      await persistCache(targetLang);
      return memCache[targetLang][key];
    } catch {
      return key;
    } finally {
      inFlight.delete(flightKey);
    }
  })();

  inFlight.set(flightKey, job);
  return job;
}
