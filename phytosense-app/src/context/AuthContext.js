import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setToken } from '../services/api';
import * as authService from '../services/authService';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore a saved session on app start.
  useEffect(() => {
    (async () => {
      const saved = await storage.get('session');
      if (saved) {
        const s = JSON.parse(saved);
        setToken(s.token);
        setUser(s.user);
      }
      setLoading(false);
    })();
  }, []);

  const startSession = useCallback(async (session) => {
    setToken(session.token);
    setUser(session.user);
    await storage.set('session', JSON.stringify(session));
  }, []);

  const signIn = useCallback(async (email, password) => startSession(await authService.login(email, password)), [startSession]);
  const signUp = useCallback(async (name, email, password) => startSession(await authService.register(name, email, password)), [startSession]);

  const signOut = useCallback(async () => {
    setToken(null);
    setUser(null);
    await storage.remove('session');
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
