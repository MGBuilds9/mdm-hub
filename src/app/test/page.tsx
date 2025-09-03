'use client'

import { useAuth } from '@/contexts/auth-context'
import { useDivisions } from '@/hooks/use-database'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function TestPage() {
  const { user, loading: authLoading } = useAuth()
  const { data: divisions, isLoading: divisionsLoading, error: divisionsError } = useDivisions()

  if (authLoading) {
    return <Loading />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access the test page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-charcoal-950">Implementation Test</h1>
        <p className="text-charcoal-600 mt-2">
          Testing the complete MDM Hub implementation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Internal:</strong> {user.is_internal ? 'Yes' : 'No'}</p>
            <p><strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
            <CardDescription>Testing Supabase integration</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              {divisionsLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  <span>Loading divisions...</span>
                </div>
              ) : divisionsError ? (
                <div className="text-red-600">
                  <p>Error loading divisions:</p>
                  <p className="text-sm mt-1">{divisionsError.message}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">✓ Database connection successful</p>
                  <p className="text-sm text-charcoal-600">
                    Found {divisions?.length || 0} divisions
                  </p>
                  {divisions && divisions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Divisions:</p>
                      <ul className="text-sm text-charcoal-600 mt-1">
                        {divisions.map((division) => (
                          <li key={division.id}>• {division.display_name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Component System</CardTitle>
          <CardDescription>Testing UI components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responsive Design</CardTitle>
          <CardDescription>Testing mobile-first approach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-primary-100 p-4 rounded-lg text-center">
              <p className="text-sm font-medium">Mobile (sm)</p>
            </div>
            <div className="bg-primary-200 p-4 rounded-lg text-center">
              <p className="text-sm font-medium">Tablet (md)</p>
            </div>
            <div className="bg-primary-300 p-4 rounded-lg text-center">
              <p className="text-sm font-medium">Desktop (lg)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
