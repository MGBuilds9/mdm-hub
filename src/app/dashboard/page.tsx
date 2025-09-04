import { ClientDashboard } from '@/components/pages/client-dashboard';
import { AuthenticatedPage } from '@/components/auth/authenticated-page';

export default function DashboardPage() {
  return (
    <AuthenticatedPage>
      <ClientDashboard />
    </AuthenticatedPage>
  );
}
