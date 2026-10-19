import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore authenticated session from httpOnly cookie on startup
  const checkAuth = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      // 401 on startup is normal for guests, clear user
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error('Unexpected response format from server');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const register = async ({ username, email, password, fullName }) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', {
        username,
        email,
        password,
        fullName
      });
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error('Unexpected response format from server');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API notification error:', err.message);
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
