'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { User, UserWithDivisions } from '@/types/database';
import { formatDate, getInitials, getRoleColor } from '@/lib/utils';
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Shield,
  Edit,
  Key,
  Bell,
  Activity,
  Award,
  Clock,
} from 'lucide-react';

interface UserProfileProps {
  user: UserWithDivisions;
  onEdit?: () => void;
  onEditPermissions?: () => void;
  onResetPassword?: () => void;
}

export function UserProfile({
  user,
  onEdit,
  onEditPermissions,
  onResetPassword,
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const userStats = {
    projectsInvolved: 12,
    tasksCompleted: 45,
    hoursLogged: 320,
    lastActive: '2 hours ago',
  };

  const recentActivity = [
    {
      id: '1',
      action: 'Completed task',
      description: 'Foundation inspection completed',
      project: 'Downtown Office Building',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'task_completion',
    },
    {
      id: '2',
      action: 'Uploaded photos',
      description: '5 photos uploaded to project gallery',
      project: 'Residential Complex',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      type: 'photo_upload',
    },
    {
      id: '3',
      action: 'Updated milestone',
      description: 'Roof installation milestone marked as complete',
      project: 'Shopping Center',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      type: 'milestone_update',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completion':
        return <Award className="h-4 w-4 text-green-600" />;
      case 'photo_upload':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'milestone_update':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-charcoal-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xl">
                  {getInitials(user.first_name, user.last_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-950">
                  {user.first_name} {user.last_name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-charcoal-600">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-charcoal-600">
                      <Phone className="h-4 w-4" />
                      {user.phone}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Badge
                    className={
                      user.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">
                    {user.is_internal ? 'Internal Staff' : 'External User'}
                  </Badge>
                  <span className="text-sm text-charcoal-600">
                    Member since {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={onEditPermissions}>
                <Shield className="h-4 w-4 mr-2" />
                Permissions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">
                  Projects
                </p>
                <p className="text-2xl font-bold">
                  {userStats.projectsInvolved}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">
                  Tasks Completed
                </p>
                <p className="text-2xl font-bold">{userStats.tasksCompleted}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">
                  Hours Logged
                </p>
                <p className="text-2xl font-bold">{userStats.hoursLogged}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">
                  Last Active
                </p>
                <p className="text-sm font-bold">{userStats.lastActive}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-charcoal-400" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-charcoal-600">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-charcoal-400" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-charcoal-600">{user.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Division Memberships */}
            <Card>
              <CardHeader>
                <CardTitle>Division Memberships</CardTitle>
                <CardDescription>
                  User's roles across different divisions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.user_divisions && user.user_divisions.length > 0 ? (
                  <div className="space-y-3">
                    {user.user_divisions.map(userDivision => (
                      <div
                        key={userDivision.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-charcoal-400" />
                          <div>
                            <p className="font-medium">
                              {userDivision.division?.display_name}
                            </p>
                            <p className="text-sm text-charcoal-600">
                              Member since {formatDate(userDivision.created_at)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getRoleColor(userDivision.role)}>
                          {userDivision.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-charcoal-600 text-center py-4">
                    No division memberships
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>
                Detailed breakdown of user permissions by division
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.user_divisions && user.user_divisions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Division</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.user_divisions.map(userDivision => (
                      <TableRow key={userDivision.id}>
                        <TableCell className="font-medium">
                          {userDivision.division?.display_name}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(userDivision.role)}>
                            {userDivision.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-charcoal-600">
                            {/* Mock permissions based on role */}
                            {userDivision.role === 'admin' &&
                              'Full access to all features'}
                            {userDivision.role === 'manager' &&
                              'Manage projects, tasks, and team members'}
                            {userDivision.role === 'supervisor' &&
                              'Manage tasks and view project details'}
                            {userDivision.role === 'worker' &&
                              'View assigned tasks and update progress'}
                            {userDivision.role === 'viewer' &&
                              'View assigned projects and approve changes'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-charcoal-600 text-center py-8">
                  No permissions assigned
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                User's recent actions and contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.action}</h4>
                        <span className="text-sm text-charcoal-600">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-charcoal-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-sm text-charcoal-500 mt-1">
                        Project: {activity.project}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage user security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password</h4>
                  <p className="text-sm text-charcoal-600">
                    Last changed 30 days ago
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={onResetPassword}>
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-charcoal-600">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Account Status</h4>
                  <p className="text-sm text-charcoal-600">
                    Control user access to the system
                  </p>
                </div>
                <Button
                  variant={user.is_active ? 'destructive' : 'default'}
                  size="sm"
                >
                  {user.is_active ? 'Deactivate' : 'Activate'} Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
