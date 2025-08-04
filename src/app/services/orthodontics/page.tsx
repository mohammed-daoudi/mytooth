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
  Smile,
  Star,
  Users
} from 'lucide-react';

const treatments = [
  { name: 'Traditional Braces', duration: '18-24 months', price: '$3,500', popular: false },
  { name: 'Clear Aligners (Invisalign)', duration: '12-18 months', price: '$4,200', popular: true },
  { name: 'Ceramic Braces', duration: '18-24 months', price: '$4,000' },
  { name: 'Lingual Braces', duration: '20-26 months', price: '$7,000' },
  { name: 'Retainers', duration: 'Ongoing', price: '$300-500' },
  { name: 'Orthodontic Consultation', duration: '60 min', price: '$150' }
];

const benefits = [
  'Straighter teeth and improved bite',
  'Enhanced facial appearance and profile',
  'Better oral hygiene and easier cleaning',
  'Reduced risk of dental problems',
  'Improved chewing and speaking function',
  'Boosted confidence and self-esteem'
];

export default function OrthodonticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
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
            <Smile className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Orthodontics
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Straighten your teeth and improve your bite with our modern orthodontic treatments.
            From traditional braces to clear aligners, we offer solutions for all ages.
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
                    <Users className="h-6 w-6 text-blue-600" />
                    <span>Orthodontic Solutions</span>
                  </CardTitle>
                  <CardDescription>
                    Modern orthodontic treatments for children, teens, and adults
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {treatments.map((treatment, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg relative">
                        {treatment.popular && (
                          <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                            Popular
                          </Badge>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900">{treatment.name}</h4>
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
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
                    <Star className="h-6 w-6 text-blue-600" />
                    <span>Benefits of Orthodontic Treatment</span>
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

            {/* Treatment Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Treatment Timeline</CardTitle>
                  <CardDescription>
                    Your journey to straighter teeth step by step
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Initial Consultation', desc: 'Comprehensive examination and 3D imaging', time: 'Week 1' },
                      { step: 2, title: 'Treatment Planning', desc: 'Custom treatment plan and appliance selection', time: 'Week 2' },
                      { step: 3, title: 'Appliance Placement', desc: 'Fitting of braces or delivery of aligners', time: 'Week 3' },
                      { step: 4, title: 'Regular Adjustments', desc: 'Monthly check-ups and progress monitoring', time: 'Ongoing' },
                      { step: 5, title: 'Completion & Retention', desc: 'Removal and fitting of retainers', time: 'Final phase' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-slate-900">{item.title}</h4>
                            <Badge variant="outline" className="text-xs">{item.time}</Badge>
                          </div>
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
                    <span className="text-slate-600">Treatment Time</span>
                    <span className="font-semibold">12-24 months</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Starting Price</span>
                    <span className="font-semibold text-blue-600">$3,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Age Range</span>
                    <span className="font-semibold">7+ years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Payment Plans</span>
                    <span className="font-semibold text-green-600">Available</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Age Groups */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Treatment by Age</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Children (7-11)</h4>
                    <p className="text-sm text-blue-700">Early intervention and guidance</p>
                  </div>
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <h4 className="font-semibold text-cyan-900">Teens (12-17)</h4>
                    <p className="text-sm text-cyan-700">Traditional and clear braces</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900">Adults (18+)</h4>
                    <p className="text-sm text-slate-700">Discreet alignment options</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <CardContent className="p-6 text-center">
                  <Smile className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-2">Free Consultation</h3>
                  <p className="text-blue-100 mb-6">
                    Schedule your complimentary orthodontic consultation and 3D smile preview.
                  </p>
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href="/booking">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Free Consult
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
