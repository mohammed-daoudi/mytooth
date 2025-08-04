"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Car,
  Bus,
  Navigation,
  MessageSquare,
  Calendar,
  Heart,
  Stethoscope,
  Shield,
  Users
} from 'lucide-react';

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  preferredContact: z.enum(['email', 'phone']).refine(val => val, {
    message: 'Please select a preferred contact method',
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const contactInfo = {
  address: {
    street: '123 Dental Street',
    city: 'Health City',
    state: 'HC',
    zip: '12345',
    full: '123 Dental Street, Health City, HC 12345'
  },
  phone: {
    main: '(555) 123-TOOTH',
    emergency: '(555) 123-7911'
  },
  email: {
    main: 'info@mytooth.com',
    appointments: 'appointments@mytooth.com',
    emergency: 'emergency@mytooth.com'
  },
  hours: {
    weekdays: 'Monday - Friday: 8:00 AM - 6:00 PM',
    saturday: 'Saturday: 9:00 AM - 4:00 PM',
    sunday: 'Sunday: Emergency Only'
  }
};

const departmentCards = [
  {
    title: 'General Inquiries',
    icon: MessageSquare,
    description: 'Questions about our services, insurance, or general information',
    contact: contactInfo.email.main,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Appointments',
    icon: Calendar,
    description: 'Schedule, reschedule, or cancel appointments',
    contact: contactInfo.email.appointments,
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Emergency Care',
    icon: Shield,
    description: '24/7 emergency dental care and urgent consultations',
    contact: contactInfo.phone.emergency,
    color: 'from-red-500 to-orange-500'
  },
  {
    title: 'Patient Services',
    icon: Users,
    description: 'Billing, insurance claims, and patient support',
    contact: contactInfo.phone.main,
    color: 'from-purple-500 to-violet-500'
  }
];

const faqs = [
  {
    question: 'Do you accept my insurance?',
    answer: 'We accept most major dental insurance plans. Please call us to verify your specific coverage.'
  },
  {
    question: 'How do I schedule an emergency appointment?',
    answer: 'For dental emergencies, call our 24/7 hotline at (555) 123-7911. We provide same-day emergency care.'
  },
  {
    question: 'What should I bring to my first appointment?',
    answer: 'Please bring a valid ID, insurance card, list of current medications, and any previous dental records.'
  },
  {
    question: 'Do you offer payment plans?',
    answer: 'Yes, we offer flexible payment plans and financing options to make dental care affordable for everyone.'
  }
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Contact form submitted:', data);
      setSubmitSuccess(true);
      reset();

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Contact My Tooth
            </h1>
            <p className="text-xl lg:text-2xl text-slate-300 mb-8">
              Get in touch with our dental care team. We're here to help with all your
              dental needs and answer any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="dental-gradient">
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 dark:hover:bg-gray-800 dark:hover:text-white">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the best way to reach us. Our team is ready to assist you with
              appointments, questions, or emergency care.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {departmentCards.map((department, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full text-center hover-lift border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-r ${department.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <department.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{department.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 mb-4">
                      {department.description}
                    </CardDescription>
                    <Badge variant="outline" className="text-sm">
                      {department.contact}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitSuccess && (
                    <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Thank you for your message! We'll get back to you within 24 hours.
                      </AlertDescription>
                    </Alert>
                  )}

                  {submitError && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          {...register('name')}
                          className="mt-2"
                        />
                        {errors.name && (
                          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          {...register('email')}
                          className="mt-2"
                        />
                        {errors.email && (
                          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          {...register('phone')}
                          className="mt-2"
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="preferredContact">Preferred Contact *</Label>
                        <select
                          id="preferredContact"
                          {...register('preferredContact')}
                          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="">Select method</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                        </select>
                        {errors.preferredContact && (
                          <p className="text-sm text-red-600 mt-1">{errors.preferredContact.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        {...register('subject')}
                        className="mt-2"
                      />
                      {errors.subject && (
                        <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        placeholder="Please provide details about your inquiry or concern..."
                        {...register('message')}
                        className="mt-2"
                      />
                      {errors.message && (
                        <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full dental-gradient"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Message...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="h-4 w-4" />
                          <span>Send Message</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information & Map */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Contact Details */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Visit Our Clinic</CardTitle>
                  <CardDescription>
                    We're conveniently located in the heart of Health City
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-cyan-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Address</h4>
                        <p className="text-slate-600">{contactInfo.address.full}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-cyan-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Phone</h4>
                        <p className="text-slate-600">{contactInfo.phone.main}</p>
                        <p className="text-sm text-red-600">Emergency: {contactInfo.phone.emergency}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-cyan-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Email</h4>
                        <p className="text-slate-600">{contactInfo.email.main}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-cyan-600 mt-1" />
                      <div>
                        <h4 className="font-semibold">Hours</h4>
                        <div className="text-slate-600 text-sm space-y-1">
                          <p>{contactInfo.hours.weekdays}</p>
                          <p>{contactInfo.hours.saturday}</p>
                          <p className="text-red-600">{contactInfo.hours.sunday}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transportation Options */}
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Getting Here</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-slate-400" />
                        <span>Free Parking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Bus className="h-4 w-4 text-slate-400" />
                        <span>Bus Routes 15, 23</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Navigation className="h-4 w-4 text-slate-400" />
                        <span>GPS Accessible</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-slate-400" />
                        <span>ADA Compliant</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Google Maps Embed */}
              <Card className="border-0 shadow-xl">
                <CardContent className="p-0">
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3048.4!2d-122.4194!3d37.7749!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDQ2JzI5LjYiTiAxMjLCsDI1JzA5LjgiVw!5e0!3m2!1sen!2sus!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="My Tooth Dental Clinic Location"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Find quick answers to common questions about our services and procedures.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Schedule Your Visit?
            </h2>
            <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
              Don't wait to take care of your dental health. Book an appointment today
              and experience the My Tooth difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-cyan-600 hover:bg-gray-100">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-cyan-600">
                <Phone className="mr-2 h-5 w-5" />
                Call Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
