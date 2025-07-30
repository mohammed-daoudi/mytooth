"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Star,
  Calendar,
  Shield,
  Smile,
  Baby,
  Users,
  CheckCircle,
  ArrowRight,
  Stethoscope,
  Award
} from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Gentle Care',
    description: 'Specialized techniques for children with dental anxiety'
  },
  {
    icon: Smile,
    title: 'Fun Environment',
    description: 'Child-friendly office designed to make visits enjoyable'
  },
  {
    icon: Shield,
    title: 'Preventive Focus',
    description: 'Early intervention and prevention education'
  },
  {
    icon: Baby,
    title: 'Age-Appropriate',
    description: 'Treatments designed specifically for growing teeth'
  }
];

const services = [
  {
    title: 'First Dental Visit',
    description: 'Introducing your child to dental care in a comfortable environment',
    price: '$85'
  },
  {
    title: 'Children\'s Cleanings',
    description: 'Gentle cleaning and fluoride treatments for young teeth',
    price: '$95'
  },
  {
    title: 'Dental Sealants',
    description: 'Protective coating to prevent cavities in molars',
    price: '$45 per tooth'
  },
  {
    title: 'Fluoride Treatments',
    description: 'Strengthening treatments for developing teeth',
    price: '$35'
  }
];

export default function PediatricDentistryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
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
                <Badge variant="outline" className="text-pink-600 border-pink-200 bg-pink-50">
                  <Baby className="mr-2 h-4 w-4" />
                  Pediatric Dentistry
                </Badge>

                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Happy Smiles for{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                    Little Ones
                  </span>
                </h1>

                <p className="text-xl text-slate-600 leading-relaxed">
                  Creating positive dental experiences for children with gentle care,
                  fun environments, and specialized pediatric treatments.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/booking">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 hover:bg-pink-50 border-pink-200"
                  asChild
                >
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-2xl shadow-xl p-8">
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <div className="text-8xl">👶🦷</div>
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
              Why Choose Our Pediatric Care?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We specialize in making dental visits fun and comfortable for children of all ages.
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
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mb-4">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-slate-600">
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
              Pediatric Dental Services
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive dental care designed specifically for children's unique needs.
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
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-semibold">{service.title}</CardTitle>
                      <Badge variant="secondary">{service.price}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 mb-4">
                      {service.description}
                    </CardDescription>
                    <Button variant="outline" className="w-full">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Schedule Your Child's Visit?
            </h2>
            <p className="text-xl text-pink-100 max-w-2xl mx-auto">
              Book a consultation today and let us help your child develop healthy dental habits for life.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 bg-white text-pink-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/booking">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
