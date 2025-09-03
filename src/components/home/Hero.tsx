import Link from 'next/link';
import { ArrowRight, Building2, Users, Calendar, TrendingUp } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-background-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-charcoal-950 mb-6">
            Professional Construction
            <span className="text-primary-500 block">Project Management</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your construction projects with our comprehensive management platform.
            Track progress, manage teams, and deliver exceptional results on time and within budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-3 inline-flex items-center">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/demo" className="btn-secondary text-lg px-8 py-3">
              View Demo
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-charcoal-950">500+</div>
            <div className="text-gray-600">Projects Completed</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-charcoal-950">50+</div>
            <div className="text-gray-600">Team Members</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-charcoal-950">10+</div>
            <div className="text-gray-600">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-charcoal-950">98%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
