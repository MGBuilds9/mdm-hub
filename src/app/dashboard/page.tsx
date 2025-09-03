import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { MainLayout } from '@/components/layout/main-layout';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-950">Dashboard</h1>
          <p className="text-charcoal-600 mt-2">
            Welcome back! Here's an overview of your construction projects.
          </p>
        </div>

        <DashboardStats />
      </div>
    </MainLayout>
  );
}
