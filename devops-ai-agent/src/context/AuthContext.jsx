// AuthContext.jsx

import React, { createContext, useState, useCallback, useEffect } from 'react'; // 1. Import useEffect
import { api } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false); // Use finally to guarantee this runs
    }
  }, []);

  // 2. Add this useEffect to run the check on app startup
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const login = () => {
    window.electronAPI.onAuthSuccess(async () => {
      await checkUser();
    });
    window.electronAPI.loginWithGoogle();
  };

  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value = { user, loading, checkUser, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};