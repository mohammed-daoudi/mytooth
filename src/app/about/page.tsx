"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Award,
  Heart,
  Shield,
  Star,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  GraduationCap,
  Stethoscope,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const teamMembers = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'Lead Dentist & Clinic Director',
    specialization: 'General & Cosmetic Dentistry',
    education: 'DDS, Harvard School of Dental Medicine',
    experience: '15 years',
    rating: 4.9,
    image: '/api/placeholder/300/300',
    bio: 'Dr. Johnson is passionate about providing comprehensive dental care with a gentle touch. She specializes in cosmetic dentistry and has helped thousands of patients achieve their perfect smile.',
    certifications: ['Board Certified General Dentist', 'Invisalign Provider', 'Cosmetic Dentistry Certificate'],
    languages: ['English', 'Spanish'],
    interests: ['Digital Dentistry', 'Patient Education', 'Community Outreach']
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    title: 'Senior Dentist',
    specialization: 'Orthodontics & Oral Surgery',
    education: 'DDS, UCLA School of Dentistry',
    experience: '12 years',
    rating: 4.8,
    image: '/api/placeholder/300/300',
    bio: 'Dr. Chen brings expertise in orthodontics and oral surgery. He is known for his precise work and making patients feel comfortable during complex procedures.',
    certifications: ['Orthodontic Specialist', 'Oral Surgery Certificate', 'Sedation Dentistry Licensed'],
    languages: ['English', 'Mandarin', 'Cantonese'],
    interests: ['3D Imaging', 'Minimally Invasive Surgery', 'Research']
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    title: 'Pediatric Dentist',
    specialization: 'Pediatric & Family Dentistry',
    education: 'DDS, University of Southern California',
    experience: '8 years',
    rating: 4.9,
    image: '/api/placeholder/300/300',
    bio: 'Dr. Rodriguez specializes in pediatric dentistry and loves working with children. She creates a fun, comfortable environment that helps kids develop positive relationships with dental care.',
    certifications: ['Pediatric Dentistry Specialist', 'Nitrous Oxide Certification', 'Child Psychology Training'],
    languages: ['English', 'Spanish', 'Portuguese'],
    interests: ['Child Development', 'Preventive Care', 'Family Education']
  },
  {
    id: '4',
    name: 'Lisa Thompson',
    title: 'Lead Dental Hygienist',
    specialization: 'Preventive Care & Education',
    education: 'AAS, Dental Hygiene Program',
    experience: '10 years',
    rating: 4.8,
    image: '/api/placeholder/300/300',
    bio: 'Lisa is dedicated to preventive care and patient education. She works closely with patients to develop personalized oral health routines and provides gentle, thorough cleanings.',
    certifications: ['Licensed Dental Hygienist', 'Local Anesthesia Certification', 'Periodontal Therapy Specialist'],
    languages: ['English'],
    interests: ['Preventive Education', 'Nutrition Counseling', 'Technology Integration']
  }
];

const values = [
  {
    icon: Heart,
    title: 'Compassionate Care',
    description: 'We treat every patient with kindness, understanding, and respect, ensuring a comfortable experience.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Award,
    title: 'Excellence in Service',
    description: 'We maintain the highest standards of dental care using the latest technology and techniques.',
    color: 'from-purple-500 to-violet-500'
  },
  {
    icon: Shield,
    title: 'Safety & Sterilization',
    description: 'We follow strict safety protocols and use state-of-the-art sterilization for your protection.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Users,
    title: 'Family-Focused',
    description: 'We provide comprehensive dental care for patients of all ages, from children to seniors.',
    color: 'from-blue-500 to-cyan-500'
  }
];

const achievements = [
  { number: '15+', label: 'Years of Excellence', icon: Award },
  { number: '10,000+', label: 'Happy Patients', icon: Users },
  { number: '4.9/5', label: 'Average Rating', icon: Star },
  { number: '24/7', label: 'Emergency Care', icon: Clock }
];

const timeline = [
  {
    year: '2008',
    title: 'Clinic Founded',
    description: 'Dr. Sarah Johnson established My Tooth with a vision to provide exceptional dental care.'
  },
  {
    year: '2012',
    title: 'Team Expansion',
    description: 'Added specialist dentists and expanded services to serve more families in our community.'
  },
  {
    year: '2016',
    title: 'Technology Upgrade',
    description: 'Invested in cutting-edge dental technology including digital imaging and laser dentistry.'
  },
  {
    year: '2020',
    title: 'Pandemic Response',
    description: 'Enhanced safety protocols and introduced telemedicine consultations for patient safety.'
  },
  {
    year: '2024',
    title: 'Digital Innovation',
    description: 'Launched online booking system and comprehensive digital patient management platform.'
  }
];

export default function AboutPage() {
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
              About My Tooth
            </h1>
            <p className="text-xl lg:text-2xl text-slate-300 mb-8">
              We're more than just a dental clinic. We're your partners in achieving
              optimal oral health and beautiful smiles that last a lifetime.
            </p>
            <Button size="lg" className="dental-gradient" asChild>
              <Link href="/booking">
                <Calendar className="mr-2 h-5 w-5" />
                Meet Our Team
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-slate-600">
                <p>
                  Founded in 2008 by Dr. Sarah Johnson, My Tooth began with a simple mission:
                  to provide exceptional dental care in a warm, welcoming environment where
                  patients feel like family.
                </p>
                <p>
                  Over the years, we've grown from a small practice into a comprehensive
                  dental clinic, but our core values remain the same. We believe that
                  everyone deserves access to quality dental care, and we're committed
                  to making that a reality for our community.
                </p>
                <p>
                  Today, our team of experienced professionals uses the latest technology
                  and techniques to deliver personalized care that meets each patient's
                  unique needs. From routine cleanings to complex procedures, we're here
                  to help you achieve and maintain your healthiest smile.
                </p>
              </div>
              <div className="mt-8">
                <Button variant="outline" className="mr-4" asChild>
                  <Link href="/services">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Our Services
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    <MapPin className="mr-2 h-4 w-4" />
                    Visit Us
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center">
                <div className="text-8xl">🦷</div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">15+</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Years of Excellence</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape the exceptional
              care experience we provide to every patient.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
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
                    <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-r ${value.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <achievement.icon className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-cyan-400 mb-1">{achievement.number}</div>
                <div className="text-slate-300">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our experienced professionals are dedicated to providing you with
              the highest quality dental care in a comfortable, friendly environment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full hover-lift border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <CardTitle className="text-xl font-bold">{member.name}</CardTitle>
                    <CardDescription className="font-medium text-cyan-600">
                      {member.title}
                    </CardDescription>
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{member.rating}</span>
                      <span className="text-sm text-slate-500">• {member.experience}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {member.bio}
                    </p>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Education & Experience:</h4>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <GraduationCap className="h-3 w-3" />
                          <span>{member.education}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Stethoscope className="h-3 w-3" />
                          <span>{member.specialization}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Certifications:</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.certifications.slice(0, 2).map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                        {member.certifications.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.certifications.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Languages:</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.languages.map((lang, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full dental-gradient group-hover:scale-105 transition-transform" asChild>
                      <Link href="/booking">
                        Book with {member.name.split(' ')[1]}
                        <Calendar className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
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
              Our Journey
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From our humble beginnings to becoming a leading dental practice,
              here's how we've grown while staying true to our mission.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-cyan-500 text-white font-bold text-lg px-3 py-1">
                          {item.year}
                        </Badge>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-4 h-4 bg-cyan-500 rounded-full border-4 border-white shadow-lg z-10" />
                <div className="flex-1" />
              </motion.div>
            ))}
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
              Ready to Join Our Dental Family?
            </h2>
            <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
              Experience the difference that compassionate, expert dental care can make.
              Schedule your appointment today and discover why thousands of patients trust us with their smiles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-cyan-600 hover:bg-gray-100" asChild>
                <Link href="/booking">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-cyan-600" asChild>
                <Link href="/contact">
                  <Phone className="mr-2 h-5 w-5" />
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
