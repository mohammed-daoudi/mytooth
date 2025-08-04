"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import {
  Users,
  Calendar,
  UserCog,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Filter
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  pendingBookings: number;
  totalDentists: number;
  todayAppointments: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalDentists: 0,
    todayAppointments: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // This would fetch from multiple endpoints
        // For now, using placeholder data
        setStats({
          totalUsers: 150,
          totalBookings: 75,
          pendingBookings: 12,
          totalDentists: 8,
          todayAppointments: 15,
          recentActivity: [
            { type: 'booking', message: 'New appointment booked by John Doe', time: '2 min ago' },
            { type: 'user', message: 'New user registered: Jane Smith', time: '15 min ago' },
            { type: 'booking', message: 'Appointment cancelled by Mike Johnson', time: '1 hour ago' }
          ]
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Redirect non-admin users
  if (!hasRole(['ADMIN', 'DENTIST'])) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
          <p className="text-red-600 mb-4">You don't have permission to access the admin dashboard.</p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
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
                  Admin Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Manage your dental clinic operations
                </p>
                <Badge variant="default" className="bg-blue-600">
                  {user?.role === 'ADMIN' ? 'System Administrator' : 'Dentist Administrator'}
                </Badge>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/admin/users/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Bookings</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBookings}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Bookings</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingBookings}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Dentists</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalDentists}</p>
                  </div>
                  <UserCog className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Link href="/admin/users">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Manage Users</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">View and edit users</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/bookings">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Manage Bookings</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">View all appointments</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/dentists">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <UserCog className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Manage Dentists</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Dentist profiles</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/services">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Manage Services</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Service catalog</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system activities and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className={`h-2 w-2 rounded-full ${
                        activity.type === 'booking' ? 'bg-green-500' :
                        activity.type === 'user' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.message}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
