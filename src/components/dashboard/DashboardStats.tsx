import { Building2, Users, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const stats = [
  {
    title: 'Active Projects',
    value: '12',
    change: '+2 from last month',
    icon: Building2,
    color: 'text-primary-500',
  },
  {
    title: 'Team Members',
    value: '48',
    change: '+3 new hires',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    title: 'Upcoming Deadlines',
    value: '7',
    change: 'This week',
    icon: Calendar,
    color: 'text-orange-500',
  },
  {
    title: 'Total Budget',
    value: '$2.4M',
    change: '+12% from last quarter',
    icon: DollarSign,
    color: 'text-green-500',
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal-950">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
