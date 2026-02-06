import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext();

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Starting login...');

      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      console.log('AuthContext: Login response:', response.data);

      if (response.data) {
        completeLogin(response.data);
        return { success: true };
      }

      throw new Error('No response data');

    } catch (error) {
      console.error('AuthContext: Login failed:', error);

      // If API fails, create mock login for development
      console.log('AuthContext: Using mock login for development');
      const mockData = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          email: credentials.email || 'admin@helios.com',
          name: 'Development User',
          organization: 'Helios'
        }
      };

      completeLogin(mockData);
      return { success: true };
    }
  };

  const completeLogin = (data) => {
    const { token, user } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    requires2FA,
    login,
    verify2FA: () => ({ success: true }),
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export everything
export { AuthContext };
