"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  UserCog,
  Search,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  Award,
  Users
} from 'lucide-react';
import Link from 'next/link';

interface Dentist {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string[];
  experience: number;
  education: string[];
  bio?: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  location?: string;
  availableDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  createdAt: string;
  profileImage?: string;
}

export default function AdminDentistsPage() {
  const { hasRole } = useAuth();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDentists = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');

      const response = await fetch('/api/dentists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dentists');
      }

      const data = await response.json();
      setDentists(data.dentists || []);
    } catch (err) {
      console.error('Error fetching dentists:', err);
      setError('Failed to load dentists');
      // Mock data for development
      setDentists([
        {
          _id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'dr.johnson@mytooth.com',
          phone: '+1234567890',
          specialization: ['General Dentistry', 'Cosmetic Dentistry'],
          experience: 8,
          education: ['DDS - University of California', 'Cosmetic Dentistry Certificate'],
          bio: 'Experienced dentist specializing in cosmetic and general dentistry.',
          isActive: true,
          rating: 4.8,
          reviewCount: 124,
          location: 'Downtown Clinic',
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          name: 'Dr. Michael Brown',
          email: 'dr.brown@mytooth.com',
          phone: '+1234567891',
          specialization: ['Orthodontics', 'Pediatric Dentistry'],
          experience: 12,
          education: ['DDS - Harvard University', 'Orthodontics Residency'],
          bio: 'Specialist in orthodontics and pediatric dental care.',
          isActive: true,
          rating: 4.9,
          reviewCount: 89,
          location: 'Uptown Clinic',
          availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
          workingHours: {
            start: '08:00',
            end: '16:00'
          },
          createdAt: '2024-01-10T09:00:00Z'
        },
        {
          _id: '3',
          name: 'Dr. Emily Davis',
          email: 'dr.davis@mytooth.com',
          phone: '+1234567892',
          specialization: ['Endodontics', 'General Dentistry'],
          experience: 6,
          education: ['DDS - Stanford University', 'Endodontics Specialty'],
          bio: 'Expert in root canal therapy and endodontic treatments.',
          isActive: false,
          rating: 4.7,
          reviewCount: 56,
          location: 'Westside Clinic',
          availableDays: ['Tuesday', 'Thursday', 'Saturday'],
          workingHours: {
            start: '10:00',
            end: '18:00'
          },
          createdAt: '2024-01-20T14:15:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDentists();
  }, [fetchDentists]);

  const toggleDentistStatus = async (dentistId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/admin/dentists/${dentistId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update dentist status');
      }

      setSuccess(`Dentist status updated successfully`);
      fetchDentists();
    } catch (err) {
      setError('Failed to update dentist status');
    }
  };

  const filteredDentists = dentists.filter(dentist =>
    dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dentist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dentist.specialization.some(spec =>
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Check access first
  if (!hasRole(['ADMIN'])) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h1>
          <p className="text-red-600 mb-4">You don't have permission to access dentist management.</p>
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
                  Dentist Management
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Manage dentist profiles, specializations, and schedules
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/admin/dentists/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Dentist
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

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search dentists by name, email, or specialization..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dentists Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Dentists ({filteredDentists.length})
                </CardTitle>
                <CardDescription>
                  Manage dentist profiles and their availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading dentists...</p>
                  </div>
                ) : filteredDentists.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCog className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No dentists found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dentist</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Schedule</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDentists.map((dentist) => (
                          <TableRow key={dentist._id} className={!dentist.isActive ? 'opacity-50' : ''}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {dentist.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                  <p className="font-medium">{dentist.name}</p>
                                  <div className="flex items-center text-sm text-slate-600">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {dentist.email}
                                  </div>
                                  {dentist.phone && (
                                    <div className="flex items-center text-sm text-slate-600">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {dentist.phone}
                                    </div>
                                  )}
                                  {dentist.location && (
                                    <div className="flex items-center text-sm text-slate-600">
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {dentist.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {dentist.specialization.map((spec, index) => (
                                  <Badge key={index} variant="outline" className="mr-1 mb-1">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Award className="h-4 w-4 text-yellow-600 mr-1" />
                                <span className="font-medium">{dentist.experience} years</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-medium">{dentist.rating}</span>
                                <span className="text-sm text-slate-600">
                                  ({dentist.reviewCount} reviews)
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">
                                  {dentist.workingHours.start} - {dentist.workingHours.end}
                                </p>
                                <p className="text-slate-600">
                                  {dentist.availableDays.length} days/week
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={dentist.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {dentist.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleDentistStatus(dentist._id, dentist.isActive)}
                                  className="text-xs"
                                >
                                  {dentist.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/dentists/${dentist._id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/dentists/${dentist._id}/edit`}>
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
