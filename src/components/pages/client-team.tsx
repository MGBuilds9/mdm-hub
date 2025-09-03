'use client';

import { useState } from 'react';
import { useUsersWithDivisions, useDivisions } from '@/hooks/use-database';
import { MainLayout } from '@/components/layout/main-layout';
import { Loading } from '@/components/ui/loading';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, getInitials, getRoleColor } from '@/lib/utils';
import { Search, Filter, Plus, Mail, Phone, Building2 } from 'lucide-react';

export function ClientTeam() {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
  } = useUsersWithDivisions();
  const { data: divisions, isLoading: divisionsLoading } = useDivisions();

  if (usersLoading || divisionsLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  if (usersError) {
    return (
      <MainLayout>
        <ErrorBoundary>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Team
            </h2>
            <p className="text-charcoal-600">{usersError.message}</p>
          </div>
        </ErrorBoundary>
      </MainLayout>
    );
  }

  // Filter users based on search and filters
  const filteredUsers = (users || []).filter(user => {
    const matchesSearch =
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDivision =
      divisionFilter === 'all' ||
      user.user_divisions?.some(
        (ud: { division_id: string }) => ud.division_id === divisionFilter
      );

    return matchesSearch && matchesDivision;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-950">Team</h1>
            <p className="text-charcoal-600 mt-2">
              Manage your team members and their roles
            </p>
          </div>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={divisionFilter} onValueChange={setDivisionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {(divisions || []).map(division => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback>
                    {getInitials(user.first_name, user.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-charcoal-950">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-charcoal-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {user.phone && (
                  <div className="flex items-center text-sm text-charcoal-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {user.user_divisions?.map(userDivision => (
                  <Badge
                    key={userDivision.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    {userDivision.division?.name}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-charcoal-500">
                  Added {formatDate(user.created_at)}
                </span>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-charcoal-600">No team members found.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
