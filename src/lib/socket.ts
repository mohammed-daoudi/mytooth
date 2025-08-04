import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { verifyToken, TokenPayload } from './auth';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export interface SocketUser {
  userId: string;
  email: string;
  role: string;
  socketId: string;
}

const connectedUsers = new Map<string, SocketUser>();

export const initSocket = (httpServer: NetServer): ServerIO => {
  const io = new ServerIO(httpServer, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      // Allow connections without tokens (for public features)
      if (!token) {
        console.log('Socket connection without token (public access)');
        socket.data.user = null;
        return next();
      }

      const payload = verifyToken(token);
      if (!payload) {
        console.log('Invalid token in socket connection');
        socket.data.user = null;
        return next();
      }

      socket.data.user = payload;
      next();
    } catch (err) {
      console.log('Socket authentication error:', err);
      socket.data.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as TokenPayload | null;

    if (user) {
      // Add authenticated user to connected users
      connectedUsers.set(user.userId, {
        userId: user.userId,
        email: user.email,
        role: user.role,
        socketId: socket.id,
      });

      console.log(`User ${user.email} connected`);

      // Join user to their personal room
      socket.join(`user:${user.userId}`);

      // Join role-based rooms
      socket.join(`role:${user.role}`);

      // Handle appointment booking notifications
      socket.on('appointment:book', (data) => {
        // Notify dentist and admins about new appointment
        socket.to(`role:dentist`).emit('appointment:new', {
          type: 'new_appointment',
          message: `New appointment booked by ${user.email}`,
          data: data,
          timestamp: new Date().toISOString(),
        });

        socket.to(`role:admin`).emit('appointment:new', {
          type: 'new_appointment',
          message: `New appointment booked by ${user.email}`,
          data: data,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle appointment status updates
      socket.on('appointment:update', (data) => {
        // Notify patient about appointment status change
        socket.to(`user:${data.patientId}`).emit('appointment:updated', {
          type: 'appointment_update',
          message: `Your appointment has been ${data.status}`,
          data: data,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle real-time chat messages
      socket.on('message:send', (data) => {
        const { receiverId, content, messageType = 'text' } = data;

        // Send message to receiver
        socket.to(`user:${receiverId}`).emit('message:received', {
          senderId: user.userId,
          senderName: user.email,
          content,
          messageType,
          timestamp: new Date().toISOString(),
        });

        // Send confirmation to sender
        socket.emit('message:sent', {
          messageId: Date.now().toString(),
          content,
          messageType,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle typing indicators
      socket.on('typing:start', (data) => {
        socket.to(`user:${data.receiverId}`).emit('typing:started', {
          senderId: user.userId,
          senderName: user.email,
        });
      });

      socket.on('typing:stop', (data) => {
        socket.to(`user:${data.receiverId}`).emit('typing:stopped', {
          senderId: user.userId,
        });
      });

      // Handle read receipts
      socket.on('message:read', (data) => {
        socket.to(`user:${data.senderId}`).emit('message:read', {
          messageId: data.messageId,
          readBy: user.userId,
          readAt: new Date().toISOString(),
        });
      });

      // Handle user status updates
      socket.on('user:status', (data) => {
        socket.to(`role:${user.role}`).emit('user:status_updated', {
          userId: user.userId,
          status: data.status,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        connectedUsers.delete(user.userId);
        console.log(`User ${user.email} disconnected`);
      });
    } else {
      // Handle unauthenticated connections (for public features)
      console.log('Unauthenticated socket connection');

      // Allow basic public features
      socket.on('public:notification', (data) => {
        // Broadcast public notifications
        socket.broadcast.emit('public:notification', {
          ...data,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('disconnect', () => {
        console.log('Unauthenticated user disconnected');
      });
    }
  });

  return io;
};

// Utility functions for sending notifications
export const sendNotificationToUser = (io: ServerIO, userId: string, notification: Record<string, unknown>) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

export const sendNotificationToRole = (io: ServerIO, role: string, notification: Record<string, unknown>) => {
  io.to(`role:${role}`).emit('notification', notification);
};

export const broadcastToAll = (io: ServerIO, event: string, data: Record<string, unknown>) => {
  io.emit(event, data);
};

export const getConnectedUsers = (): SocketUser[] => {
  return Array.from(connectedUsers.values());
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};
