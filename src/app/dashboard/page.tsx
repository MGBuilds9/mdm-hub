import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { UpcomingTasks } from '@/components/dashboard/UpcomingTasks';
import { TeamActivity } from '@/components/dashboard/TeamActivity';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-950">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's an overview of your construction projects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <DashboardStats />
            <RecentProjects />
          </div>
          <div className="space-y-8">
            <UpcomingTasks />
            <TeamActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
