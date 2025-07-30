"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface BookingDetails {
  dentist: {
    name: string;
    specialization: string;
    consultationFee: number;
  };
  service: {
    name: string;
    duration: number;
    price: number;
  };
  dateTime: string;
  notes?: string;
}

function BookingConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get booking details from URL params
    const dentistId = searchParams.get('dentistId');
    const serviceId = searchParams.get('serviceId');
    const datetime = searchParams.get('datetime');
    const notes = searchParams.get('notes');

    console.log('🔍 [CONFIRMATION] Received URL params:', {
      dentistId,
      serviceId,
      datetime,
      notes,
    });

    if (!dentistId || !datetime) {
      console.error('❌ [CONFIRMATION] Missing required params:', { dentistId, datetime });
      setError('Missing booking information. Please try booking again.');
      return;
    }

    // Fetch booking details
    fetchBookingDetails(dentistId, serviceId, datetime, notes);
  }, [searchParams]);

  const fetchBookingDetails = async (dentistId: string, serviceId: string | null, datetime: string, notes: string | null) => {
    try {
      console.log('🔍 [CONFIRMATION] Fetching booking details for:', { dentistId, serviceId });

      // Mock dentist data as fallback
      const mockDentists = [
        { id: '1', name: 'Dr. Sarah Johnson', specialization: 'General & Cosmetic Dentistry', consultationFee: 100 },
        { id: '2', name: 'Dr. Michael Chen', specialization: 'Orthodontics & Pediatric Care', consultationFee: 120 },
        { id: '3', name: 'Dr. Emily Rodriguez', specialization: 'Oral Surgery & Implants', consultationFee: 150 }
      ];

      let dentistData = null;
      let serviceData = null;

      // Try to fetch dentist details, fall back to mock data
      try {
        const dentistRes = await fetch(`/api/dentists/${dentistId}`);
        if (dentistRes.ok) {
          dentistData = await dentistRes.json();
          console.log('✅ [CONFIRMATION] Dentist data fetched from API:', dentistData);
        } else {
          throw new Error(`Dentist API returned ${dentistRes.status}`);
        }
      } catch (dentistError) {
        console.warn('⚠️ [CONFIRMATION] Dentist API failed, using mock data:', dentistError);
        dentistData = mockDentists.find(d => d.id === dentistId) || mockDentists[0];
      }

      // Try to fetch service details if provided
      if (serviceId && serviceId !== '') {
        try {
          const serviceRes = await fetch(`/api/services/${serviceId}`);
          if (serviceRes.ok) {
            serviceData = await serviceRes.json();
            console.log('✅ [CONFIRMATION] Service data fetched from API:', serviceData);
          } else {
            throw new Error(`Service API returned ${serviceRes.status}`);
          }
        } catch (serviceError) {
          console.warn('⚠️ [CONFIRMATION] Service API failed:', serviceError);
          // Will use default consultation service below
        }
      }

      setBookingDetails({
        dentist: {
          name: dentistData?.name || 'Dr. Smith',
          specialization: dentistData?.specialization || 'General Dentistry',
          consultationFee: dentistData?.consultationFee || 100
        },
        service: serviceData ? {
          name: serviceData.name,
          duration: serviceData.duration,
          price: serviceData.price
        } : {
          name: 'Consultation',
          duration: 60,
          price: dentistData?.consultationFee || 100
        },
        dateTime: datetime,
        notes: notes || undefined
      });

      console.log('✅ [CONFIRMATION] Booking details set successfully');
    } catch (error) {
      console.error('❌ [CONFIRMATION] Error fetching booking details:', error);
      setError('Failed to load booking details. Please try again.');
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingDetails) return;

    setIsConfirming(true);
    setError(null);

    try {
      const dentistId = searchParams.get('dentistId');
      const serviceId = searchParams.get('serviceId');

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          dentistId,
          serviceId: serviceId || null,
          startsAt: bookingDetails.dateTime,
          notes: bookingDetails.notes
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to success page
        router.push(`/bookings/success?id=${result.booking._id || result.booking.id}`);
      } else {
        setError(result.error || 'Failed to confirm booking');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">Booking Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={handleGoBack} variant="outline">
              Go Back
            </Button>
            <Button onClick={() => router.push('/booking')}>
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  const formattedDateTime = new Date(bookingDetails.dateTime);
  const totalPrice = bookingDetails.service.price;

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
            <Button variant="ghost" onClick={handleGoBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Confirm Your Appointment
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Please review your appointment details before confirming
              </p>
            </div>
          </motion.div>

          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Name:</span>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Phone:</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-cyan-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Date</span>
                    </div>
                    <p className="font-medium">{formattedDateTime.toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cyan-600" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Time</span>
                    </div>
                    <p className="font-medium">{formattedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Dentist</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bookingDetails.dentist.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{bookingDetails.dentist.specialization}</p>
                    </div>
                    <Badge variant="outline">Specialist</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Service</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bookingDetails.service.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{bookingDetails.service.duration} minutes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${bookingDetails.service.price}</p>
                    </div>
                  </div>
                </div>

                {bookingDetails.notes && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Notes</h4>
                      <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                        {bookingDetails.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{bookingDetails.service.name}</span>
                    <span>${bookingDetails.service.price}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confirmation Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      By confirming this appointment, you agree to our terms and conditions.
                      You will receive a confirmation email shortly.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={handleGoBack}
                      disabled={isConfirming}
                    >
                      Go Back
                    </Button>
                    <Button
                      onClick={handleConfirmBooking}
                      disabled={isConfirming}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      {isConfirming ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Confirming...</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm Appointment
                        </>
                      )}
                    </Button>
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

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingConfirmContent />
    </Suspense>
  );
}
