import React, { createContext, useState, useContext, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: new Date(), ...options };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
    
    // Show toast based on type
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        toast(message, { icon: '⚠️', ...options });
        break;
      default:
        toast(message, options);
    }
  }, []);

  const clearNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    showNotification,
    clearNotification,
    clearAllNotifications,
    success: (message, options) => showNotification(message, 'success', options),
    error: (message, options) => showNotification(message, 'error', options),
    info: (message, options) => showNotification(message, 'info', options),
    warning: (message, options) => showNotification(message, 'warning', options),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
