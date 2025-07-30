"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Clock,
  DollarSign,
  Star,
  Calendar,
  Stethoscope,
  Sparkles,
  Smile,
  Shield,
  Users,
  AlertCircle,
  Heart,
  ArrowRight,
  Filter,
  Loader2
} from 'lucide-react';

// Service type definition
interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  painLevel: number;
  image?: string;
  requirements?: string[];
  afterCareInstructions?: string;
  features?: string[];
  popular?: boolean;
}

// Mock services data as fallback
const fallbackServices: Service[] = [
  {
    id: '1',
    name: 'Regular Dental Cleaning',
    description: 'Professional teeth cleaning and polishing to remove plaque and tartar buildup. Includes fluoride treatment and oral health assessment.',
    category: 'general',
    duration: 60,
    price: 120,
    painLevel: 1,
    image: '/api/placeholder/400/300',
    popular: true,
    features: ['Plaque removal', 'Tartar cleaning', 'Fluoride treatment', 'Oral health check'],
    afterCareInstructions: 'Avoid eating for 30 minutes. Brush gently for 24 hours.'
  },
  {
    id: '2',
    name: 'Teeth Whitening',
    description: 'Professional teeth whitening treatment for a brighter, more confident smile. Safe and effective in-office procedure.',
    category: 'cosmetic',
    duration: 90,
    price: 450,
    painLevel: 2,
    image: '/api/placeholder/400/300',
    popular: true,
    features: ['Professional grade whitening', 'Immediate results', 'Safe procedure', 'Long-lasting effects'],
    afterCareInstructions: 'Avoid staining foods and drinks for 48 hours.'
  },
  {
    id: '3',
    name: 'Dental Checkup & Exam',
    description: 'Comprehensive oral examination including X-rays, dental health assessment, and preventive care recommendations.',
    category: 'general',
    duration: 45,
    price: 95,
    painLevel: 1,
    image: '/api/placeholder/400/300',
    popular: false,
    features: ['Digital X-rays', 'Oral cancer screening', 'Gum health check', 'Treatment planning'],
    afterCareInstructions: 'Follow recommended treatment plan and schedule next visit.'
  },
  {
    id: '4',
    name: 'Dental Implants',
    description: 'Permanent tooth replacement solution using titanium implants and ceramic crowns. Natural-looking and long-lasting.',
    category: 'surgery',
    duration: 120,
    price: 2500,
    painLevel: 4,
    image: '/api/placeholder/400/300',
    popular: false,
    features: ['Titanium implant', 'Custom crown', 'Natural appearance', 'Permanent solution'],
    afterCareInstructions: 'Soft foods only for 1 week. Follow medication instructions.'
  },
  {
    id: '5',
    name: 'Porcelain Veneers',
    description: 'Custom-made thin shells to improve the appearance of teeth color, shape, and size. Perfect for smile makeovers.',
    category: 'cosmetic',
    duration: 150,
    price: 1200,
    painLevel: 2,
    image: '/api/placeholder/400/300',
    popular: true,
    features: ['Custom design', 'Natural appearance', 'Stain resistant', 'Long-lasting'],
    afterCareInstructions: 'Avoid hard foods for 24 hours. Regular oral hygiene essential.'
  },
  {
    id: '6',
    name: 'Root Canal Treatment',
    description: 'Treatment to remove infected tooth pulp and save the natural tooth. Modern techniques ensure minimal discomfort.',
    category: 'general',
    duration: 90,
    price: 650,
    painLevel: 3,
    image: '/api/placeholder/400/300',
    popular: false,
    features: ['Save natural tooth', 'Pain relief', 'Prevent infection spread', 'Crown placement'],
    afterCareInstructions: 'Take prescribed medication. Avoid chewing on treated tooth.'
  },
  {
    id: '7',
    name: 'Orthodontic Consultation',
    description: 'Comprehensive evaluation for braces or clear aligners to straighten teeth and improve bite alignment.',
    category: 'orthodontics',
    duration: 60,
    price: 150,
    painLevel: 1,
    image: '/api/placeholder/400/300',
    popular: false,
    features: ['Digital imaging', 'Treatment planning', 'Options discussion', 'Cost estimation'],
    afterCareInstructions: 'Consider treatment options and schedule follow-up if proceeding.'
  },
  {
    id: '8',
    name: 'Emergency Dental Care',
    description: '24/7 emergency treatment for severe tooth pain, trauma, or dental emergencies. Immediate relief and stabilization.',
    category: 'emergency',
    duration: 30,
    price: 200,
    painLevel: 3,
    image: '/api/placeholder/400/300',
    popular: false,
    features: ['24/7 availability', 'Pain relief', 'Emergency treatment', 'Stabilization'],
    afterCareInstructions: 'Follow specific emergency instructions. Schedule follow-up care.'
  },
  {
    id: '9',
    name: 'Pediatric Dental Cleaning',
    description: 'Gentle dental cleaning and oral health education specifically designed for children. Fun and comfortable experience.',
    category: 'pediatric',
    duration: 45,
    price: 85,
    painLevel: 1,
    image: '/api/placeholder/400/300',
    popular: false,
    features: ['Child-friendly approach', 'Education included', 'Gentle techniques', 'Preventive focus'],
    afterCareInstructions: 'Practice good oral hygiene. Schedule regular check-ups.'
  }
];

const categories = [
  { value: 'all', label: 'All Services', icon: Stethoscope },
  { value: 'general', label: 'General Dentistry', icon: Stethoscope },
  { value: 'cosmetic', label: 'Cosmetic Dentistry', icon: Sparkles },
  { value: 'orthodontics', label: 'Orthodontics', icon: Smile },
  { value: 'surgery', label: 'Oral Surgery', icon: Shield },
  { value: 'pediatric', label: 'Pediatric', icon: Users },
  { value: 'emergency', label: 'Emergency Care', icon: AlertCircle }
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/services');

        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const data = await response.json();
        setServices(data.services || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Showing available services.');
        // Use fallback data
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services based on search, category, and price
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;

    const matchesPrice = priceRange === 'all' ||
      (priceRange === 'under-200' && service.price < 200) ||
      (priceRange === '200-500' && service.price >= 200 && service.price <= 500) ||
      (priceRange === '500-1000' && service.price > 500 && service.price <= 1000) ||
      (priceRange === 'over-1000' && service.price > 1000);

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const getPainLevelColor = (level: number) => {
    if (level <= 2) return 'text-green-500';
    if (level <= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPainLevelText = (level: number) => {
    if (level === 1) return 'Minimal';
    if (level === 2) return 'Mild';
    if (level === 3) return 'Moderate';
    if (level === 4) return 'Significant';
    return 'Intensive';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading our dental services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Our Dental Services
            </h1>
            <p className="text-xl lg:text-2xl text-cyan-100 mb-8">
              Comprehensive dental care for the whole family. From routine cleanings
              to advanced procedures, we provide exceptional care with the latest technology.
            </p>
            <Button size="lg" variant="secondary" className="bg-white dark:bg-gray-800 text-cyan-600 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-700" asChild>
              <Link href="/booking">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            {error}
          </div>
        </div>
      )}

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Find Your Service</span>
                </CardTitle>
                <CardDescription>
                  Search and filter our dental services to find exactly what you need
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center space-x-2">
                              <category.icon className="h-4 w-4" />
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under-200">Under $200</SelectItem>
                        <SelectItem value="200-500">$200 - $500</SelectItem>
                        <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                        <SelectItem value="over-1000">Over $1,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Card className="h-full hover-lift border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Service Image */}
                  <div className="aspect-video bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center relative">
                    {categories.find(cat => cat.value === service.category)?.icon && (
                      <div className="text-6xl text-cyan-600">
                        {React.createElement(categories.find(cat => cat.value === service.category)!.icon)}
                      </div>
                    )}
                    {service.popular && (
                      <Badge className="absolute top-4 right-4 bg-orange-500">
                        Popular
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl group-hover:text-cyan-600 transition-colors">
                        {service.name}
                      </CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {categories.find(cat => cat.value === service.category)?.label}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Service Features */}
                    {service.features && service.features.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">What's Included:</h4>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {service.features.slice(0, 2).map((feature, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Service Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>{service.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        <span>${service.price}</span>
                      </div>
                    </div>

                    {/* Pain Level */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Discomfort Level:</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getPainLevelColor(service.painLevel)}`}>
                          {getPainLevelText(service.painLevel)}
                        </span>
                        <div className="flex space-x-1">
                          {[...Array(service.painLevel)].map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${getPainLevelColor(service.painLevel).replace('text', 'bg')}`} />
                          ))}
                          {[...Array(5 - service.painLevel)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-slate-200" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-4">
                      <Button className="w-full dental-gradient" asChild>
                        <Link href="/booking">
                          Book This Service
                          <Calendar className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full group-hover:bg-cyan-50 group-hover:border-cyan-200" asChild>
                        <Link href={`/services/${service.category}`}>
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No services found</h3>
              <p className="text-slate-600 mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange('all');
                }}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold">
              Need Help Choosing the Right Service?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Our experienced team is here to help you find the perfect treatment
              for your dental needs. Schedule a consultation today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="dental-gradient" asChild>
                <Link href="/booking">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Consultation
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900" asChild>
                <Link href="/contact">
                  <Heart className="mr-2 h-5 w-5" />
                  Contact Our Team
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
