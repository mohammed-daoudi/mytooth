"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Home,
  Calendar,
  ArrowLeft,
  Search,
  Phone,
  Mail,
  MapPin,
  Frown
} from 'lucide-react';

export default function NotFound() {
  const quickLinks = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      description: "Return to homepage"
    },
    {
      name: "Book Appointment",
      href: "/booking",
      icon: Calendar,
      description: "Schedule your visit"
    },
    {
      name: "Our Services",
      href: "/services",
      icon: Search,
      description: "Explore our treatments"
    },
    {
      name: "Contact Us",
      href: "/contact",
      icon: Phone,
      description: "Get in touch"
    }
  ];

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: "(555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: Mail,
      label: "Email",
      value: "info@mytooth.com",
      href: "mailto:info@mytooth.com"
    },
    {
      icon: MapPin,
      label: "Address",
      value: "123 Dental Street, City, State 12345",
      href: "/contact"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Error Icon */}
            <div className="mb-8">
              <div className="relative mx-auto w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="relative w-full h-full bg-white rounded-full shadow-lg flex items-center justify-center">
                  <Frown className="w-16 h-16 text-blue-600" />
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                404
              </motion.div>
            </div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Oops! Page Not Found
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                The page you're looking for seems to have taken an unexpected trip to the dentist.
                Don't worry, we'll help you find what you need!
              </p>
              <p className="text-sm text-slate-500">
                The requested URL was not found on this server.
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/">
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                  </Link>
                </Button>
                <Button size="lg" variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </Button>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Try These Popular Pages
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <Link href={link.href}>
                        <CardHeader className="text-center">
                          <div className="p-3 rounded-lg bg-blue-100 w-fit mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                            <link.icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <CardTitle className="text-lg">{link.name}</CardTitle>
                          <CardDescription>{link.description}</CardDescription>
                        </CardHeader>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl text-blue-800">
                    Need Help? Contact Us
                  </CardTitle>
                  <CardDescription>
                    Our team is here to assist you with any questions or concerns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    {contactInfo.map((info, index) => (
                      <motion.div
                        key={info.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                      >
                        <Link
                          href={info.href}
                          className="flex flex-col items-center text-center p-4 rounded-lg hover:bg-white hover:shadow-md transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 mb-3 group-hover:bg-blue-200 transition-colors">
                            <info.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="text-sm font-medium text-slate-900 mb-1">
                            {info.label}
                          </div>
                          <div className="text-sm text-slate-600">
                            {info.value}
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
