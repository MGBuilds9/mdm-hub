'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useProjectWithDetails } from '@/hooks/use-database'
import { ProjectDashboard } from '@/components/projects/project-dashboard'
import { ProjectTimeline } from '@/components/projects/project-timeline'
import { ProjectStatusWorkflow } from '@/components/projects/project-status-workflow'
import { MobileProjectView } from '@/components/projects/mobile-project-view'
import { MainLayout } from '@/components/layout/main-layout'
import { Loading } from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Smartphone, Monitor } from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showTeamInviteForm, setShowTeamInviteForm] = useState(false)

  const { 
    data: project, 
    isLoading, 
    error 
  } = useProjectWithDetails(projectId)

  if (isLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    )
  }

  if (error || !project) {
    return (
      <MainLayout>
        <ErrorBoundary>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Project Not Found</h2>
            <p className="text-charcoal-600 mb-4">
              {error?.message || 'The requested project could not be found.'}
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </ErrorBoundary>
      </MainLayout>
    )
  }

  const handleStatusUpdate = async (status: string, reason?: string) => {
    // TODO: Implement status update
    console.log('Updating project status:', { status, reason })
  }

  const handleCreateMilestone = () => {
    setShowMilestoneForm(true)
  }

  const handleCreateTask = () => {
    setShowTaskForm(true)
  }

  const handleUploadPhoto = () => {
    // TODO: Implement photo upload
    console.log('Upload photo')
  }

  const handleViewTask = (task: any) => {
    // TODO: Navigate to task detail
    console.log('View task:', task)
  }

  const handleUpdateTaskStatus = (task: any, status: string) => {
    // TODO: Implement task status update
    console.log('Update task status:', { task, status })
  }

  if (viewMode === 'mobile') {
    return (
      <div className="min-h-screen bg-background-50">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <ErrorBoundary>
          <MobileProjectView
            project={project}
            onCreateTask={handleCreateTask}
            onUploadPhoto={handleUploadPhoto}
            onViewTask={handleViewTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </ErrorBoundary>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile View
            </Button>
          </div>
        </div>

        <ErrorBoundary>
          <ProjectDashboard project={project} />
        </ErrorBoundary>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <ErrorBoundary>
              <ProjectTimeline
                milestones={project.milestones}
                tasks={project.tasks}
                onCreateMilestone={handleCreateMilestone}
                onCreateTask={handleCreateTask}
              />
            </ErrorBoundary>
          </div>

          {/* Status Workflow */}
          <div>
            <ErrorBoundary>
              <ProjectStatusWorkflow
                project={project}
                onStatusUpdate={handleStatusUpdate}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
