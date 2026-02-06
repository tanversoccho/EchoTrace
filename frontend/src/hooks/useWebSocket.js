import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (options = {}) => {
  const socketRef = useRef(null);
  const {
    url = 'http://localhost:5000',
    onMessage = () => {},
    autoConnect = true,
    token = localStorage.getItem('token')
  } = options;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    socketRef.current = io(url, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socketRef.current.on('message', (data) => {
      onMessage(data);
    });

    // Subscribe to default channels
    socketRef.current.emit('subscribe', {
      channels: ['tors', 'scraping', 'notifications']
    });
  }, [url, token, onMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((type, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message', { type, ...data });
      return true;
    }
    console.warn('WebSocket not connected');
    return false;
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    connect,
    disconnect,
    sendMessage
  };
};
