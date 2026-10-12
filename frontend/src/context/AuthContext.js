import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, token]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ username, password });
      const data = response.data;
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles || [],
      });
      setToken(data.token);
      setLoading(false);
      return { success: true, data };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Helper flags
  const roles = user?.roles || [];
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
  const isOwner = roles.includes('ROLE_THEATER_OWNER') || roles.includes('THEATER_OWNER');
  const isCustomer = roles.includes('ROLE_CUSTOMER') || roles.includes('CUSTOMER') || (!isAdmin && !isOwner && !!user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        isAdmin,
        isOwner,
        isCustomer,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
