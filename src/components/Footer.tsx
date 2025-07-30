"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Heart,
  Shield,
  Award,
  Calendar
} from 'lucide-react';

const footerLinks = {
  services: [
    { href: '/services/general', label: 'General Dentistry' },
    { href: '/services/cosmetic', label: 'Cosmetic Dentistry' },
    { href: '/services/orthodontics', label: 'Orthodontics' },
    { href: '/services/surgery', label: 'Oral Surgery' },
    { href: '/services/pediatric', label: 'Pediatric Dentistry' },
    { href: '/services/preventive', label: 'Preventive Care' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/team', label: 'Our Team' },
    { href: '/reviews', label: 'Patient Reviews' },
    { href: '/blog', label: 'Dental Blog' },
    { href: '/careers', label: 'Careers' },
    { href: '/contact', label: 'Contact Us' },
  ],
  resources: [
    { href: '/faq', label: 'FAQ' },
    { href: '/insurance', label: 'Insurance' },
    { href: '/financing', label: 'Financing Options' },
    { href: '/patient-forms', label: 'Patient Forms' },
    { href: '/dental-tips', label: 'Dental Care Tips' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
};

const socialLinks = [
  { href: 'https://facebook.com/mytoothclinic', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com/mytoothclinic', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com/mytoothclinic', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com/mytoothclinic', icon: Youtube, label: 'YouTube' },
];

const features = [
  { icon: Shield, text: 'HIPAA Compliant' },
  { icon: Award, text: 'Board Certified' },
  { icon: Heart, text: 'Patient Focused' },
  { icon: Calendar, text: 'Flexible Scheduling' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2">
              <span className="text-3xl tooth-icon">🦷</span>
              <div>
                <h3 className="text-xl font-bold text-cyan-400">My Tooth</h3>
                <p className="text-sm text-slate-300">Professional Dental Care</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Providing exceptional dental care with state-of-the-art technology and
              compassionate service. Your smile is our priority.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>123 Dental Street, Health City, HC 12345</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>(555) 123-TOOTH</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <span>info@mytooth.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Clock className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <div>Mon-Fri: 8:00 AM - 6:00 PM</div>
                  <div>Sat: 9:00 AM - 4:00 PM</div>
                  <div>Sun: Closed</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Services Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-cyan-400 text-sm transition-colors smooth-transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-cyan-400 text-sm transition-colors smooth-transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold text-cyan-400 mb-4">Resources</h4>
            <ul className="space-y-2 mb-6">
              {footerLinks.resources.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-300 hover:text-cyan-400 text-sm transition-colors smooth-transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div>
              <h5 className="text-sm font-semibold text-cyan-400 mb-3">Follow Us</h5>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="p-2 bg-slate-700 rounded-full hover:bg-cyan-500 transition-colors smooth-transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-slate-700"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <feature.icon className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>


      </div>

      {/* Bottom Footer */}
      <div className="border-t border-slate-700 bg-slate-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-sm text-slate-400">
              <p>© {currentYear} Mohammed DAOUDI - My Tooth Dental Clinic. All rights reserved.</p>
              <p className="text-xs mt-1">Proprietary software. Unauthorized use, reproduction, or distribution is prohibited.</p>
            </div>
            <div className="flex space-x-4 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-cyan-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-slate-400 hover:text-cyan-400 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
