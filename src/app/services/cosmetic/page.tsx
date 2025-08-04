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
  Sparkles,
  Star,
  Smile
} from 'lucide-react';

const treatments = [
  { name: 'Teeth Whitening', duration: '90 min', price: '$450', popular: true },
  { name: 'Porcelain Veneers', duration: '2 visits', price: '$1,200/tooth', popular: true },
  { name: 'Dental Bonding', duration: '60 min', price: '$300/tooth' },
  { name: 'Smile Makeover', duration: 'Multiple visits', price: 'Custom quote' },
  { name: 'Invisalign', duration: '12-18 months', price: '$3,500' },
  { name: 'Crown Lengthening', duration: '90 min', price: '$800' }
];

const benefits = [
  'Enhanced confidence and self-esteem',
  'Professional whitening that lasts longer',
  'Natural-looking, durable results',
  'Minimally invasive procedures',
  'Quick transformation options available',
  'Customized treatment plans'
];

export default function CosmeticDentistryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
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
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
              Cosmetic Dentistry
            </h1>
            <Badge className="bg-orange-500 text-white">Popular</Badge>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Transform your smile with our advanced cosmetic dental treatments. From teeth whitening
            to complete smile makeovers, we help you achieve the perfect smile you've always wanted.
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
                    <Smile className="h-6 w-6 text-purple-600" />
                    <span>Cosmetic Treatments</span>
                  </CardTitle>
                  <CardDescription>
                    Advanced aesthetic dentistry to enhance your smile's beauty and confidence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {treatments.map((treatment, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg relative">
                        {treatment.popular && (
                          <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                            Popular
                          </Badge>
                        )}
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900">{treatment.name}</h4>
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
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
                    <Star className="h-6 w-6 text-purple-600" />
                    <span>Benefits of Cosmetic Dentistry</span>
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

            {/* Before & After */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Smile Transformation Process</CardTitle>
                  <CardDescription>
                    Your journey to a perfect smile in simple steps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: 'Smile Analysis', desc: 'Digital smile design and comprehensive consultation' },
                      { step: 2, title: 'Treatment Planning', desc: 'Customized plan based on your goals and preferences' },
                      { step: 3, title: 'Preparation', desc: 'Gentle preparation with modern techniques and comfort care' },
                      { step: 4, title: 'Transformation', desc: 'Precise application of veneers, bonding, or whitening' },
                      { step: 5, title: 'Final Results', desc: 'Reveal your new smile and aftercare instructions' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
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
                    <span className="font-semibold">60-90 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Starting Price</span>
                    <span className="font-semibold text-purple-600">$300</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Pain Level</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`w-2 h-2 rounded-full mx-0.5 ${i <= 2 ? 'bg-yellow-400' : 'bg-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Results</span>
                    <span className="font-semibold text-green-600">Immediate</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Special Offer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-2">New Patient Special</h3>
                  <p className="text-purple-100 mb-6">
                    Get 20% off your first cosmetic treatment. Transform your smile today!
                  </p>
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href="/booking">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Consultation
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
