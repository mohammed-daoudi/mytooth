"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  dentistId: {
    _id: string;
    name: string;
    email: string;
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
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  createdAt: string;
}

interface Filters {
  status?: string;
  dentistId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export default function AdminBookingsPage() {
  const { hasRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [dentists, setDentists] = useState<Array<{_id: string, name: string}>>([]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');

      // Build query params
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.dentistId) params.append('dentistId', filters.dentistId);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await fetch(`/api/admin/bookings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
      // Mock data for development
      setAppointments([
        {
          _id: '1',
          userId: {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890'
          },
          dentistId: {
            _id: '1',
            name: 'Dr. Sarah Johnson',
            email: 'dr.johnson@mytooth.com'
          },
          serviceId: {
            _id: '1',
            name: 'Dental Cleaning',
            duration: 60,
            price: 100,
            category: 'General'
          },
          startsAt: '2024-02-15T10:00:00Z',
          status: 'PENDING',
          symptoms: 'Regular checkup',
          price: 100,
          paymentStatus: 'PENDING',
          createdAt: '2024-02-10T10:00:00Z'
        },
        {
          _id: '2',
          userId: {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+1234567891'
          },
          dentistId: {
            _id: '1',
            name: 'Dr. Sarah Johnson',
            email: 'dr.johnson@mytooth.com'
          },
          serviceId: {
            _id: '2',
            name: 'Root Canal',
            duration: 120,
            price: 800,
            category: 'Endodontics'
          },
          startsAt: '2024-02-16T14:00:00Z',
          status: 'CONFIRMED',
          symptoms: 'Tooth pain',
          price: 800,
          paymentStatus: 'PAID',
          createdAt: '2024-02-11T10:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchDentists = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/dentists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDentists(data.dentists || []);
      }
    } catch (err) {
      console.error('Error fetching dentists:', err);
      // Mock data
      setDentists([
        { _id: '1', name: 'Dr. Sarah Johnson' },
        { _id: '2', name: 'Dr. Michael Brown' }
      ]);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchDentists();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REFUNDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        appointment.userId.name.toLowerCase().includes(searchLower) ||
        appointment.userId.email.toLowerCase().includes(searchLower) ||
        appointment.dentistId.name.toLowerCase().includes(searchLower) ||
        appointment.serviceId.name.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Check access first
  if (!hasRole(['ADMIN', 'DENTIST'])) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
          <p className="text-red-600 mb-4">You don't have permission to access booking management.</p>
          <Button asChild>
            <Link href="/admin/dashboard">Back to Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                  Booking Management
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Manage all appointments and bookings
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/admin/bookings/create">
                  <Calendar className="mr-2 h-4 w-4" />
                  New Booking
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

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search appointments..."
                        className="pl-10"
                        value={filters.search || ''}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({...filters, status: value === 'all' ? undefined : value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="NO_SHOW">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Dentist</label>
                    <Select value={filters.dentistId || 'all'} onValueChange={(value) => setFilters({...filters, dentistId: value === 'all' ? undefined : value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Dentists" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dentists</SelectItem>
                        {dentists.map((dentist) => (
                          <SelectItem key={dentist._id} value={dentist._id}>
                            {dentist.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">From Date</label>
                    <Input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">To Date</label>
                    <Input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({})}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Appointments Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments ({filteredAppointments.length})
                </CardTitle>
                <CardDescription>
                  Manage all clinic appointments and bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading appointments...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No appointments found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Dentist</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.map((appointment) => (
                          <TableRow key={appointment._id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {appointment.userId.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-medium">{appointment.userId.name}</p>
                                  <div className="flex items-center text-sm text-slate-600">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {appointment.userId.email}
                                  </div>
                                  {appointment.userId.phone && (
                                    <div className="flex items-center text-sm text-slate-600">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {appointment.userId.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{appointment.dentistId.name}</p>
                                <p className="text-sm text-slate-600">{appointment.dentistId.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{appointment.serviceId.name}</p>
                                <div className="flex items-center text-sm text-slate-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {appointment.serviceId.duration} min
                                </div>
                                <div className="flex items-center text-sm text-slate-600">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  ${appointment.serviceId.price}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {new Date(appointment.startsAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {new Date(appointment.startsAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPaymentBadgeColor(appointment.paymentStatus)}>
                                {appointment.paymentStatus}
                              </Badge>
                              <p className="text-sm text-slate-600 mt-1">
                                ${appointment.price}
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/bookings/${appointment._id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/bookings/${appointment._id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
