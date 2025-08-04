"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  notifications: Notification[];
  sendMessage: (receiverId: string, content: string, messageType?: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  isRead: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('auth-token');

      if (token) {
        // Initialize socket connection
        const newSocket = io(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '', {
          path: '/api/socket/io',
          addTrailingSlash: false,
          auth: {
            token: token,
          },
        });

        newSocket.on('connect', () => {
          console.log('Connected to socket server');
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('Disconnected from socket server');
          setIsConnected(false);
        });

        // Handle real-time notifications
        newSocket.on('notification', (notification: Record<string, unknown>) => {
          const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: notification.type as string,
            message: notification.message as string,
            data: notification.data as Record<string, unknown>,
            timestamp: notification.timestamp as string,
            isRead: false,
          };

          setNotifications(prev => [newNotification, ...prev]);

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('🦷 My Tooth', {
              body: notification.message as string,
              icon: '/favicon.ico',
            });
          }
        });

        // Handle appointment notifications
        newSocket.on('appointment:new', (data: Record<string, unknown>) => {
          const notification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'appointment',
            message: data.message as string,
            data: data.data as Record<string, unknown>,
            timestamp: data.timestamp as string,
            isRead: false,
          };
          setNotifications(prev => [notification, ...prev]);
        });

        newSocket.on('appointment:updated', (data: Record<string, unknown>) => {
          const notification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'appointment_update',
            message: data.message as string,
            data: data.data as Record<string, unknown>,
            timestamp: data.timestamp as string,
            isRead: false,
          };
          setNotifications(prev => [notification, ...prev]);
        });

        newSocket.on('appointment:reminder', (data: Record<string, unknown>) => {
          const notification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'reminder',
            message: data.message as string,
            data: data.data as Record<string, unknown>,
            timestamp: data.timestamp as string,
            isRead: false,
          };
          setNotifications(prev => [notification, ...prev]);
        });

        // Handle user status updates
        newSocket.on('user:status', (data: Record<string, unknown>) => {
          if (data.status === 'online') {
            setOnlineUsers(prev => [...prev.filter(id => id !== data.userId), data.userId as string]);
          } else {
            setOnlineUsers(prev => prev.filter(id => id !== data.userId));
          }
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      }
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const sendMessage = (receiverId: string, content: string, messageType: string = 'text') => {
    if (socket && isConnected) {
      socket.emit('message:send', {
        receiverId,
        content,
        messageType,
      });
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    notifications,
    sendMessage,
    markNotificationAsRead,
    clearAllNotifications,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
