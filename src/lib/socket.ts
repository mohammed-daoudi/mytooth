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
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = verifyToken(token);
      if (!payload) {
        return next(new Error('Authentication error'));
      }

      socket.data.user = payload;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as TokenPayload;

    // Add user to connected users
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
        receiverId,
        content,
        messageType,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      socket.to(`user:${data.receiverId}`).emit('typing:start', {
        senderId: user.userId,
        senderName: user.email,
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`user:${data.receiverId}`).emit('typing:stop', {
        senderId: user.userId,
      });
    });

    // Handle appointment reminders
    socket.on('appointment:reminder', (data) => {
      socket.to(`user:${data.patientId}`).emit('appointment:reminder', {
        type: 'appointment_reminder',
        message: `Reminder: You have an appointment tomorrow at ${data.time}`,
        data: data,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle online status updates
    socket.emit('user:online', {
      userId: user.userId,
      status: 'online',
      timestamp: new Date().toISOString(),
    });

    // Broadcast to others that user is online
    socket.broadcast.emit('user:status', {
      userId: user.userId,
      status: 'online',
      timestamp: new Date().toISOString(),
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${user.email} disconnected`);

      // Remove user from connected users
      connectedUsers.delete(user.userId);

      // Broadcast that user is offline
      socket.broadcast.emit('user:status', {
        userId: user.userId,
        status: 'offline',
        timestamp: new Date().toISOString(),
      });
    });
  });

  return io;
};

// Utility functions for sending notifications
export const sendNotificationToUser = (io: ServerIO, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

export const sendNotificationToRole = (io: ServerIO, role: string, notification: any) => {
  io.to(`role:${role}`).emit('notification', notification);
};

export const broadcastToAll = (io: ServerIO, event: string, data: any) => {
  io.emit(event, data);
};

export const getConnectedUsers = (): SocketUser[] => {
  return Array.from(connectedUsers.values());
};

export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};
