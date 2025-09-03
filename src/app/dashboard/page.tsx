import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { MainLayout } from '@/components/layout/main-layout';

export default function DashboardPage() {
  // Mock data for dashboard stats
  const mockStats = {
    totalProjects: 12,
    activeProjects: 8,
    totalBudget: 2500000,
    spentBudget: 1800000,
    teamMembers: 24,
    changeOrders: 5,
    pendingApprovals: 3,
    completedProjects: 4,
  };

  const mockProjects = [
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
  ];

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-950">Dashboard</h1>
          <p className="text-charcoal-600 mt-2">
            Welcome back! Here's an overview of your construction projects.
          </p>
        </div>

        <DashboardStats stats={mockStats} projects={mockProjects} />
      </div>
    </MainLayout>
  );
}
