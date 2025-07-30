'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3,
  ArrowLeft,
  Edit3,
  Trash2,
  MessageSquare
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/AuthProvider';
import { ErrorBoundary } from '@/components/GlobalErrorBoundary';
import AsyncErrorBoundary from '@/components/AsyncErrorBoundary';

interface BookingDetails {
  id: string;
  patient: {
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  dentist: {
    name: string;
    email: string;
    specialization: string;
    profileImage?: string;
  };
  service: {
    name: string;
    duration: number;
    price: number;
    category: string;
    description?: string;
  };
  startsAt: string;
  endsAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  symptoms?: string;
  notes?: string;
  clinicalNotes?: string;
  price: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock3, label: 'Pending' },
  CONFIRMED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
  COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
  NO_SHOW: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, label: 'No Show' }
};

const paymentStatusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Payment Pending' },
  PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
  FAILED: { color: 'bg-red-100 text-red-800', label: 'Payment Failed' },
  REFUNDED: { color: 'bg-purple-100 text-purple-800', label: 'Refunded' }
};

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bookings/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Booking not found');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view this booking');
        } else {
          throw new Error('Failed to load booking details');
        }
      }

      const data = await response.json();
      setBooking(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking || !user) return;

    try {
      setActionLoading('status');

      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      const data = await response.json();
      setBooking(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setActionLoading('cancel');

      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      router.push('/bookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchBookingDetails();
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-6">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Booking not found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[booking.status];
  const paymentInfo = paymentStatusConfig[booking.paymentStatus];
  const StatusIcon = statusInfo.icon;

  const canEditBooking = user?.role === 'ADMIN' || user?.role === 'DENTIST' ||
    (user?.userId === booking.patient.name && booking.status === 'PENDING');

  const canCancelBooking = user?.role === 'ADMIN' ||
    (user?.userId === booking.patient.name && ['PENDING', 'CONFIRMED'].includes(booking.status));

  return (
    <ErrorBoundary level="page">
      <AsyncErrorBoundary onRetry={fetchBookingDetails}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold">Booking Details</h1>
                  <p className="text-muted-foreground">Booking ID: {booking.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={statusInfo.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                <Badge className={paymentInfo.color}>
                  {paymentInfo.label}
                </Badge>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Appointment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {format(new Date(booking.startsAt), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.startsAt), 'h:mm a')} - {format(new Date(booking.endsAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">Service</h4>
                      <p className="text-lg">{booking.service.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.service.category}</p>
                      {booking.service.description && (
                        <p className="text-sm text-muted-foreground mt-1">{booking.service.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.service.duration} minutes
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-medium">${booking.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient & Dentist Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    People
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Patient</h4>
                    <div className="space-y-1">
                      <p className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {booking.patient.name}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {booking.patient.email}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {booking.patient.phone}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Dentist</h4>
                    <div className="space-y-1">
                      <p className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        Dr. {booking.dentist.name}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-3 w-3" />
                        {booking.dentist.specialization}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {booking.dentist.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes and Symptoms */}
            {(booking.symptoms || booking.notes || booking.clinicalNotes) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes & Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.symptoms && (
                    <div>
                      <h4 className="font-medium mb-2">Patient Symptoms</h4>
                      <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                        {booking.symptoms}
                      </p>
                    </div>
                  )}

                  {booking.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Appointment Notes</h4>
                      <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                        {booking.notes}
                      </p>
                    </div>
                  )}

                  {booking.clinicalNotes && (
                    <div>
                      <h4 className="font-medium mb-2">Clinical Notes</h4>
                      <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                        {booking.clinicalNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Service Fee</span>
                  <span>${booking.service.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Amount</span>
                  <span className="font-medium text-lg">${booking.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payment Status</span>
                  <Badge className={paymentInfo.color}>
                    {paymentInfo.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {canEditBooking && (
              <div className="mt-8 flex gap-3 flex-wrap">
                {user?.role === 'DENTIST' && booking.status === 'CONFIRMED' && (
                  <Button
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    disabled={actionLoading === 'status'}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Completed
                  </Button>
                )}

                {user?.role === 'DENTIST' && booking.status === 'CONFIRMED' && (
                  <Button
                    onClick={() => handleStatusUpdate('NO_SHOW')}
                    disabled={actionLoading === 'status'}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Mark as No Show
                  </Button>
                )}

                {user?.role === 'ADMIN' && booking.status === 'PENDING' && (
                  <Button
                    onClick={() => handleStatusUpdate('CONFIRMED')}
                    disabled={actionLoading === 'status'}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm Booking
                  </Button>
                )}

                {canCancelBooking && (
                  <Button
                    onClick={handleCancelBooking}
                    disabled={actionLoading === 'cancel'}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Cancel Booking
                  </Button>
                )}

                <Button
                  onClick={() => router.push(`/bookings/${id}/edit`)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Details
                </Button>

                <Button
                  onClick={() => router.push(`/chat?booking=${id}`)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat about Booking
                </Button>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 text-sm text-muted-foreground space-y-1">
              <p>Created: {format(new Date(booking.createdAt), 'PPpp')}</p>
              <p>Last Updated: {format(new Date(booking.updatedAt), 'PPpp')}</p>
            </div>
          </div>
        </div>
      </AsyncErrorBoundary>
    </ErrorBoundary>
  );
}
