"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Download,
  Share2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BookingData {
  id: string;
  patient: {
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
    address?: string;
    emergencyContact?: string;
  };
  dentist: {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    profileImage?: string;
    rating?: number;
  };
  service: {
    name: string;
    duration: number;
    price: number;
    category: string;
    description: string;
  };
  startsAt: string;
  endsAt: string;
  status: string;
  notes?: string;
  createdAt: string;
}

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bookingId = searchParams.get('id');
    if (!bookingId) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    fetchBookingDetails(bookingId);
  }, [searchParams]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setBooking(result.booking);
      } else {
        setError('Failed to load booking details');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('An error occurred while loading booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadConfirmation = async () => {
    if (!booking || !pdfRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `booking-confirmation-${booking.id.slice(-8).toUpperCase()}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareAppointment = () => {
    if (navigator.share && booking) {
      const startTime = new Date(booking.startsAt);
      navigator.share({
        title: 'Dental Appointment Confirmation',
        text: `I have a dental appointment on ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()}`,
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-2">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const startTime = new Date(booking.startsAt);
  const endTime = new Date(booking.endsAt);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div ref={pdfRef} className="container mx-auto px-4 py-8">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Your dental appointment has been successfully scheduled
            </p>
            <Badge className="mt-2 bg-green-600">
              Booking ID: #{booking.id.slice(-8).toUpperCase()}
            </Badge>
          </motion.div>

          {/* Appointment Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Main Appointment Info */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointment Details
                </CardTitle>
                <CardDescription>
                  Please save this information for your records
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                    <p className="font-medium text-lg">{startTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                    <p className="font-medium text-lg">
                      {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                      {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Dentist Information */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Your Dentist
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <p className="font-medium">{booking.dentist.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {booking.dentist.specialization}
                    </p>
                  </div>
                </div>

                {/* Service Information */}
                {booking.service && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Service</h4>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <p className="font-medium">{booking.service.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Duration: {booking.service.duration} minutes
                      </p>
                      {booking.service.price && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Fee: ${booking.service.price}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {booking.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Notes</h4>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <p className="text-slate-700 dark:text-slate-300">{booking.notes}</p>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="space-y-2">
                  <h4 className="font-medium">Status</h4>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {booking.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Clinic Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-cyan-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-cyan-600" />
                  <span>info@mytooth.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-cyan-600" />
                  <span>123 Dental Street, Health City, HC 12345</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleDownloadConfirmation}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={downloading}
                  >
                    <Download className={`h-4 w-4 ${downloading ? 'animate-spin' : ''}`} />
                    {downloading ? 'Generating PDF...' : 'Download Confirmation'}
                  </Button>

                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <Button
                      onClick={handleShareAppointment}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share Appointment
                    </Button>
                  )}

                  <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                    <Link href="/dashboard">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Important Reminders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <ul className="space-y-1 list-disc list-inside">
                  <li>Please arrive 15 minutes before your appointment time</li>
                  <li>Bring a valid ID and insurance card if applicable</li>
                  <li>If you need to reschedule, please call at least 24 hours in advance</li>
                  <li>You will receive an email confirmation shortly</li>
                  <li>A reminder will be sent 24 hours before your appointment</li>
                </ul>
              </CardContent>
            </Card>

            {/* PDF Footer - Only visible in PDF */}
            <div className="hidden print:block mt-8 pt-8 border-t border-gray-300">
              <div className="text-center text-sm text-gray-600">
                <p>Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                <p>MyTooth Dental Clinic - Professional Dental Care</p>
                <p>This is an official confirmation of your appointment booking.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
