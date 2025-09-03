'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Menu,
  X,
  Building2,
  Users,
  Calendar,
  FileText,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Building2 },
  { name: 'Projects', href: '/projects', icon: FileText },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-charcoal-950">
                MDM Construction
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-500 transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="btn-primary">Sign In</button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-500 focus:outline-none focus:text-primary-500"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigationItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 text-gray-700 hover:text-primary-500 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-200">
              <button className="w-full btn-primary">Sign In</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
