import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  emergencyContact: z.string().optional(),
  medicalHistory: z.array(z.string()).optional(),
});

// Appointment validation schemas
export const appointmentSchema = z.object({
  dentistId: z.string().min(1, 'Please select a dentist'),
  serviceId: z.string().min(1, 'Please select a service'),
  appointmentDate: z.string().min(1, 'Please select a date'),
  appointmentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  symptoms: z.string().max(300, 'Symptoms must be less than 300 characters').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const appointmentUpdateSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  diagnosis: z.string().max(300, 'Diagnosis must be less than 300 characters').optional(),
  treatment: z.string().max(300, 'Treatment must be less than 300 characters').optional(),
  followUpRequired: z.boolean().optional(),
  followUpDate: z.string().optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
});

// Service validation schemas
export const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  category: z.enum(['general', 'cosmetic', 'orthodontics', 'surgery', 'pediatric', 'emergency']),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration must be less than 240 minutes'),
  price: z.number().min(0, 'Price must be positive'),
  requirements: z.array(z.string()).optional(),
  afterCareInstructions: z.string().max(1000, 'Instructions must be less than 1000 characters').optional(),
  painLevel: z.number().min(1).max(5).optional(),
});

// Review validation schemas
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  comment: z.string().min(1, 'Comment is required').max(500, 'Comment must be less than 500 characters'),
});

// Message validation schemas
export const messageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver is required'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message must be less than 1000 characters'),
  messageType: z.enum(['text', 'image', 'file', 'appointment', 'system']).optional(),
});

// Contact form validation
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject must be less than 100 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
});

// Search and filter schemas
export const appointmentFilterSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dentistId: z.string().optional(),
  serviceId: z.string().optional(),
});

export const serviceFilterSchema = z.object({
  category: z.enum(['general', 'cosmetic', 'orthodontics', 'surgery', 'pediatric', 'emergency']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  search: z.string().optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
