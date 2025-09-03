'use client';

import { useAuth } from '@/contexts/auth-context';
import { LoginForm } from '@/components/auth/login-form';
import { MainLayout } from '@/components/layout/main-layout';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { Loading } from '@/components/ui/loading';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-950">Dashboard</h1>
          <p className="text-charcoal-600 mt-2">
            Welcome back, {user.first_name}!
          </p>
        </div>

        <DashboardStats
          stats={{
            totalProjects: 12,
            activeProjects: 8,
            totalBudget: 2500000,
            spentBudget: 1800000,
            teamMembers: 24,
            changeOrders: 5,
            pendingApprovals: 3,
            completedProjects: 4,
          }}
          projects={[
            {
              id: '1',
              name: 'Office Building Renovation',
              progress: 75,
              status: 'active',
              budget: 500000,
              spent: 375000,
              endDate: '2024-06-30',
            },
            {
              id: '2',
              name: 'Residential Complex',
              progress: 45,
              status: 'active',
              budget: 800000,
              spent: 360000,
              endDate: '2024-08-15',
            },
            {
              id: '3',
              name: 'Retail Space Buildout',
              progress: 90,
              status: 'active',
              budget: 200000,
              spent: 180000,
              endDate: '2024-04-30',
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => (window.location.href = '/projects')}
          >
            <h3 className="text-lg font-semibold text-charcoal-950 mb-2">
              Recent Projects
            </h3>
            <p className="text-charcoal-600">
              View and manage your recent projects
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-charcoal-950 mb-2">
              Change Orders
            </h3>
            <p className="text-charcoal-600">Review pending change orders</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-charcoal-950 mb-2">
              Photo Gallery
            </h3>
            <p className="text-charcoal-600">
              Browse project photos and documentation
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
