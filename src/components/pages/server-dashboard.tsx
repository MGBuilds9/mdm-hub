import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { MainLayout } from '@/components/layout/main-layout';

// Mock data for dashboard stats - this would come from server-side data fetching
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

export function ServerDashboard() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background-50 via-white to-primary-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5"></div>
          <div className="relative px-6 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-charcoal-900 via-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">
                  Welcome to MDM Contracting Hub
                </h1>
                <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
                  Your comprehensive construction project management platform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <DashboardStats stats={mockStats} projects={mockProjects} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
