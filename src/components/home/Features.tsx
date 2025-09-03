import {
  Calendar,
  Users,
  FileText,
  BarChart3,
  Smartphone,
  Shield,
  Clock,
  DollarSign,
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Project Scheduling',
    description:
      'Create detailed project timelines and track milestones with our intuitive scheduling tools.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description:
      'Manage your construction teams, assign tasks, and track individual performance.',
  },
  {
    icon: FileText,
    title: 'Document Management',
    description:
      'Store and organize all project documents, blueprints, and contracts in one place.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description:
      'Monitor project progress with real-time dashboards and detailed analytics.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Access',
    description:
      'Access your projects anywhere with our mobile-responsive platform.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description:
      'Enterprise-grade security to protect your sensitive project data.',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description:
      'Track work hours and project time with accurate time management tools.',
  },
  {
    icon: DollarSign,
    title: 'Budget Management',
    description:
      'Monitor project costs and budgets with detailed financial tracking.',
  },
];

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal-950 mb-4">
            Everything You Need to Manage Construction Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools you need to
            successfully manage construction projects from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-950 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
