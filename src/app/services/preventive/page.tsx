"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Heart,
  Calendar,
  CheckCircle,
  Star,
  Users,
  ArrowRight,
  Stethoscope,
  Award,
  Clock
} from 'lucide-react';

const benefits = [
  {
    icon: Shield,
    title: 'Prevention First',
    description: 'Stop dental problems before they start with regular preventive care'
  },
  {
    icon: Heart,
    title: 'Improved Health',
    description: 'Better oral health contributes to overall well-being and systemic health'
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Prevent complex procedures with regular maintenance visits'
  },
  {
    icon: Star,
    title: 'Cost Effective',
    description: 'Prevention costs much less than treating advanced dental problems'
  }
];

const services = [
  {
    title: 'Professional Cleanings',
    description: 'Thorough removal of plaque and tartar buildup with polishing',
    price: '$120',
    frequency: 'Every 6 months'
  },
  {
    title: 'Comprehensive Exams',
    description: 'Complete oral health assessment including X-rays when needed',
    price: '$95',
    frequency: 'Every 6 months'
  },
  {
    title: 'Fluoride Treatments',
    description: 'Strengthening treatment to prevent tooth decay',
    price: '$45',
    frequency: 'As recommended'
  },
  {
    title: 'Dental Sealants',
    description: 'Protective coating for molars to prevent cavities',
    price: '$55 per tooth',
    frequency: 'As needed'
  },
  {
    title: 'Oral Cancer Screening',
    description: 'Early detection screening for oral health issues',
    price: 'Included',
    frequency: 'Every visit'
  },
  {
    title: 'Gum Disease Prevention',
    description: 'Deep cleaning and maintenance to prevent periodontal disease',
    price: '$180',
    frequency: 'As recommended'
  }
];

const stats = [
  { number: '95%', label: 'Cavity Prevention Rate', icon: Shield },
  { number: '6', label: 'Month Visit Frequency', icon: Calendar },
  { number: '10+', label: 'Years Experience', icon: Award },
  { number: '100%', label: 'Patient Satisfaction', icon: Star }
];

export default function PreventiveDentistryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
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
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  <Shield className="mr-2 h-4 w-4" />
                  Preventive Care
                </Badge>

                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Prevention is the{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500">
                    Best Medicine
                  </span>
                </h1>

                <p className="text-xl text-slate-600 leading-relaxed">
                  Protect your oral health with comprehensive preventive care.
                  Regular checkups and cleanings help you maintain a healthy smile for life.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/booking">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Cleaning
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 hover:bg-green-50 border-green-200"
                  asChild
                >
                  <Link href="/contact">
                    Learn More
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No Hidden Fees</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Insurance Accepted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Same Day Appointments</span>
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
                <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <div className="text-8xl">🛡️</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-400 mb-1">{stat.number}</div>
                <div className="text-slate-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Why Choose Preventive Care?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Preventive dentistry is the foundation of excellent oral health and overall wellness.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow text-center">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                      <benefit.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      {benefit.description}
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
              Our Preventive Services
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive preventive care to keep your smile healthy and beautiful.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
                      <Badge variant="secondary">{service.price}</Badge>
                    </div>
                    <div className="text-sm text-green-600 font-medium">{service.frequency}</div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 mb-4">
                      {service.description}
                    </CardDescription>
                    <Button variant="outline" className="w-full hover:bg-green-50">
                      Book Service
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prevention Tips Section */}
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
              Daily Prevention Tips
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Simple habits you can practice at home to maintain excellent oral health.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">🦷</div>
                <CardTitle>Brush Twice Daily</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Use fluoride toothpaste and brush for 2 minutes, twice a day.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">🧵</div>
                <CardTitle>Floss Daily</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Remove plaque and food particles between teeth daily.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">💧</div>
                <CardTitle>Use Mouthwash</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Antimicrobial mouthwash helps reduce bacteria and freshen breath.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">🥗</div>
                <CardTitle>Healthy Diet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Limit sugary foods and drinks. Choose nutritious options.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">🚭</div>
                <CardTitle>Avoid Tobacco</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Smoking and tobacco products increase risk of gum disease.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="text-4xl mb-4">👨‍⚕️</div>
                <CardTitle>Regular Checkups</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Visit your dentist every 6 months for professional care.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Start Your Prevention Journey Today
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Schedule your preventive care appointment and take the first step towards
              a lifetime of healthy smiles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-green-600 hover:bg-gray-100"
                asChild
              >
                <Link href="/booking">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Cleaning
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-green-600"
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
