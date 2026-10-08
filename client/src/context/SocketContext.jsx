import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      // Socket connected
    });

    newSocket.on('online-users-updated', (ids) => {
      setOnlineUserIds(ids || []);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // When user signs in or changes, broadcast presence
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('user-connected', user._id);
    }
  }, [socket, user]);

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUserIds.includes(userId.toString());
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUserIds, isUserOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
