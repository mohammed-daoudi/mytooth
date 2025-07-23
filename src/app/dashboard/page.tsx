"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/components/SocketProvider';
import Chat from '@/components/Chat';
import {
  Calendar,
  Clock,
  User,
  Bell,
  Settings,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  MessageSquare,
  Activity,
  Heart,
  Star,
  MapPin,
  Phone,
  Users,
  BarChart3,
  DollarSign,
  TrendingUp,
  Shield,
  Stethoscope,
  Search,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';

// Mock data for appointments
const mockAppointments = [
  {
    id: '1',
    patient: { name: 'John Doe', email: 'john@example.com' },
    service: { name: 'Regular Dental Cleaning', duration: 60, price: 120 },
    dentist: { name: 'Dr. Sarah Johnson', email: 'dr.johnson@mytooth.com' },
    appointmentDate: new Date(2024, 11, 25), // December 25, 2024
    appointmentTime: '10:00',
    status: 'confirmed',
    symptoms: 'Regular checkup',
    notes: 'Patient prefers morning appointments',
    createdAt: new Date(2024, 11, 20)
  },
  {
    id: '2',
    patient: { name: 'Jane Smith', email: 'jane@example.com' },
    service: { name: 'Teeth Whitening', duration: 90, price: 450 },
    dentist: { name: 'Dr. Michael Chen', email: 'dr.chen@mytooth.com' },
    appointmentDate: new Date(2024, 10, 15), // November 15, 2024
    appointmentTime: '14:30',
    status: 'completed',
    symptoms: 'Wants brighter smile',
    notes: 'Follow-up in 6 months',
    createdAt: new Date(2024, 10, 10)
  },
  {
    id: '3',
    patient: { name: 'Bob Wilson', email: 'bob@example.com' },
    service: { name: 'Dental Checkup & Exam', duration: 45, price: 95 },
    dentist: { name: 'Dr. Sarah Johnson', email: 'dr.johnson@mytooth.com' },
    appointmentDate: new Date(2024, 9, 5), // October 5, 2024
    appointmentTime: '09:00',
    status: 'completed',
    symptoms: 'Tooth sensitivity',
    notes: 'Prescribed sensitivity toothpaste',
    createdAt: new Date(2024, 9, 1)
  }
];

// Mock admin data
const mockAdminStats = {
  totalPatients: 156,
  todayAppointments: 8,
  totalRevenue: 45230,
  avgRating: 4.8,
  monthlyAppointments: [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 48 },
    { month: 'Apr', count: 61 },
    { month: 'May', count: 55 },
    { month: 'Jun', count: 67 }
  ]
};

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'patient',
    createdAt: new Date(2024, 8, 15),
    lastLogin: new Date(2024, 11, 20),
    appointmentCount: 3
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'patient',
    createdAt: new Date(2024, 7, 10),
    lastLogin: new Date(2024, 11, 18),
    appointmentCount: 5
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    email: 'dr.chen@mytooth.com',
    role: 'dentist',
    createdAt: new Date(2024, 0, 1),
    lastLogin: new Date(2024, 11, 21),
    appointmentCount: 0
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'no-show': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'scheduled': return <Clock className="h-4 w-4" />;
    case 'confirmed': return <CheckCircle className="h-4 w-4" />;
    case 'completed': return <CheckCircle className="h-4 w-4" />;
    case 'cancelled': return <XCircle className="h-4 w-4" />;
    case 'no-show': return <AlertCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

const getAppointmentTimeInfo = (date: Date) => {
  if (isToday(date)) return { text: 'Today', color: 'text-green-600' };
  if (isTomorrow(date)) return { text: 'Tomorrow', color: 'text-blue-600' };
  if (isPast(date)) return { text: 'Past', color: 'text-gray-600' };
  if (isFuture(date)) return { text: 'Upcoming', color: 'text-cyan-600' };
  return { text: '', color: 'text-gray-600' };
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'bg-purple-100 text-purple-800';
    case 'dentist': return 'bg-blue-100 text-blue-800';
    case 'patient': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { notifications, isConnected } = useSocket();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [users, setUsers] = useState(mockUsers);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is admin or dentist
  const isAdmin = user?.role === 'admin';
  const isDentist = user?.role === 'dentist';
  const isStaff = isAdmin || isDentist;

  // Filter appointments for regular users
  const userAppointments = isStaff ? appointments : appointments.filter(apt => apt.patient.email === user?.email);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <span className="text-3xl">🔒</span>
              <span>Access Denied</span>
            </CardTitle>
            <CardDescription>
              Please log in to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full dental-gradient" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingAppointments = userAppointments.filter(apt => isFuture(apt.appointmentDate));
  const pastAppointments = userAppointments.filter(apt => isPast(apt.appointmentDate));
  const unreadNotifications = notifications.filter(n => !n.isRead);

  // Admin-specific functions
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status } : apt
        )
      );
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={['admin', 'dentist', 'patient']} showLoader={true}>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                {isStaff ? 'Admin Dashboard' : `Welcome back, ${user?.name?.split(' ')[0] || 'User'}!`}
                {isStaff ? ' 🛡️' : ' 👋'}
              </h1>
              <p className="text-xl text-slate-600">
                {isStaff
                  ? 'Manage your dental practice efficiently'
                  : 'Manage your appointments and dental health all in one place.'
                }
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-slate-600">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
              <Badge className={getRoleColor(user?.role || 'patient')}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Badge>
              <Button className="dental-gradient" asChild>
                <Link href="/booking">
                  <Plus className="mr-2 h-4 w-4" />
                  {isStaff ? 'New Booking' : 'New Appointment'}
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {isStaff ? (
            // Admin Stats
            <>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-cyan-600" />
                    <span className="text-2xl font-bold text-cyan-600">{mockAdminStats.totalPatients}</span>
                  </div>
                  <p className="text-sm text-slate-600">Total Patients</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{mockAdminStats.todayAppointments}</span>
                  </div>
                  <p className="text-sm text-slate-600">Today's Appointments</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">${mockAdminStats.totalRevenue.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-600">Total Revenue</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-600">{mockAdminStats.avgRating}</span>
                  </div>
                  <p className="text-sm text-slate-600">Average Rating</p>
                </CardContent>
              </Card>
            </>
          ) : (
            // Patient Stats
            <>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-cyan-600" />
                    <span className="text-2xl font-bold text-cyan-600">{upcomingAppointments.length}</span>
                  </div>
                  <p className="text-sm text-slate-600">Upcoming</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{pastAppointments.length}</span>
                  </div>
                  <p className="text-sm text-slate-600">Completed</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Bell className="h-5 w-5 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">{unreadNotifications.length}</span>
                  </div>
                  <p className="text-sm text-slate-600">Notifications</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-600">4.9</span>
                  </div>
                  <p className="text-sm text-slate-600">Your Rating</p>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue={isStaff ? "admin-overview" : "overview"} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
              <TabsTrigger value={isStaff ? "admin-overview" : "overview"}>
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="appointments">
                <Calendar className="h-4 w-4 mr-2" />
                Appointments
              </TabsTrigger>
              {isStaff && (
                <>
                  <TabsTrigger value="users">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Admin Overview Tab */}
            {isStaff && (
              <TabsContent value="admin-overview">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Today's Appointments */}
                    <Card className="border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5" />
                          <span>Today's Appointments</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {appointments.filter(apt => isToday(apt.appointmentDate)).map((appointment) => (
                            <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                              <div>
                                <h3 className="font-semibold">{appointment.patient.name}</h3>
                                <p className="text-sm text-slate-600">{appointment.service.name}</p>
                                <p className="text-xs text-slate-500">{appointment.appointmentTime}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                                <Select
                                  value={appointment.status}
                                  onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="no-show">No Show</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ))}
                          {appointments.filter(apt => isToday(apt.appointmentDate)).length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No appointments scheduled for today</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Activity className="h-5 w-5" />
                          <span>Recent Activity</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {appointments.slice(0, 5).map((appointment) => (
                            <div key={appointment.id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {appointment.patient.name} booked {appointment.service.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {format(appointment.createdAt, 'MMM d, h:mm a')}
                                </p>
                              </div>
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions Sidebar */}
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full dental-gradient" asChild>
                          <Link href="/booking">
                            <Plus className="mr-2 h-4 w-4" />
                            New Appointment
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Export Reports
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/services">
                            <Stethoscope className="mr-2 h-4 w-4" />
                            Manage Services
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>

                    {/* System Status */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">System Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Socket Connection</span>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Database</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Notifications</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm">Active</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Regular User Overview Tab */}
            {!isStaff && (
              <TabsContent value="overview">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Next Appointment */}
                    {upcomingAppointments.length > 0 && (
                      <Card className="border-0 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5" />
                            <span>Next Appointment</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const nextAppointment = upcomingAppointments[0];
                            const timeInfo = getAppointmentTimeInfo(nextAppointment.appointmentDate);
                            return (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold text-lg">{nextAppointment.service.name}</h3>
                                    <p className="text-slate-600">with {nextAppointment.dentist.name}</p>
                                  </div>
                                  <Badge className={getStatusColor(nextAppointment.status)}>
                                    {getStatusIcon(nextAppointment.status)}
                                    <span className="ml-1">{nextAppointment.status}</span>
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>{format(nextAppointment.appointmentDate, 'EEEE, MMMM d, yyyy')}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span>{nextAppointment.appointmentTime}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-4">
                                  <span className={`text-sm font-medium ${timeInfo.color}`}>
                                    {timeInfo.text}
                                  </span>
                                  <div className="space-x-2">
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-3 w-3 mr-1" />
                                      Reschedule
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-600">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    )}

                    {/* Recent Notifications */}
                    <Card className="border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Bell className="h-5 w-5" />
                          <span>Recent Notifications</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {notifications.slice(0, 3).map((notification) => (
                              <Alert key={notification.id} className="border-l-4 border-l-cyan-500">
                                <Bell className="h-4 w-4" />
                                <AlertDescription className="flex items-center justify-between">
                                  <span>{notification.message}</span>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                                  )}
                                </AlertDescription>
                              </Alert>
                            ))}
                            {notifications.length > 3 && (
                              <Button variant="outline" className="w-full">
                                View All Notifications
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="w-full dental-gradient" asChild>
                          <Link href="/booking">
                            <Plus className="mr-2 h-4 w-4" />
                            Book Appointment
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact Support
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/services">
                            <Heart className="mr-2 h-4 w-4" />
                            View Services
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Clinic Info */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-lg">Clinic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>123 Dental Street, Health City, HC 12345</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>(555) 123-TOOTH</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <div>
                              <div>Mon-Fri: 8:00 AM - 6:00 PM</div>
                              <div>Sat: 9:00 AM - 4:00 PM</div>
                              <div>Sun: Emergency Only</div>
                            </div>
                          </div>
                        </div>
                        <Alert className="border-red-200 bg-red-50 text-red-800">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Emergency?</strong> Call (555) 123-7911 for 24/7 support
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* Appointments Tab */}
            <TabsContent value="appointments">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>{isStaff ? 'All Appointments' : 'My Appointments'}</CardTitle>
                  <CardDescription>
                    {isStaff
                      ? 'View and manage all patient appointments'
                      : 'View and manage your dental appointments'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userAppointments.map((appointment) => {
                      const timeInfo = getAppointmentTimeInfo(appointment.appointmentDate);
                      return (
                        <Card key={appointment.id} className="border shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-semibold">{appointment.service.name}</h3>
                                <p className="text-sm text-slate-600">
                                  {isStaff ? `Patient: ${appointment.patient.name}` : appointment.dentist.name}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getStatusColor(appointment.status)}>
                                  {getStatusIcon(appointment.status)}
                                  <span className="ml-1">{appointment.status}</span>
                                </Badge>
                                {isStaff && (
                                  <Select
                                    value={appointment.status}
                                    onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                                    disabled={isLoading}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="scheduled">Scheduled</SelectItem>
                                      <SelectItem value="confirmed">Confirmed</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                      <SelectItem value="no-show">No Show</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-3 w-3" />
                                <span>{format(appointment.appointmentDate, 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-3 w-3" />
                                <span>{appointment.appointmentTime}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${timeInfo.color}`}>
                                {timeInfo.text}
                              </span>
                              <div className="space-x-2">
                                {(isFuture(appointment.appointmentDate) || isStaff) && (
                                  <>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-red-600">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                                {isPast(appointment.appointmentDate) && appointment.status === 'completed' && (
                                  <Button variant="outline" size="sm">
                                    <Star className="h-3 w-3 mr-1" />
                                    Review
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab (Admin only) */}
            {isStaff && (
              <TabsContent value="users">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage patients, dentists, and admin users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.map((user) => (
                        <Card key={user.id} className="border shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <h3 className="font-semibold">{user.name}</h3>
                                  <p className="text-sm text-slate-600">{user.email}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge className={getRoleColor(user.role)}>
                                      {user.role}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                      {user.appointmentCount} appointments
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right text-sm">
                                  <p className="text-slate-600">Joined {format(user.createdAt, 'MMM yyyy')}</p>
                                  <p className="text-slate-500">Last seen {format(user.lastLogin, 'MMM d')}</p>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                {user.role !== 'admin' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() => deleteUser(user.id)}
                                    disabled={isLoading}
                                  >
                                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Analytics Tab (Admin only) */}
            {isStaff && (
              <TabsContent value="analytics">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle>Monthly Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mockAdminStats.monthlyAppointments.map((month) => (
                          <div key={month.month} className="flex items-center justify-between">
                            <span className="text-sm font-medium">{month.month}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-cyan-500 h-2 rounded-full"
                                  style={{ width: `${(month.count / 70) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-slate-600 w-8">{month.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl">
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">94%</div>
                          <div className="text-sm text-green-700">Show Rate</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">4.8</div>
                          <div className="text-sm text-blue-700">Avg Rating</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">87%</div>
                          <div className="text-sm text-purple-700">Retention</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">23min</div>
                          <div className="text-sm text-orange-700">Avg Wait</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>All Notifications</CardTitle>
                  <CardDescription>
                    Stay updated with appointment status and clinic news
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                      <p>You're all caught up! We'll notify you of any updates.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <Alert key={notification.id} className="border-l-4 border-l-cyan-500">
                          <Bell className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <div>
                                <p>{notification.message}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{user?.name}</h3>
                      <p className="text-slate-600">{user?.email}</p>
                      <Badge className={getRoleColor(user?.role || 'patient')} variant="outline">
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{user?.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>{user?.email}</span>
                        </div>
                        {user?.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Account Settings</h4>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Bell className="mr-2 h-4 w-4" />
                          Notification Settings
                        </Button>
                        {isStaff && (
                          <Button variant="outline" className="w-full justify-start">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Settings
                          </Button>
                        )}
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
