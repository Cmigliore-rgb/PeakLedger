import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pl_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(r => {
        setUser(r.data.user);
        api.post('/auth/refresh').then(r2 => {
          if (r2.data?.token) localStorage.setItem('pl_token', r2.data.token);
        }).catch(() => {});
      })
      .catch(() => localStorage.removeItem('pl_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('pl_token', token);
    setUser(userData);
  };

  const logout = () => {
    if (navigator.credentials?.preventSilentAccess) navigator.credentials.preventSilentAccess();
    const uid = user?.id;
    // Clear user-scoped data so the next user on this browser gets a clean slate
    const userKeys = uid ? [
      `pl_calendar_${uid}`, `pl_cat_overrides_${uid}`, `pl_cat_emojis_${uid}`,
      `pl_tickers_${uid}`, `pl_notif_sent_${uid}`, `pl_prof_tabs_${uid}`,
      `pl_prof_content_${uid}`, `pl_learn_videos_${uid}`, `pl_layout_order_${uid}`,
      `pl_hidden_subtabs_${uid}`,
    ] : [];
    // Also wipe any legacy non-scoped keys from old sessions
    const legacyKeys = ['pl_calendar','pl_cat_overrides','pl_cat_emojis','pl_tickers',
      'pl_notif_sent','pl_prof_tabs','pl_prof_content','pl_learn_videos'];
    [...userKeys, ...legacyKeys, 'pl_token'].forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  const refreshUser = () =>
    api.get('/auth/me').then(r => setUser(r.data.user)).catch(() => {});

  const isPremium   = user?.tier === 'premium' || user?.role === 'admin' || user?.role === 'professor';
  const isAdmin     = user?.role === 'admin';
  const isProfessor = user?.role === 'professor' || user?.role === 'admin';
  const isStudent   = user?.role === 'student';
  const isUser      = user?.role === 'user';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isPremium, isAdmin, isProfessor, isStudent, isUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
