"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accessibility,
  Heart,
  Shield,
  Users,
  Phone,
  Mail,
  MapPin,
  Eye,
  Ear,
  Clock,
  CheckCircle,
  FileText,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Wheelchair Accessible',
    description: 'Fully accessible entrance, restrooms, and treatment rooms with wheelchair-friendly design'
  },
  {
    icon: Eye,
    title: 'Visual Accommodations',
    description: 'Large print materials, high contrast displays, and audio descriptions available'
  },
  {
    icon: Ear,
    title: 'Hearing Assistance',
    description: 'Hearing loop systems, sign language interpreters, and written communication options'
  },
  {
    icon: Heart,
    title: 'Patient Comfort',
    description: 'Specialized equipment and techniques for patients with mobility or sensory challenges'
  }
];

const services = [
  {
    title: 'Physical Accessibility',
    items: [
      'Wheelchair accessible entrance and parking',
      'Accessible restrooms and treatment rooms',
      'Adjustable dental chairs for easy transfers',
      'Wide doorways and clear pathways',
      'Accessible reception desk height'
    ]
  },
  {
    title: 'Visual Accessibility',
    items: [
      'Large print forms and informational materials',
      'High contrast displays and signage',
      'Screen reader compatible website',
      'Audio descriptions of procedures',
      'Braille materials upon request'
    ]
  },
  {
    title: 'Hearing Accessibility',
    items: [
      'Assistive listening devices available',
      'Sign language interpreters on request',
      'Written communication options',
      'Visual alerts and notifications',
      'Quiet treatment environments'
    ]
  },
  {
    title: 'Cognitive & Communication',
    items: [
      'Simple, clear communication methods',
      'Extra time for appointments when needed',
      'Caregiver support welcome',
      'Sensory-friendly environment options',
      'Visual schedules and procedure explanations'
    ]
  }
];

const policies = [
  {
    title: 'Accessibility Statement',
    content: 'My Tooth Dental Clinic is committed to providing equal access to dental care for all patients, regardless of ability or disability.'
  },
  {
    title: 'Accommodation Requests',
    content: 'We gladly accommodate special needs with advance notice. Please contact us to discuss your specific requirements.'
  },
  {
    title: 'Website Accessibility',
    content: 'Our website follows WCAG 2.1 AA guidelines to ensure digital accessibility for all users.'
  },
  {
    title: 'Staff Training',
    content: 'Our team receives regular training on disability awareness and accessible patient care practices.'
  }
];

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  <Accessibility className="mr-2 h-4 w-4" />
                  Accessibility
                </Badge>

                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Dental Care{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                    For Everyone
                  </span>
                </h1>

                <p className="text-xl text-slate-600 leading-relaxed">
                  We're committed to providing accessible dental care and ensuring
                  all patients can comfortably receive the treatment they need.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/booking">
                    <Phone className="mr-2 h-5 w-5" />
                    Schedule Visit
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 hover:bg-blue-50 border-blue-200"
                  asChild
                >
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>ADA Compliant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Fully Accessible</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>All Welcome</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-xl p-8">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <div className="text-8xl">♿</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Accessibility Features
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our clinic is designed with accessibility in mind, ensuring comfort and convenience for all patients.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow text-center">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Comprehensive Accessibility Services
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We provide a wide range of accommodations to ensure every patient can access quality dental care.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-blue-600">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {service.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Accessibility Commitment
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We are dedicated to ensuring equal access and treatment for all patients.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {policies.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl font-semibold">{policy.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{policy.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Request Accommodations
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Contact us in advance to discuss your specific needs and ensure the best possible experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Speak with our accessibility coordinator</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="tel:+15551234567">
                    (555) 123-TOOTH
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Send us your accommodation needs</p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="mailto:accessibility@mytooth.com">
                    accessibility@mytooth.com
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Accessible location with parking</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/contact">
                    Get Directions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Experience Accessible Dental Care
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Schedule your appointment today and let us know how we can best accommodate your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
                asChild
              >
                <Link href="/booking">
                  <Phone className="mr-2 h-5 w-5" />
                  Book Appointment
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
