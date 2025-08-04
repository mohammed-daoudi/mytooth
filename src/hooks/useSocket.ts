import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/components/AuthProvider';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to Socket.IO server
      socketRef.current = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
        auth: {
          token: localStorage.getItem('auth-token'),
          userId: user.userId,
          role: user.role
        }
      });

      // Connection handlers
      socketRef.current.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Subscribe to appointment updates
  const subscribeToAppointmentUpdates = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('appointment_updated', callback);
      socketRef.current.on('appointment_created', callback);
      socketRef.current.on('appointment_cancelled', callback);
    }
  };

  // Subscribe to patient updates
  const subscribeToPatientUpdates = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('patient_updated', callback);
    }
  };

  // Unsubscribe from events
  const unsubscribe = (event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  // Emit events
  const emit = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    subscribeToAppointmentUpdates,
    subscribeToPatientUpdates,
    unsubscribe,
    emit
  };
};
