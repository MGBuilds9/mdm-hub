'use client'

import { useState } from 'react'
import { useProjects, useDivisions } from '@/hooks/use-database'
import { MainLayout } from '@/components/layout/main-layout'
import { Loading } from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Calendar, Clock, MapPin, Users, Filter, Plus } from 'lucide-react'

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline' | 'list'>('calendar')
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects()
  const { data: divisions, isLoading: divisionsLoading } = useDivisions()

  if (projectsLoading || divisionsLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    )
  }

  if (projectsError) {
    return (
      <MainLayout>
        <ErrorBoundary>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Schedule</h2>
            <p className="text-charcoal-600">{projectsError.message}</p>
          </div>
        </ErrorBoundary>
      </MainLayout>
    )
  }

  // Filter projects
  const filteredProjects = projects?.filter(project => {
    const matchesDivision = divisionFilter === 'all' || project.division_id === divisionFilter
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesDivision && matchesStatus
  }) || []

  const getDivisionName = (divisionId: string) => {
    const division = divisions?.find(d => d.id === divisionId)
    return division?.display_name || 'Unknown Division'
  }

  // Get upcoming milestones and tasks (mock data for now)
  const upcomingItems = [
    {
      id: '1',
      type: 'milestone',
      title: 'Foundation Complete',
      project: 'Downtown Office Building',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'pending'
    },
    {
      id: '2',
      type: 'task',
      title: 'Install Electrical Wiring',
      project: 'Residential Complex',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'in_progress'
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Roof Installation',
      project: 'Shopping Center',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending'
    }
  ]

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-950">Schedule</h1>
            <p className="text-charcoal-600 mt-2">
              Track project timelines, milestones, and upcoming deadlines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule View
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  Calendar
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                >
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {divisions?.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>
              Important milestones and tasks coming up in the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-primary-500 rounded-full" />
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-charcoal-600">{item.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-charcoal-600">
                      Due: {formatDate(item.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>
              Overview of all active projects and their timelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-charcoal-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.location || 'No location'}
                          </div>
                          <Badge variant="outline">
                            {getDivisionName(project.division_id)}
                          </Badge>
                        </div>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    {/* Timeline Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-charcoal-600">
                        <span>Start: {project.start_date ? formatDate(project.start_date) : 'Not set'}</span>
                        <span>End: {project.end_date ? formatDate(project.end_date) : 'Not set'}</span>
                      </div>
                      <div className="w-full bg-charcoal-200 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ width: '45%' }} // Mock progress
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-charcoal-900 mb-2">
                  No projects found
                </h3>
                <p className="text-charcoal-600">
                  {divisionFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No projects have been created yet'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
