// © 2025 Mohammed DAOUDI - My Tooth. All rights reserved.
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from './AuthProvider';
import { useSocket } from './SocketProvider';
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Calendar,
  Stethoscope,
  Users,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  User,
  Shield,
  Home,
  Phone,
  Sun,
  Moon
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About Us', icon: Users },
  { href: '/services', label: 'Services', icon: Stethoscope },
  { href: '/booking', label: 'Book Appointment', icon: Calendar },
  { href: '/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/contact', label: 'Contact', icon: Phone },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { notifications, isConnected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <motion.div
            className="text-3xl tooth-icon"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            🦷
          </motion.div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary">My Tooth</span>
            <span className="text-xs text-muted-foreground hidden sm:block">Professional Dental Care</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`relative smooth-transition ${
                    isActive ? 'dental-gradient text-white' : 'hover:bg-cyan-50'
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                      layoutId="activeNav"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button
            aria-label="Toggle Dark Mode"
            className="rounded-full p-2 smooth-transition border border-border bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => {
              const nextTheme = theme === "dark" ? "light" : "dark";
              setTheme(nextTheme);
            }}
          >
            {!mounted ? (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300 transition-colors duration-300" />
            ) : theme === "dark" ? (
              <Sun className="h-5 w-5 text-cyan-400 transition-colors duration-300" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300 transition-colors duration-300" />
            )}
          </button>

          {/* Notifications */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                        <div className="flex w-full justify-between items-start">
                          <span className="font-medium text-sm">{notification.message}</span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Menu or Auth Buttons */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileImage} alt={user?.name || user?.email} />
                    <AvatarFallback className="dental-gradient text-white">
                      {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Badge variant="outline" className="w-fit text-xs">
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="w-full flex items-center cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>

                {hasRole(['admin', 'dentist']) && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="w-full flex items-center cursor-pointer"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild className="dental-gradient">
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        pathname === item.href ? 'dental-gradient text-white' : ''
                      }`}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}

                {!isAuthenticated && (
                  <>
                    <div className="border-t pt-4">
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                          Log in
                        </Link>
                      </Button>
                      <Button className="w-full justify-start dental-gradient mt-2" asChild>
                        <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                          Sign up
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
