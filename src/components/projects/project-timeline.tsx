'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Milestone, Task } from '@/types/database'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Calendar, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react'

interface ProjectTimelineProps {
  milestones: Milestone[]
  tasks: Task[]
  onCreateMilestone?: () => void
  onCreateTask?: () => void
}

export function ProjectTimeline({ 
  milestones, 
  tasks, 
  onCreateMilestone, 
  onCreateTask 
}: ProjectTimelineProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'kanban'>('timeline')

  // Sort milestones by due date
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )

  // Group tasks by milestone
  const tasksByMilestone = tasks.reduce((acc, task) => {
    const milestoneId = task.milestone_id || 'unassigned'
    if (!acc[milestoneId]) {
      acc[milestoneId] = []
    }
    acc[milestoneId].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const getMilestoneStatus = (milestone: Milestone) => {
    const now = new Date()
    const dueDate = new Date(milestone.due_date)
    
    if (milestone.status === 'completed') return 'completed'
    if (dueDate < now && milestone.status !== 'completed') return 'overdue'
    if (milestone.status === 'in_progress') return 'in_progress'
    return 'pending'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />
      default:
        return <Calendar className="h-5 w-5 text-charcoal-400" />
    }
  }

  if (viewMode === 'kanban') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Kanban</CardTitle>
              <CardDescription>Task management board</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'timeline' ? 'outline' : 'default'}
                size="sm"
                onClick={() => setViewMode('timeline')}
              >
                Timeline
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'outline' : 'default'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium capitalize">{status.replace('_', ' ')}</h3>
                  <Badge variant="outline">
                    {tasks.filter(task => task.status === status).length}
                  </Badge>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {tasks
                    .filter(task => task.status === status)
                    .map((task) => (
                      <div key={task.id} className="p-3 border rounded-lg bg-white">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-charcoal-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                          {task.due_date && (
                            <span className="text-xs text-charcoal-500">
                              {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>Milestones and tasks timeline</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'timeline' ? 'outline' : 'default'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'outline' : 'default'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </Button>
            <Button size="sm" onClick={onCreateMilestone}>
              <Plus className="h-4 w-4 mr-1" />
              Milestone
            </Button>
            <Button size="sm" variant="outline" onClick={onCreateTask}>
              <Plus className="h-4 w-4 mr-1" />
              Task
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedMilestones.length > 0 ? (
          <div className="space-y-6">
            {sortedMilestones.map((milestone, index) => {
              const status = getMilestoneStatus(milestone)
              const milestoneTasks = tasksByMilestone[milestone.id] || []
              
              return (
                <div key={milestone.id} className="relative">
                  {/* Timeline line */}
                  {index < sortedMilestones.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-charcoal-200" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Status icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-charcoal-200 rounded-full flex items-center justify-center">
                      {getStatusIcon(status)}
                    </div>
                    
                    {/* Milestone content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">{milestone.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status)}>
                            {status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-charcoal-600">
                            {formatDate(milestone.due_date)}
                          </span>
                        </div>
                      </div>
                      
                      {milestone.description && (
                        <p className="text-charcoal-600 mb-3">{milestone.description}</p>
                      )}
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{milestone.completion_percentage}%</span>
                        </div>
                        <Progress value={milestone.completion_percentage} />
                      </div>
                      
                      {/* Milestone tasks */}
                      {milestoneTasks.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-charcoal-700 mb-2">
                            Tasks ({milestoneTasks.length})
                          </h4>
                          <div className="space-y-2">
                            {milestoneTasks.slice(0, 3).map((task) => (
                              <div key={task.id} className="flex items-center gap-2 p-2 bg-charcoal-50 rounded">
                                <div className="w-2 h-2 bg-charcoal-400 rounded-full" />
                                <span className="text-sm">{task.title}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusColor(task.status)}`}
                                >
                                  {task.status}
                                </Badge>
                              </div>
                            ))}
                            {milestoneTasks.length > 3 && (
                              <p className="text-xs text-charcoal-500">
                                +{milestoneTasks.length - 3} more tasks
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">
              No milestones yet
            </h3>
            <p className="text-charcoal-600 mb-4">
              Create your first milestone to start tracking project progress
            </p>
            <Button onClick={onCreateMilestone}>
              <Plus className="h-4 w-4 mr-2" />
              Create Milestone
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
