'use client'

import { useAuth } from '@/contexts/auth-context'
import { LoginForm } from '@/components/auth/login-form'
import { MainLayout } from '@/components/layout/main-layout'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { Loading } from '@/components/ui/loading'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <LoginForm />
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
        
        <DashboardStats />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/projects'}>
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
            <p className="text-charcoal-600">
              Review pending change orders
            </p>
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
  )
}