import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setToken } from '../services/api';
import * as authService from '../services/authService';
import { User } from '../models/User';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokenState, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore a saved session on app start.
  useEffect(() => {
    (async () => {
      const saved = await storage.get('session');
      if (saved) {
        const s = JSON.parse(saved);
        setToken(s.token);
        setTokenState(s.token);
        setUser(User.fromApi(s.user));
      }
      setLoading(false);
    })();
  }, []);

  const startSession = useCallback(async (session) => {
    setToken(session.token);
    setTokenState(session.token);
    setUser(session.user);
    await storage.set('session', JSON.stringify(session));
  }, []);

  const signIn = useCallback(
    async (email, password) => startSession(await authService.login(email, password)),
    [startSession],
  );

  const signUp = useCallback(
    async (name, email, password, extra) =>
      startSession(await authService.register(name, email, password, extra)),
    [startSession],
  );

  const updateProfile = useCallback(
    async (updates) => {
      const updatedUser = await authService.updateProfile(user, updates);
      setUser(updatedUser);
      await storage.set('session', JSON.stringify({ token: tokenState, user: updatedUser }));
      return updatedUser;
    },
    [user, tokenState],
  );

  const signOut = useCallback(async () => {
    setToken(null);
    setTokenState(null);
    setUser(null);
    await storage.remove('session');
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, updateProfile, signOut }),
    [user, loading, signIn, signUp, updateProfile, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
