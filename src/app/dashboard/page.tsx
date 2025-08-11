"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  User,
  Calendar,
  MessageSquare,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  console.log('🏠 Dashboard page rendered:', { isAuthenticated, user: user?.email, role: user?.role });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                  Welcome back, {user?.name || user?.email}!
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Here's your dental care dashboard
                </p>
                <Badge variant="outline" className="mb-4">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                </Badge>
              </div>
                             <div className="flex gap-2">
                                   {user?.role?.toUpperCase() === 'DENTIST' && (
                    <Button 
                      onClick={() => window.location.href = '/dentist/dashboard'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Go to Dentist Dashboard
                    </Button>
                  )}
                 <Button className="dental-gradient" asChild>
                   <Link href="/booking">
                     <Plus className="mr-2 h-4 w-4" />
                     Book Appointment
                   </Link>
                 </Button>
               </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Link href="/booking">
              <Card className="dental-shadow hover-lift cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-cyan-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Book Appointment</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Schedule a visit</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/profile">
              <Card className="dental-shadow hover-lift cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 text-cyan-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Profile Settings</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Manage your info</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reviews">
              <Card className="dental-shadow hover-lift cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-cyan-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">Reviews</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Share feedback</p>
                </CardContent>
              </Card>
            </Link>

                         {user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'DENTIST' ? (
              <Link href="/admin">
                <Card className="dental-shadow hover-lift cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <User className="h-8 w-8 text-cyan-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Admin Panel</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Manage system</p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="dental-shadow">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-600 dark:text-slate-400">Next Appointment</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-500">No upcoming visits</p>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="dental-shadow">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest interactions with our dental clinic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Account Created</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Welcome to My Tooth Dental Clinic!</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Next Steps</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Book your first appointment to get started</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
