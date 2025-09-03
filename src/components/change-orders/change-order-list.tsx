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
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProjects, useUsers } from '@/hooks/use-database';
import { formatDate, getInitials } from '@/lib/utils';
import {
  Search,
  Filter,
  Plus,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Building2,
  User,
} from 'lucide-react';

interface ChangeOrder {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  project_id: string;
  project_name: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

interface ChangeOrderListProps {
  changeOrders: ChangeOrder[];
  onView?: (changeOrder: ChangeOrder) => void;
  onEdit?: (changeOrder: ChangeOrder) => void;
  onCreate?: () => void;
  canCreate?: boolean;
  canEdit?: boolean;
}

export function ChangeOrderList({
  changeOrders,
  onView,
  onEdit,
  onCreate,
  canCreate = false,
  canEdit = false,
}: ChangeOrderListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [amountFilter, setAmountFilter] = useState<string>('all');

  const { data: projects } = useProjects();
  const { data: users } = useUsers();

  // Filter change orders
  const filteredChangeOrders = changeOrders.filter(changeOrder => {
    const matchesSearch =
      changeOrder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      changeOrder.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      changeOrder.project_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || changeOrder.status === statusFilter;
    const matchesProject =
      projectFilter === 'all' || changeOrder.project_id === projectFilter;

    let matchesAmount = true;
    if (amountFilter !== 'all') {
      switch (amountFilter) {
        case 'under-1000':
          matchesAmount = changeOrder.amount < 1000;
          break;
        case '1000-5000':
          matchesAmount =
            changeOrder.amount >= 1000 && changeOrder.amount < 5000;
          break;
        case 'over-5000':
          matchesAmount = changeOrder.amount >= 5000;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesProject && matchesAmount;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAmountColor = (amount: number) => {
    if (amount >= 5000) return 'text-red-600 font-semibold';
    if (amount >= 1000) return 'text-orange-600 font-medium';
    return 'text-charcoal-600';
  };

  const getApprovalRequired = (amount: number) => {
    return amount >= 5000 ? 'Admin' : 'PM';
  };

  const getApprovalColor = (amount: number) => {
    return amount >= 5000
      ? 'bg-red-100 text-red-800'
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-950">
            Change Orders
          </h2>
          <p className="text-charcoal-600 mt-1">
            Manage project change orders and approvals
          </p>
        </div>
        {canCreate && (
          <Button onClick={onCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Change Order
          </Button>
        )}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search change orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={amountFilter} onValueChange={setAmountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Amounts</SelectItem>
                <SelectItem value="under-1000">Under $1,000</SelectItem>
                <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                <SelectItem value="over-5000">Over $5,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Change Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Change Orders ({filteredChangeOrders.length})</CardTitle>
          <CardDescription>
            Showing {filteredChangeOrders.length} of {changeOrders.length}{' '}
            change orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredChangeOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChangeOrders.map(changeOrder => (
                    <TableRow key={changeOrder.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(changeOrder.status)}
                          <div>
                            <div className="font-medium">
                              {changeOrder.title}
                            </div>
                            <div className="text-sm text-charcoal-600 truncate max-w-xs">
                              {changeOrder.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-charcoal-400" />
                          <span className="text-sm">
                            {changeOrder.project_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex items-center gap-1 ${getAmountColor(changeOrder.amount)}`}
                        >
                          <DollarSign className="h-3 w-3" />
                          <span>{changeOrder.amount.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(changeOrder.status)}>
                          {changeOrder.status.charAt(0).toUpperCase() +
                            changeOrder.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(
                                changeOrder.created_by_name.split(' ')[0] || '',
                                changeOrder.created_by_name.split(' ')[1] || ''
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {changeOrder.created_by_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-charcoal-600">
                          {formatDate(changeOrder.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getApprovalColor(changeOrder.amount)}>
                          {getApprovalRequired(changeOrder.amount)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView?.(changeOrder)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && changeOrder.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit?.(changeOrder)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
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
                <FileText className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-charcoal-900 mb-2">
                No change orders found
              </h3>
              <p className="text-charcoal-600 mb-4">
                {searchQuery ||
                statusFilter !== 'all' ||
                projectFilter !== 'all' ||
                amountFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first change order'}
              </p>
              {canCreate &&
                !searchQuery &&
                statusFilter === 'all' &&
                projectFilter === 'all' &&
                amountFilter === 'all' && (
                  <Button onClick={onCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Change Order
                  </Button>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">
                  Total Change Orders
                </p>
                <p className="text-2xl font-bold">{changeOrders.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {changeOrders.filter(co => co.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">
                  Approved
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {changeOrders.filter(co => co.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600">
                  Total Value
                </p>
                <p className="text-2xl font-bold">
                  $
                  {changeOrders
                    .reduce((sum, co) => sum + co.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
