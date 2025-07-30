"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/components/SocketProvider';
import { appointmentSchema, type AppointmentInput } from '@/lib/validations';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Star,
  DollarSign,
  MapPin,
  Phone,
  Loader2
} from 'lucide-react';
import { format, addDays, isBefore, isToday } from 'date-fns';

// Service interface
interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  painLevel: number;
}

// Dentist interface
interface Dentist {
  id: string;
  name: string;
  email: string;
  specialization: string;
  experience: string;
  rating: number;
}

// Mock dentists data (until we have real API)
const mockDentists: Dentist[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'dr.johnson@mytooth.com',
    specialization: 'General & Cosmetic Dentistry',
    experience: '15 years',
    rating: 4.9
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'dr.chen@mytooth.com',
    specialization: 'Orthodontics & Oral Surgery',
    experience: '12 years',
    rating: 4.8
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'dr.rodriguez@mytooth.com',
    specialization: 'Pediatric & Family Dentistry',
    experience: '8 years',
    rating: 4.9
  }
];

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

export default function BookingPage() {
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDentist, setSelectedDentist] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
  });

  const watchedService = watch('serviceId');
  const watchedDentist = watch('dentistId');

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await fetch('/api/services');

        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const data = await response.json();
        setServices(data.services || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        // Use fallback mock data if API fails
        setServices([
          {
            id: '1',
            name: 'Regular Dental Cleaning',
            description: 'Professional teeth cleaning and polishing',
            duration: 60,
            price: 120,
            category: 'general',
            painLevel: 1
          },
          {
            id: '2',
            name: 'Teeth Whitening',
            description: 'Professional whitening treatment',
            duration: 90,
            price: 450,
            category: 'cosmetic',
            painLevel: 2
          },
          {
            id: '3',
            name: 'Dental Checkup & Exam',
            description: 'Comprehensive oral examination',
            duration: 45,
            price: 95,
            category: 'general',
            painLevel: 1
          },
          {
            id: '4',
            name: 'Root Canal Treatment',
            description: 'Treatment to save infected tooth',
            duration: 90,
            price: 650,
            category: 'general',
            painLevel: 3
          }
        ]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Set form values when selections change
  useEffect(() => {
    if (selectedService) setValue('serviceId', selectedService);
  }, [selectedService, setValue]);

  useEffect(() => {
    if (selectedDentist) setValue('dentistId', selectedDentist);
  }, [selectedDentist, setValue]);

  useEffect(() => {
    if (selectedDate) setValue('appointmentDate', format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate, setValue]);

  useEffect(() => {
    if (selectedTime) setValue('appointmentTime', selectedTime);
  }, [selectedTime, setValue]);

  const selectedServiceData = services.find(s => s.id === selectedService);
  const selectedDentistData = mockDentists.find(d => d.id === selectedDentist);

  const onSubmit = async (data: AppointmentInput) => {
    if (!isAuthenticated) {
      setError('Please log in to book an appointment');
      return;
    }

    console.log('🔍 [BOOKING] Form submission - Current state:', {
      step,
      selectedDentist,
      selectedService,
      selectedDate,
      selectedTime,
      formData: data
    });

    // Validate required selections
    if (!selectedDentist) {
      setError('Please select a dentist');
      console.error('❌ [BOOKING] No dentist selected');
      return;
    }

    if (!selectedService) {
      setError('Please select a service');
      console.error('❌ [BOOKING] No service selected');
      return;
    }

    // Validate form data
    if (!data.appointmentDate || !data.appointmentTime) {
      setError('Please select appointment date and time');
      console.error('❌ [BOOKING] Missing date/time in form data');
      return;
    }

    // Prepare data for confirmation page
    const appointmentDate = new Date(data.appointmentDate);
    const [hours, minutes] = data.appointmentTime.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Redirect to confirmation page with booking details
    const params = new URLSearchParams({
      dentistId: selectedDentist,
      serviceId: selectedService,
      datetime: appointmentDate.toISOString(),
      notes: data.notes || '',
    });

    console.log('🔍 [BOOKING] Redirecting to confirmation with params:', {
      dentistId: selectedDentist,
      serviceId: selectedService,
      datetime: appointmentDate.toISOString(),
      notes: data.notes || '',
    });

    window.location.href = `/bookings/confirm?${params.toString()}`;
  };

  const nextStep = () => {
    if (step === 1 && selectedService && selectedDentist) {
      setStep(2);
    } else if (step === 2 && selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center space-x-2">
              <span className="text-3xl">🦷</span>
              <span>Login Required</span>
            </CardTitle>
            <CardDescription>
              Please log in to book an appointment with our dental team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full dental-gradient" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (servicesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading booking options...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole={['USER', 'ADMIN', 'patient']} showLoader={true}>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Book Your Appointment
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Schedule your visit with our experienced dental team. Choose your preferred service,
            dentist, and time slot.
          </p>
          {/* Socket connection status */}
          {isConnected && (
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Real-time booking enabled</span>
            </div>
          )}
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  stepNumber <= step
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {stepNumber <= step - 1 || (stepNumber === 4 && success) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-8 h-1 mx-2 ${
                    stepNumber < step ? 'bg-cyan-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && step === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 mb-8"
          >
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-lg">{success}</AlertDescription>
            </Alert>
            <div className="space-y-4">
              <Button className="dental-gradient" asChild>
                <Link href="/dashboard">View My Appointments</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setSuccess(null);
                }}
              >
                Book Another Appointment
              </Button>
            </div>
          </motion.div>
        )}

        {step !== 4 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Booking Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>
                    {step === 1 && 'Select Service & Dentist'}
                    {step === 2 && 'Choose Date & Time'}
                    {step === 3 && 'Confirm Details'}
                  </CardTitle>
                  <CardDescription>
                    {step === 1 && 'Choose the service you need and your preferred dentist'}
                    {step === 2 && 'Pick your preferred appointment date and time'}
                    {step === 3 && 'Review your appointment details and provide additional information'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Step 1: Service & Dentist Selection */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Services */}
                      <div>
                        <Label className="text-lg font-semibold mb-4 block">Select Service</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                          {services.map((service) => (
                            <Card
                              key={service.id}
                              className={`cursor-pointer transition-all hover:shadow-lg ${
                                selectedService === service.id
                                  ? 'ring-2 ring-cyan-500 bg-cyan-50'
                                  : 'hover:shadow-md'
                              }`}
                              onClick={() => setSelectedService(service.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold">{service.name}</h3>
                                  <Badge variant="outline">${service.price}</Badge>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {service.duration} min
                                  </span>
                                  <span className="flex items-center">
                                    <span className="mr-1">Pain:</span>
                                    {[...Array(service.painLevel)].map((_, i) => (
                                      <span key={i} className="text-orange-400">●</span>
                                    ))}
                                    {[...Array(5 - service.painLevel)].map((_, i) => (
                                      <span key={i} className="text-slate-300">●</span>
                                    ))}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Dentists */}
                      <div>
                        <Label className="text-lg font-semibold mb-4 block">Choose Dentist</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                          {mockDentists.map((dentist) => (
                            <Card
                              key={dentist.id}
                              className={`cursor-pointer transition-all hover:shadow-lg ${
                                selectedDentist === dentist.id
                                  ? 'ring-2 ring-cyan-500 bg-cyan-50'
                                  : 'hover:shadow-md'
                              }`}
                              onClick={() => setSelectedDentist(dentist.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {dentist.name.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{dentist.name}</h3>
                                    <p className="text-sm text-slate-600">{dentist.specialization}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                  <span>{dentist.experience} experience</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{dentist.rating}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Date & Time Selection */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Date Selection */}
                      <div>
                        <Label className="text-lg font-semibold mb-4 block">Select Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => isBefore(date, new Date()) && !isToday(date)}
                          className="rounded-md border shadow-sm"
                        />
                      </div>

                      {/* Time Selection */}
                      {selectedDate && (
                        <div>
                          <Label className="text-lg font-semibold mb-4 block">Available Times</Label>
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                            {timeSlots.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                className={`${
                                  selectedTime === time ? 'dental-gradient' : 'hover:bg-cyan-50'
                                }`}
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Confirmation & Details */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Symptoms */}
                        <div>
                          <Label htmlFor="symptoms">Symptoms or Concerns (Optional)</Label>
                          <Textarea
                            id="symptoms"
                            placeholder="Describe any symptoms or specific concerns you'd like to discuss..."
                            className="mt-2"
                            {...register('symptoms')}
                          />
                          {errors.symptoms && (
                            <p className="text-sm text-red-600 mt-1">{errors.symptoms.message}</p>
                          )}
                        </div>

                        {/* Notes */}
                        <div>
                          <Label htmlFor="notes">Additional Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Any additional information or special requests..."
                            className="mt-2"
                            {...register('notes')}
                          />
                          {errors.notes && (
                            <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          className="w-full dental-gradient"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Booking Appointment...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>Confirm Booking</span>
                            </div>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  {step < 3 && (
                    <div className="flex justify-between pt-6">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={step === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={nextStep}
                        disabled={
                          (step === 1 && (!selectedService || !selectedDentist)) ||
                          (step === 2 && (!selectedDate || !selectedTime))
                        }
                        className="dental-gradient"
                      >
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Appointment Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5" />
                    <span>Appointment Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Patient Info */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Patient Information</h4>
                    <p className="text-sm text-slate-600">{user?.name}</p>
                    <p className="text-sm text-slate-600">{user?.email}</p>
                  </div>

                  {/* Selected Service */}
                  {selectedServiceData && (
                    <div className="p-4 bg-cyan-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Selected Service</h4>
                      <p className="font-medium">{selectedServiceData.name}</p>
                      <div className="flex items-center justify-between text-sm text-slate-600 mt-2">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {selectedServiceData.duration} minutes
                        </span>
                        <span className="flex items-center font-semibold text-cyan-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${selectedServiceData.price}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Selected Dentist */}
                  {selectedDentistData && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Your Dentist</h4>
                      <p className="font-medium">{selectedDentistData.name}</p>
                      <p className="text-sm text-slate-600">{selectedDentistData.specialization}</p>
                    </div>
                  )}

                  {/* Selected Date & Time */}
                  {selectedDate && selectedTime && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Date & Time</h4>
                      <p className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                      <p className="text-sm text-slate-600">{selectedTime}</p>
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3" />
                        <span>(555) 123-TOOTH</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span>123 Dental Street, Health City</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
