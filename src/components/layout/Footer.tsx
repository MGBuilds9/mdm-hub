import Link from 'next/link';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-charcoal-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">MDM Construction</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Professional construction project management platform designed to
              streamline your workflow and deliver exceptional results.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>info@mdmconstruction.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>123 Construction Ave, Building City, BC 12345</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-primary-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-gray-300 hover:text-primary-500 transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-gray-300 hover:text-primary-500 transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-primary-500 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-300 hover:text-primary-500 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-gray-300 hover:text-primary-500 transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-primary-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-primary-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} MDM Construction. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
