import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext(null);

const SESSION_CACHE_KEYS = [
  'vpass_applications',
  'vpass_vehicles',
  'vpass_registration_draft',
  'vpass_visitor_passes',
  'vpass_gate_logs',
  'vpass_notifications',
  'vpass_guards_list',
];

const clearSessionCaches = () => {
  try {
    SESSION_CACHE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch (_) {}
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vpass_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vpass_token') || null);
  const [loading, setLoading] = useState(false);

  const login = (userData, userToken) => {
    // Clear previous session cache if switching accounts or starting a fresh login
    clearSessionCaches();
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('vpass_user', JSON.stringify(userData));
    localStorage.setItem('vpass_token', userToken);
  };

  const logout = () => {
    clearSessionCaches();
    setUser(null);
    setToken(null);
    localStorage.removeItem('vpass_user');
    localStorage.removeItem('vpass_token');
    localStorage.removeItem('vpass_active_gate');
    window.location.href = '/login';
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('vpass_user', JSON.stringify(next));
      return next;
    });
  };

  // Sync latest profile fields from cloud database on session mount/token change
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiRequest('/auth/me')
      .then((freshUser) => {
        if (!cancelled && freshUser && freshUser.id) {
          updateUser(freshUser);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
