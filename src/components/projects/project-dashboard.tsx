'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ProjectWithFullDetails, Milestone, Task } from '@/types/database'
import { formatDate, formatCurrency, getStatusColor, getInitials } from '@/lib/utils'
import { Calendar, MapPin, Users, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ProjectDashboardProps {
  project: ProjectWithFullDetails
}

export function ProjectDashboard({ project }: ProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate project metrics
  const totalTasks = project.tasks.length
  const completedTasks = project.tasks.filter(task => task.status === 'completed').length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const overdueTasks = project.tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length

  const upcomingMilestones = project.milestones
    .filter(milestone => new Date(milestone.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3)

  const recentTasks = project.tasks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-950">{project.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {project.location || 'No location specified'}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {project.start_date ? formatDate(project.start_date) : 'No start date'}
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Edit Project</Button>
          <Button>Add Team Member</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage}%</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.budget ? formatCurrency(project.budget) : 'Not set'}
            </div>
            <p className="text-xs text-muted-foreground">
              Project budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.project_users.length}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tasks past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-charcoal-600">
                  {project.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>

            {/* Upcoming Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Milestones</CardTitle>
                <CardDescription>Next 3 milestones to complete</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingMilestones.length > 0 ? (
                  upcomingMilestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{milestone.name}</p>
                        <p className="text-sm text-charcoal-600">
                          Due: {formatDate(milestone.due_date)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(milestone.status)}>
                        {milestone.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-charcoal-600 text-center py-4">No upcoming milestones</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
              <CardDescription>Track project progress through key milestones</CardDescription>
            </CardHeader>
            <CardContent>
              {project.milestones.length > 0 ? (
                <div className="space-y-4">
                  {project.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{milestone.name}</h4>
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-charcoal-600 mt-1">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-600">
                          <span>Due: {formatDate(milestone.due_date)}</span>
                          <span>Progress: {milestone.completion_percentage}%</span>
                        </div>
                        <Progress value={milestone.completion_percentage} className="mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-charcoal-600 mb-4">No milestones created yet</p>
                  <Button>Create First Milestone</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Latest tasks and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-charcoal-600 mt-1">{task.description}</p>
                        )}
                        {task.due_date && (
                          <p className="text-sm text-charcoal-600 mt-1">
                            Due: {formatDate(task.due_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-charcoal-600 mb-4">No tasks created yet</p>
                  <Button>Create First Task</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Project team and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              {project.project_users.length > 0 ? (
                <div className="space-y-3">
                  {project.project_users.map((projectUser) => (
                    <div key={projectUser.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={projectUser.user.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(projectUser.user.first_name, projectUser.user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {projectUser.user.first_name} {projectUser.user.last_name}
                        </p>
                        <p className="text-sm text-charcoal-600">{projectUser.user.email}</p>
                      </div>
                      <Badge className={getStatusColor(projectUser.role)}>
                        {projectUser.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-charcoal-600 mb-4">No team members assigned yet</p>
                  <Button>Add Team Member</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
