import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { storage } from '../utils/storage';
import {
  AVAILABLE_LANGUAGES,
  LANGUAGE_NAME_TO_CODE,
  STATIC_TRANSLATIONS,
} from '../i18n/translations';
import { getCachedTranslation, preloadLangCache, translateViaApi } from '../i18n/translateApi';

const LanguageContext = createContext(null);
export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  const [lang, setLangState] = useState('en');
  const [cacheVersion, setCacheVersion] = useState(0);
  const requestedKeys = useRef(new Set());

  // Restore saved language preference on startup.
  useEffect(() => {
    (async () => {
      const saved = await storage.get('language');
      if (saved && AVAILABLE_LANGUAGES.some((l) => l.code === saved)) {
        await preloadLangCache(saved);
        setLangState(saved);
      }
    })();
  }, []);

  // Sync with farmer profile's preferredLanguage when user logs in or updates profile.
  useEffect(() => {
    const code = LANGUAGE_NAME_TO_CODE[user?.preferredLanguage];
    if (code) {
      preloadLangCache(code).then(() => {
        setLangState(code);
        storage.set('language', code);
      });
    }
  }, [user?.preferredLanguage]);

  const setLang = useCallback(async (code) => {
    if (!AVAILABLE_LANGUAGES.some((l) => l.code === code)) return;
    await preloadLangCache(code);
    requestedKeys.current.clear();
    setLangState(code);
    await storage.set('language', code);
  }, []);

  const t = useCallback(
    (text) => {
      if (text == null) return '';
      if (typeof text === 'number') return text;
      const str = String(text);
      const trimmed = str.trim();
      if (!trimmed || lang === 'en') return str;

      const staticHit = STATIC_TRANSLATIONS[lang]?.[trimmed];
      if (staticHit) return staticHit;

      const dynamicHit = getCachedTranslation(trimmed, lang);
      if (dynamicHit) return dynamicHit;

      // Trigger async MyMemory lookup once per key for the active language.
      const reqKey = `${lang}:${trimmed}`;
      if (!requestedKeys.current.has(reqKey)) {
        requestedKeys.current.add(reqKey);
        translateViaApi(trimmed, lang).then((res) => {
          if (res && res !== trimmed) setCacheVersion((v) => v + 1);
        });
      }
      return str;
    },
    // cacheVersion forces subscribers to re-render when an async API translation resolves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, cacheVersion],
  );

  const value = useMemo(
    () => ({ lang, setLang, t, languages: AVAILABLE_LANGUAGES }),
    [lang, setLang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
