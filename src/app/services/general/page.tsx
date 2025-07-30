// © 2025 Mohammed DAOUDI - My Tooth. All rights reserved.
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Stethoscope,
  Shield,
  Star
} from 'lucide-react';

const treatments = [
  { name: 'Dental Cleaning', duration: '60 min', price: '$120' },
  { name: 'Dental Examination', duration: '45 min', price: '$95' },
  { name: 'Cavity Fillings', duration: '90 min', price: '$180' },
  { name: 'Root Canal', duration: '120 min', price: '$650' },
  { name: 'Tooth Extraction', duration: '45 min', price: '$200' },
  { name: 'Dental X-Rays', duration: '30 min', price: '$85' }
];

const benefits = [
  'Comprehensive oral health assessment',
  'Early detection of dental problems',
  'Professional teeth cleaning and polishing',
  'Preventive care to avoid future issues',
  'Expert treatment with latest technology',
  'Comfortable and gentle procedures'
];

export default function GeneralDentistryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button variant="ghost" asChild>
            <Link href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            General Dentistry
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive oral health care including routine cleanings, examinations,
            fillings, and preventive treatments to keep your smile healthy and bright.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-cyan-600" />
                    <span>What We Offer</span>
                  </CardTitle>
                  <CardDescription>
                    Our general dentistry services provide comprehensive care for patients of all ages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {treatments.map((treatment, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900">{treatment.name}</h4>
                          <Badge variant="outline" className="text-cyan-600 border-cyan-200">
                            {treatment.price}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {treatment.duration}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-6 w-6 text-cyan-600" />
                    <span>Benefits of Regular General Dentistry</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>What to Expect</CardTitle>
                  <CardDescription>
                    Your comfort and oral health are our top priorities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Initial Consultation', desc: 'Comprehensive examination and discussion of your dental history' },
                      { step: 2, title: 'Digital X-Rays', desc: 'Advanced imaging to get a complete picture of your oral health' },
                      { step: 3, title: 'Professional Cleaning', desc: 'Thorough cleaning and polishing to remove plaque and tartar' },
                      { step: 4, title: 'Treatment Plan', desc: 'Personalized recommendations for your ongoing dental care' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{item.title}</h4>
                          <p className="text-slate-600 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Duration</span>
                    <span className="font-semibold">45-120 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Starting Price</span>
                    <span className="font-semibold text-cyan-600">$85</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Pain Level</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`w-2 h-2 rounded-full mx-0.5 ${i <= 1 ? 'bg-green-400' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Insurance</span>
                    <span className="font-semibold text-green-600">Accepted</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">Ready to Schedule?</h3>
                  <p className="text-cyan-100 mb-6">
                    Book your appointment today and take the first step towards better oral health.
                  </p>
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href="/booking">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
