'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectWithFullDetails, Task, Milestone } from '@/types/database';
import {
  formatDate,
  formatRelativeTime,
  getStatusColor,
  getInitials,
} from '@/lib/utils';
import { getProjectStatistics } from '@/lib/project-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  FileText,
  Plus,
} from 'lucide-react';

interface MobileProjectViewProps {
  project: ProjectWithFullDetails;
  onCreateTask?: () => void;
  onUploadPhoto?: () => void;
  onViewTask?: (task: Task) => void;
  onUpdateTaskStatus?: (task: Task, status: Task['status']) => void;
}

export function MobileProjectView({
  project,
  onCreateTask,
  onUploadPhoto,
  onViewTask,
  onUpdateTaskStatus,
}: MobileProjectViewProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = getProjectStatistics(
    project,
    project.milestones,
    project.tasks
  );
  const myTasks = project.tasks.filter(task => task.assigned_to); // Filter to current user's tasks
  const recentPhotos = project.photos.slice(0, 3);

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {/* Project Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('-', ' ')}
                </Badge>
                {project.location && (
                  <div className="flex items-center gap-1 text-xs text-charcoal-600">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{stats.overall.progress}%</span>
              </div>
              <Progress value={stats.overall.progress} className="h-2" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-charcoal-50 rounded-lg p-2">
                <div className="text-lg font-bold text-green-600">
                  {stats.tasks.completed}
                </div>
                <div className="text-xs text-charcoal-600">Done</div>
              </div>
              <div className="bg-charcoal-50 rounded-lg p-2">
                <div className="text-lg font-bold text-blue-600">
                  {stats.tasks.inProgress}
                </div>
                <div className="text-xs text-charcoal-600">Active</div>
              </div>
              <div className="bg-charcoal-50 rounded-lg p-2">
                <div className="text-lg font-bold text-orange-600">
                  {stats.tasks.overdue}
                </div>
                <div className="text-xs text-charcoal-600">Overdue</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={onCreateTask}
          className="h-12 flex flex-col items-center gap-1"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs">New Task</span>
        </Button>
        <Button
          onClick={onUploadPhoto}
          variant="outline"
          className="h-12 flex flex-col items-center gap-1"
        >
          <Camera className="h-5 w-5" />
          <span className="text-xs">Take Photo</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* My Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">My Tasks</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {myTasks.length > 0 ? (
                <div className="space-y-2">
                  {myTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-2 border rounded-lg"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onUpdateTaskStatus?.(
                            task,
                            task.status === 'completed'
                              ? 'in_progress'
                              : 'completed'
                          )
                        }
                        className="p-1 h-6 w-6"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-charcoal-300 rounded" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                          {task.due_date && (
                            <span className="text-xs text-charcoal-500">
                              {formatRelativeTime(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {myTasks.length > 3 && (
                    <Button variant="ghost" size="sm" className="w-full">
                      View {myTasks.length - 3} more tasks
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-charcoal-600">No tasks assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Photos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Photos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {recentPhotos.map(photo => (
                    <div
                      key={photo.id}
                      className="aspect-square bg-charcoal-100 rounded-lg flex items-center justify-center"
                    >
                      <Camera className="h-6 w-6 text-charcoal-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Camera className="h-8 w-8 text-charcoal-400 mx-auto mb-2" />
                  <p className="text-sm text-charcoal-600">No photos yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">All Tasks</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {project.tasks.length > 0 ? (
                <div className="space-y-2">
                  {project.tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                      onClick={() => onViewTask?.(task)}
                    >
                      <div className="flex-shrink-0">
                        {task.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : task.status === 'in_progress' ? (
                          <Clock className="h-5 w-5 text-blue-600" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-charcoal-300 rounded" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(task.status)}`}
                          >
                            {task.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        {task.due_date && (
                          <p className="text-xs text-charcoal-500 mt-1">
                            Due: {formatRelativeTime(task.due_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 text-charcoal-400 mx-auto mb-2" />
                  <p className="text-sm text-charcoal-600">
                    No tasks created yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Photos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {project.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {project.photos.map(photo => (
                    <div
                      key={photo.id}
                      className="aspect-square bg-charcoal-100 rounded-lg flex items-center justify-center"
                    >
                      <Camera className="h-6 w-6 text-charcoal-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="h-8 w-8 text-charcoal-400 mx-auto mb-2" />
                  <p className="text-sm text-charcoal-600">
                    No photos uploaded yet
                  </p>
                  <Button size="sm" className="mt-2" onClick={onUploadPhoto}>
                    Take First Photo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
