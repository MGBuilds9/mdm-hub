'use client'

import { useState } from 'react'
import { useUsers, useDivisions } from '@/hooks/use-database'
import { MainLayout } from '@/components/layout/main-layout'
import { Loading } from '@/components/ui/loading'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, getInitials, getRoleColor } from '@/lib/utils'
import { Search, Filter, Plus, Mail, Phone, MapPin, Building2 } from 'lucide-react'

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const { data: users, isLoading: usersLoading, error: usersError } = useUsers()
  const { data: divisions, isLoading: divisionsLoading } = useDivisions()

  if (usersLoading || divisionsLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    )
  }

  if (usersError) {
    return (
      <MainLayout>
        <ErrorBoundary>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Team</h2>
            <p className="text-charcoal-600">{usersError.message}</p>
          </div>
        </ErrorBoundary>
      </MainLayout>
    )
  }

  // Filter users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDivision = divisionFilter === 'all' || 
      user.user_divisions?.some(ud => ud.division_id === divisionFilter)
    
    const matchesRole = roleFilter === 'all' || 
      user.user_divisions?.some(ud => ud.role === roleFilter)

    return matchesSearch && matchesDivision && matchesRole
  }) || []

  const getDivisionName = (divisionId: string) => {
    const division = divisions?.find(d => d.id === divisionId)
    return division?.display_name || 'Unknown Division'
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-950">Team</h1>
            <p className="text-charcoal-600 mt-2">
              Manage your construction team members and their roles
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

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

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="estimator">Estimator</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Showing {filteredUsers.length} of {users?.length || 0} team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Divisions & Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>
                                {getInitials(user.first_name, user.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-charcoal-600">
                                {user.internal ? 'Internal Staff' : 'External User'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.user_divisions?.map((userDivision) => (
                              <div key={userDivision.id} className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {getDivisionName(userDivision.division_id)}
                                </Badge>
                                <Badge className={`text-xs ${getRoleColor(userDivision.role)}`}>
                                  {userDivision.role.replace('_', ' ')}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-charcoal-400 mb-4">
                  <Building2 className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-charcoal-900 mb-2">
                  No team members found
                </h3>
                <p className="text-charcoal-600 mb-4">
                  {searchQuery || divisionFilter !== 'all' || roleFilter !== 'all'
                    ? 'Try adjusting your filters or search terms'
                    : 'Get started by adding your first team member'
                  }
                </p>
                {(!searchQuery && divisionFilter === 'all' && roleFilter === 'all') && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
