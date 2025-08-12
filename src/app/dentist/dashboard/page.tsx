"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useSocket } from '@/hooks/useSocket';
import Link from 'next/link';
import { Calendar, Users, Clock, CheckCircle, AlertTriangle, MessageSquare, FileText, Activity, Plus, Edit, Save, Phone, Mail, DollarSign, Eye, Heart, MapPin, User } from 'lucide-react';

interface Appointment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  serviceId: {
    _id: string;
    name: string;
    duration: number;
    price: number;
    category: string;
  };
  startsAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  symptoms?: string;
  notes?: string;
  price: number;
  paymentStatus: string;
}

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string[];
  totalVisits: number;
  lastVisit?: string;
  nextAppointment?: string;
  recentAppointments: Appointment[];
}

interface DentistStats {
  todayAppointments: number;
  pendingCount: number;
  completedToday: number;
}

interface PatientAppointment extends Appointment {
  serviceName: string;
  serviceCategory: string;
  serviceDuration: number;
  servicePrice: number;
  formattedDate: string;
  formattedTime: string;
}

export default function DentistDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { subscribeToAppointmentUpdates, subscribeToPatientUpdates, unsubscribe } = useSocket();
  
  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentNotes, setAppointmentNotes] = useState<Record<string, string>>({});
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  
  // Patient state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<PatientAppointment[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);
  
  // Messages and status
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters and stats
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<DentistStats>({
    todayAppointments: 0,
    pendingCount: 0,
    completedToday: 0
  });

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append('date', selectedDate);
      }

      // Add sorting parameters
      params.append('sort', 'startsAt');
      params.append('order', 'asc');

      const response = await fetch(`/api/dentist/appointments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }

      const data = await response.json();
      
      // Sort appointments by date and time
      const sortedAppointments = (data.appointments || []).sort((a: Appointment, b: Appointment) => {
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      });

      setAppointments(sortedAppointments);
      setStats(data.stats || { todayAppointments: 0, pendingCount: 0, completedToday: 0 });

      // Initialize notes state
      const notesMap: { [key: string]: string } = {};
      sortedAppointments.forEach((apt: Appointment) => {
        notesMap[apt._id] = apt.notes || '';
      });
      setAppointmentNotes(notesMap);

    } catch (err) {
      console.error('Error fetching appointments:', err);
<<<<<<< HEAD
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
      
      // Clear appointments on error to avoid showing stale data
      setAppointments([]);
      setStats({ todayAppointments: 0, pendingCount: 0, completedToday: 0 });
=======
      setError('Failed to load appointments. Using mock data for development.');
      // Mock data for development
      const mockAppointments = [
        {
          _id: '1',
          userId: {
            _id: '1',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+1234567890'
          },
          serviceId: {
            _id: '1',
            name: 'Dental Cleaning',
            duration: 60,
            price: 100,
            category: 'General'
          },
          startsAt: new Date().toISOString(),
          status: 'CONFIRMED' as const,
          symptoms: 'Regular checkup',
          notes: '',
          price: 100,
          paymentStatus: 'PAID'
        },
        {
          _id: '2',
          userId: {
            _id: '2',
            name: 'Monsef',
            email: 'monsef@example.com',
            phone: '+1234567891'
          },
          serviceId: {
            _id: '2',
            name: 'Root Canal',
            duration: 120,
            price: 800,
            category: 'Endodontics'
          },
          startsAt: '2025-08-15T10:00:00.000Z',
          status: 'PENDING' as const,
          symptoms: 'Severe tooth pain, sensitivity to hot and cold',
          notes: 'Patient reports intense pain in upper right molar',
          price: 800,
          paymentStatus: 'PENDING'
        },
        {
          _id: '3',
          userId: {
            _id: '3',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            phone: '+1234567892'
          },
          serviceId: {
            _id: '3',
            name: 'Dental Implant',
            duration: 180,
            price: 2500,
            category: 'Surgery'
          },
          startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          status: 'CONFIRMED' as const,
          symptoms: 'Missing tooth, wants permanent solution',
          notes: 'Patient is a good candidate for implant',
          price: 2500,
          paymentStatus: 'PAID'
        }
      ];
      setAppointments(mockAppointments);
      setStats({
        todayAppointments: mockAppointments.filter(apt => {
          const aptDate = new Date(apt.startsAt).toDateString();
          const today = new Date().toDateString();
          return aptDate === today;
        }).length,
        pendingCount: mockAppointments.filter(apt => apt.status === 'PENDING').length,
        completedToday: 0
      });
>>>>>>> b36e65c0e312fcbebc058c7d85ab696a74b3fd1e
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch patient appointments
  const fetchPatientAppointments = useCallback(async (patientId: string) => {
    try {
      setIsAppointmentsLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`/api/dentist/patients/${patientId}/appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patient appointments');
      }

      const data = await response.json();
      
      // Transform the appointments for better display
      const formattedAppointments = data.appointments.map((appt: any) => ({
        ...appt,
        serviceName: appt.serviceId?.name || 'Unknown Service',
        serviceCategory: appt.serviceId?.category || 'General',
        serviceDuration: appt.serviceId?.duration || 30,
        servicePrice: appt.serviceId?.price || 0,
        formattedDate: new Date(appt.startsAt).toLocaleDateString(),
        formattedTime: new Date(appt.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      
      setPatientAppointments(formattedAppointments);
    } catch (err) {
      console.error('Error fetching patient appointments:', err);
      setError('Failed to load patient appointments');
      setPatientAppointments([]);
    } finally {
      setIsAppointmentsLoading(false);
    }
  }, []);

  // Handle patient selection
  const handlePatientSelect = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    fetchPatientAppointments(patient._id);
  }, [fetchPatientAppointments]);

  const fetchPatients = useCallback(async () => {
    try {
      setPatientsLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/dentist/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }

      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients');
      // Fallback to mock data for demo purposes
      setPatients([
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          dateOfBirth: '1985-05-15',
          address: '123 Main St, City, State 12345',
          emergencyContact: 'Jane Doe - +1234567891',
          medicalHistory: ['Hypertension', 'Diabetes'],
          totalVisits: 5,
          lastVisit: '2024-01-15T10:00:00Z',
          nextAppointment: new Date().toISOString(),
          recentAppointments: []
        },
        {
          _id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+1234567891',
          dateOfBirth: '1990-03-20',
          address: '456 Oak Ave, City, State 12345',
          emergencyContact: 'John Doe - +1234567890',
          medicalHistory: ['Asthma'],
          totalVisits: 2,
          lastVisit: '2024-12-01T14:00:00Z',
          nextAppointment: '2025-08-15T10:00:00.000Z',
          recentAppointments: []
        },
        {
          _id: '3',
          name: 'Bob Smith',
          email: 'bob@example.com',
          phone: '+1234567892',
          dateOfBirth: '1988-07-10',
          address: '789 Pine St, City, State 12345',
          emergencyContact: 'Alice Smith - +1234567893',
          medicalHistory: [],
          totalVisits: 3,
          lastVisit: '2024-11-20T09:00:00Z',
          nextAppointment: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          recentAppointments: []
        }
<<<<<<< HEAD
      ]);
=======
      ];
      setPatients(mockPatients);
>>>>>>> b36e65c0e312fcbebc058c7d85ab696a74b3fd1e
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  const updateAppointmentStatus = async (
    appointmentId: string, 
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  ) => {
    try {
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`/api/dentist/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update appointment status');
      }

      // Optimistic UI update
      setAppointments(prevAppointments =>
        prevAppointments.map(apt =>
          apt._id === appointmentId ? { ...apt, status } : apt
        )
      );

      // Update stats based on the new status
      if (status === 'COMPLETED') {
        setStats(prev => ({
          ...prev,
          completedToday: prev.completedToday + 1,
          pendingCount: prev.pendingCount - 1
        }));
      } else if (status === 'PENDING') {
        setStats(prev => ({
          ...prev,
          pendingCount: prev.pendingCount + 1
        }));
      }

      setSuccess(`Appointment status updated to ${status.toLowerCase()} successfully`);
      
      // Refresh data to ensure consistency
      setTimeout(() => {
        fetchAppointments();
      }, 1000);
      
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update appointment status');
      
      // Revert optimistic update on error
      fetchAppointments();
    }
  };

  const saveAppointmentNotes = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      const notes = appointmentNotes[appointmentId];

      const response = await fetch(`/api/dentist/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      setSuccess('Notes saved successfully');
      setEditingAppointment(null);
      fetchAppointments();
    } catch (err) {
      setError('Failed to save notes');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();

    // Subscribe to real-time updates
    subscribeToAppointmentUpdates((data) => {
      console.log('Appointment updated:', data);
      setSuccess('Appointment updated in real-time');
      fetchAppointments(); // Refresh appointments
    });

    subscribeToPatientUpdates((data) => {
      console.log('Patient updated:', data);
      fetchPatients(); // Refresh patients
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribe('appointment_updated');
      unsubscribe('appointment_created');
      unsubscribe('appointment_cancelled');
      unsubscribe('patient_updated');
    };
  }, [fetchAppointments, fetchPatients, subscribeToAppointmentUpdates, subscribeToPatientUpdates, unsubscribe]);

  // Redirect non-dentist users
  if (!user || !user.role || (user.role !== 'DENTIST' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
          <p className="text-red-600 mb-4">You don't have permission to access the dentist dashboard.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Dentist Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Manage your appointments and patient care
                </p>
                <Badge variant="default" className="bg-green-600">
                  Dr. {user?.name || 'Dentist'}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="date-filter" className="text-sm font-medium text-slate-700">
                    Filter by Date:
                  </label>
                  <input
                    id="date-filter"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <Button className="bg-green-600 hover:bg-green-700" asChild>
                  <Link href="/dentist/availability">
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Availability
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
                ×
              </Button>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
              <Button variant="ghost" size="sm" onClick={clearMessages} className="ml-auto">
                ×
              </Button>
            </Alert>
          )}

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Today's Appointments</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.todayAppointments}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed Today</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedToday}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Patients</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{patients.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs defaultValue="appointments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="patients">Patient Management</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Appointments
                        </CardTitle>
                        <CardDescription>Manage your patient appointments</CardDescription>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Date</label>
                          <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading appointments...</p>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No appointments for this date</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div key={appointment._id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {appointment.userId.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <h3 className="font-medium text-slate-900 dark:text-white text-lg">
                                    {appointment.userId.name}
                                  </h3>
                                  <div className="flex items-center text-sm text-slate-600 space-x-4">
                                    <div className="flex items-center">
                                      <Mail className="h-3 w-3 mr-1" />
                                      {appointment.userId.email}
                                    </div>
                                    {appointment.userId.phone && (
                                      <div className="flex items-center">
                                        <Phone className="h-3 w-3 mr-1" />
                                        {appointment.userId.phone}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {new Date(appointment.startsAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <div className="flex items-center justify-end space-x-2 mt-2">
                                  <Select
                                    value={appointment.status}
                                    onValueChange={(status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW') => 
                                      updateAppointmentStatus(appointment._id, status)
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PENDING">Pending</SelectItem>
                                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                      <SelectItem value="COMPLETED">Completed</SelectItem>
                                      <SelectItem value="NO_SHOW">No Show</SelectItem>
                                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Service Details</h4>
                                <div className="space-y-1">
                                  <p className="text-sm"><span className="font-medium">Service:</span> {appointment.serviceId.name}</p>
                                  <p className="text-sm"><span className="font-medium">Category:</span> {appointment.serviceId.category}</p>
                                  <div className="flex items-center text-sm">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {appointment.serviceId.duration} minutes
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    ${appointment.serviceId.price}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Patient Information</h4>
                                {appointment.symptoms && (
                                  <div className="mb-2">
                                    <span className="text-sm font-medium">Symptoms:</span>
                                    <p className="text-sm text-slate-600">{appointment.symptoms}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-slate-900 dark:text-white">Clinical Notes</h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (editingAppointment === appointment._id) {
                                      saveAppointmentNotes(appointment._id);
                                    } else {
                                      setEditingAppointment(appointment._id);
                                    }
                                  }}
                                >
                                  {editingAppointment === appointment._id ? (
                                    <>
                                      <Save className="h-4 w-4 mr-1" />
                                      Save
                                    </>
                                  ) : (
                                    <>
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </>
                                  )}
                                </Button>
                              </div>
                              <Textarea
                                value={appointmentNotes[appointment._id] || ''}
                                onChange={(e) => setAppointmentNotes({
                                  ...appointmentNotes,
                                  [appointment._id]: e.target.value
                                })}
                                placeholder="Add clinical notes, observations, treatment details..."
                                rows={3}
                                disabled={editingAppointment !== appointment._id}
                                className="w-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Patient Management
                    </CardTitle>
                    <CardDescription>View and manage your patients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {patientsLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading patients...</p>
                      </div>
                    ) : patients.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">No patients assigned yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map((patient) => (
                          <Card 
                            key={patient._id} 
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handlePatientSelect(patient)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {patient.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-slate-900 dark:text-white">{patient.name}</h3>
                                    <p className="text-sm text-slate-600">{patient.email}</p>
                                  </div>
                                </div>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePatientSelect(patient);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="text-2xl">
                                        <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {patient.name.split(' ').map(n => n[0]).join('')}
                                          </div>
                                          <div>
                                            {patient.name}
                                            <p className="text-sm font-normal text-muted-foreground">
                                              {patient.email}
                                            </p>
                                          </div>
                                        </div>
                                      </DialogTitle>
                                      <DialogDescription>
                                        Complete patient information and appointment history
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-medium mb-3 text-lg flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
                                          </h4>
                                          <div className="space-y-3 pl-7">
                                            {patient.dateOfBirth && (
                                              <div>
                                                <p className="text-sm font-medium text-slate-500">Date of Birth</p>
                                                <p className="text-sm">
                                                  {new Date(patient.dateOfBirth).toLocaleDateString()} 
                                                  <span className="text-slate-500 ml-2">
                                                    ({Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years)
                                                  </span>
                                                </p>
                                              </div>
                                            )}
                                            {patient.phone && (
                                              <div>
                                                <p className="text-sm font-medium text-slate-500">Phone</p>
                                                <p className="text-sm">{patient.phone}</p>
                                              </div>
                                            )}
                                            {patient.address && (
                                              <div>
                                                <p className="text-sm font-medium text-slate-500">Address</p>
                                                <p className="text-sm">{patient.address}</p>
                                              </div>
                                            )}
                                            {patient.emergencyContact && (
                                              <div>
                                                <p className="text-sm font-medium text-slate-500">Emergency Contact</p>
                                                <p className="text-sm">{patient.emergencyContact}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                                          <div>
                                            <h4 className="font-medium mb-3 text-lg flex items-center gap-2">
                                              <Heart className="h-5 w-5" />
                                              Medical History
                                            </h4>
                                            <div className="flex flex-wrap gap-2 pl-7">
                                              {patient.medicalHistory.map((condition, index) => (
                                                <Badge key={index} variant="outline" className="text-sm">
                                                  {condition}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                        <div>
                                          <h4 className="font-medium mb-3 text-lg flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Visit Summary
                                          </h4>
                                          <div className="space-y-3 pl-7">
                                            <p><span className="text-sm font-medium">Total Visits:</span> {patient.totalVisits}</p>
                                            {patient.lastVisit && (
                                              <p><span className="text-sm font-medium">Last Visit:</span> {new Date(patient.lastVisit).toLocaleDateString()}</p>
                                            )}
                                            {patient.nextAppointment && (
                                              <p><span className="text-sm font-medium">Next Visit:</span> {new Date(patient.nextAppointment).toLocaleDateString()}</p>
                                            )}
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-medium mb-3 text-lg flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Appointment History
                                          </h4>
                                          
                                          {isAppointmentsLoading ? (
                                            <div className="flex justify-center py-8">
                                              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                          ) : patientAppointments.length === 0 ? (
                                            <div className="text-center py-8 text-slate-500">
                                              <p>No appointment history found</p>
                                            </div>
                                          ) : (
                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                              {patientAppointments.map((appointment) => (
                                                <div key={appointment._id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                                  <div className="flex justify-between items-start">
                                                    <div>
                                                      <p className="font-medium">{appointment.serviceName}</p>
                                                      <p className="text-sm text-slate-500">{appointment.serviceCategory}</p>
                                                    </div>
                                                    <Badge 
                                                      variant={
                                                        appointment.status === 'COMPLETED' ? 'default' : 
                                                        appointment.status === 'CANCELLED' ? 'destructive' :
                                                        'outline'
                                                      }
                                                      className="text-xs"
                                                    >
                                                      {appointment.status.replace('_', ' ')}
                                                    </Badge>
                                                  </div>
                                                  <div className="mt-2 flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                      <Calendar className="h-3.5 w-3.5" />
                                                      <span>{appointment.formattedDate}</span>
                                                      <Clock className="h-3.5 w-3.5 ml-2" />
                                                      <span>{appointment.formattedTime}</span>
                                                    </div>
                                                    <span className="font-medium">${appointment.servicePrice}</span>
                                                  </div>
                                                  {appointment.notes && (
                                                    <div className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                                      <p className="font-medium">Notes:</p>
                                                      <p className="whitespace-pre-wrap">{appointment.notes}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <DialogFooter className="mt-6">
                                        <Button variant="outline" onClick={() => {
                                          // Here you can implement a function to create a new appointment for this patient
                                          console.log('Create new appointment for:', patient._id);
                                        }}>
                                          <Plus className="h-4 w-4 mr-2" />
                                          New Appointment
                                        </Button>
                                        <Button 
                                          variant="default" 
                                          onClick={() => {
                                            // Here you can implement navigation to a more detailed patient view
                                            console.log('View full profile:', patient._id);
                                          }}
                                        >
                                          <FileText className="h-4 w-4 mr-2" />
                                          View Full Profile
                                        </Button>
                                      </DialogFooter>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">Total Visits</span>
                                  <Badge variant="secondary">{patient.totalVisits}</Badge>
                                </div>

                                {patient.lastVisit && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Last Visit</span>
                                    <span className="text-slate-900">
                                      {new Date(patient.lastVisit).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}

                                {patient.nextAppointment && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Next Visit</span>
                                    <Badge className="bg-green-100 text-green-800">
                                      {new Date(patient.nextAppointment).toLocaleDateString()}
                                    </Badge>
                                  </div>
                                )}

                                {patient.phone && (
                                  <div className="flex items-center text-sm text-slate-600">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {patient.phone}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
