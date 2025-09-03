import { Building2, Users, Calendar, Award } from 'lucide-react';

const stats = [
  {
    icon: Building2,
    value: '500+',
    label: 'Projects Completed',
    description: 'Successfully delivered construction projects across various sectors',
  },
  {
    icon: Users,
    value: '50+',
    label: 'Expert Team Members',
    description: 'Skilled professionals with years of construction experience',
  },
  {
    icon: Calendar,
    value: '10+',
    label: 'Years of Experience',
    description: 'Decade of excellence in construction project management',
  },
  {
    icon: Award,
    value: '98%',
    label: 'Client Satisfaction',
    description: 'Consistently high ratings from our satisfied clients',
  },
];

export function Stats() {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Trusted by Construction Professionals
          </h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Join thousands of construction companies that rely on our platform
            to deliver exceptional projects on time and within budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white mb-2">
                  {stat.label}
                </div>
                <div className="text-primary-100">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
