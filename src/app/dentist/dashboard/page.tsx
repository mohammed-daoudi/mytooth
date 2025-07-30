"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Activity,
  Plus,
  Edit,
  Save,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';

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

interface DentistStats {
  todayAppointments: number;
  pendingCount: number;
  completedToday: number;
}

export default function DentistDashboard() {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<DentistStats>({
    todayAppointments: 0,
    pendingCount: 0,
    completedToday: 0
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [appointmentNotes, setAppointmentNotes] = useState<{ [key: string]: string }>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');

      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);

      const response = await fetch(`/api/dentist/appointments?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
      setStats(data.stats || { todayAppointments: 0, pendingCount: 0, completedToday: 0 });

      // Initialize notes state
      const notesMap: { [key: string]: string } = {};
      data.appointments?.forEach((apt: Appointment) => {
        notesMap[apt._id] = apt.notes || '';
      });
      setAppointmentNotes(notesMap);

    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
      // Mock data for development
      setAppointments([
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
          status: 'CONFIRMED',
          symptoms: 'Regular checkup',
          notes: '',
          price: 100,
          paymentStatus: 'PAID'
        }
      ]);
      setStats({ todayAppointments: 1, pendingCount: 0, completedToday: 0 });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/dentist/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      setSuccess('Appointment status updated successfully');
      fetchAppointments();
    } catch (err) {
      setError('Failed to update appointment status');
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
  }, [fetchAppointments]);

  // Redirect non-dentist users
  if (!hasRole(['DENTIST', 'ADMIN'])) {
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
              <Button className="bg-green-600 hover:bg-green-700" asChild>
                <Link href="/dentist/availability">
                  <Calendar className="mr-2 h-4 w-4" />
                  Manage Availability
                </Link>
              </Button>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
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
                                    onValueChange={(status) => updateAppointmentStatus(appointment._id, status)}
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
                    <CardDescription>Quick actions and patient insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-medium text-slate-900 dark:text-white">Quick Actions</h3>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            View All Appointments
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Patient History
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <FileText className="mr-2 h-4 w-4" />
                            Clinical Notes
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Activity className="mr-2 h-4 w-4" />
                            Treatment Plans
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-medium text-slate-900 dark:text-white">Today's Summary</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium">Total Appointments</span>
                            <Badge variant="secondary">{stats.todayAppointments}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium">Completed</span>
                            <Badge className="bg-green-100 text-green-800">{stats.completedToday}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <span className="text-sm font-medium">Pending</span>
                            <Badge className="bg-yellow-100 text-yellow-800">{stats.pendingCount}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
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
