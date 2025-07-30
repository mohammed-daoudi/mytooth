"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Home,
  RefreshCw,
  AlertTriangle,
  Phone,
  Mail,
  Bug,
  ArrowLeft,
  Shield,
  Clock
} from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const quickActions = [
    {
      name: "Try Again",
      action: () => reset(),
      icon: RefreshCw,
      description: "Reload this page",
      variant: "default" as const
    },
    {
      name: "Go Home",
      action: () => window.location.href = "/",
      icon: Home,
      description: "Return to homepage",
      variant: "outline" as const
    },
    {
      name: "Go Back",
      action: () => window.history.back(),
      icon: ArrowLeft,
      description: "Previous page",
      variant: "outline" as const
    }
  ];

  const supportSteps = [
    {
      step: "1",
      title: "Try refreshing the page",
      description: "Sometimes a simple refresh can resolve temporary issues"
    },
    {
      step: "2",
      title: "Clear your browser cache",
      description: "Clear your browser's cache and cookies, then try again"
    },
    {
      step: "3",
      title: "Check your connection",
      description: "Ensure you have a stable internet connection"
    },
    {
      step: "4",
      title: "Contact support",
      description: "If the problem persists, please contact our support team"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
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
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="relative w-full h-full bg-white rounded-full shadow-lg flex items-center justify-center">
                  <AlertTriangle className="w-16 h-16 text-red-600" />
                </div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600"
              >
                500
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
                Something Went Wrong
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                We encountered an unexpected error while processing your request.
                Our team has been notified and is working to resolve the issue.
              </p>

              {error.digest && (
                <Alert className="max-w-md mx-auto mb-6 border-red-200 bg-red-50">
                  <Bug className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Error ID: <code className="bg-red-100 px-1 rounded">{error.digest}</code>
                  </AlertDescription>
                </Alert>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {quickActions.map((action, index) => (
                  <Button
                    key={action.name}
                    size="lg"
                    variant={action.variant}
                    onClick={action.action}
                    className={action.variant === "default" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    <action.icon className="w-5 h-5 mr-2" />
                    {action.name}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Support Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Troubleshooting Steps
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {supportSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardHeader className="text-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center mx-auto mb-4">
                          {step.step}
                        </div>
                        <CardTitle className="text-lg">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-center">
                          {step.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <CardHeader className="text-center">
                  <div className="p-4 rounded-full bg-red-100 w-fit mx-auto mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <CardTitle className="text-xl text-red-800">
                    Need Immediate Help?
                  </CardTitle>
                  <CardDescription>
                    If you continue experiencing issues, please contact our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.9 }}
                    >
                      <Link
                        href="tel:+15551234567"
                        className="flex items-center justify-center p-4 rounded-lg hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-red-100 mr-4 group-hover:bg-red-200 transition-colors">
                          <Phone className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900 mb-1">
                            Emergency Support
                          </div>
                          <div className="text-sm text-slate-600">
                            (555) 123-4567
                          </div>
                        </div>
                      </Link>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      <Link
                        href="mailto:support@mytooth.com"
                        className="flex items-center justify-center p-4 rounded-lg hover:bg-white hover:shadow-md transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-red-100 mr-4 group-hover:bg-red-200 transition-colors">
                          <Mail className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-slate-900 mb-1">
                            Email Support
                          </div>
                          <div className="text-sm text-slate-600">
                            support@mytooth.com
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-center mt-6 text-sm text-slate-500">
                    <Clock className="w-4 h-4 mr-2" />
                    Our support team typically responds within 1 hour during business hours
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
