"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/components/SocketProvider';
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
  Phone
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, isFuture } from 'date-fns';

// Mock data for appointments
const mockAppointments = [
  {
    id: '1',
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

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { notifications, isConnected } = useSocket();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [selectedTab, setSelectedTab] = useState('overview');

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

  const upcomingAppointments = appointments.filter(apt => isFuture(apt.appointmentDate));
  const pastAppointments = appointments.filter(apt => isPast(apt.appointmentDate));
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
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
                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-xl text-slate-600">
                Manage your appointments and dental health all in one place.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-slate-600">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
              <Button className="dental-gradient" asChild>
                <Link href="/booking">
                  <Plus className="mr-2 h-4 w-4" />
                  New Appointment
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
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                  selectedTab === tab.id
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
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
                          <Button variant="outline" className="w-full" onClick={() => setSelectedTab('notifications')}>
                            View All Notifications
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {selectedTab === 'appointments' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                    <CardDescription>
                      View and manage your dental appointments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {appointments.map((appointment) => {
                        const timeInfo = getAppointmentTimeInfo(appointment.appointmentDate);
                        return (
                          <Card key={appointment.id} className="border shadow-sm">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold">{appointment.service.name}</h3>
                                  <p className="text-sm text-slate-600">{appointment.dentist.name}</p>
                                </div>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {getStatusIcon(appointment.status)}
                                  <span className="ml-1">{appointment.status}</span>
                                </Badge>
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
                                  {isFuture(appointment.appointmentDate) && (
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
              </motion.div>
            )}

            {selectedTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>All Notifications</CardTitle>
                    <CardDescription>
                      Stay updated with your appointment status and clinic news
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
              </motion.div>
            )}

            {selectedTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
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
                        <Badge variant="outline" className="mt-1">
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
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
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
      </div>
    </div>
  );
}
