'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Loading } from '@/components/ui/loading';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ChangeOrderList } from '@/components/change-orders/change-order-list';
import { ChangeOrderForm } from '@/components/change-orders/change-order-form';
import { ChangeOrderApproval } from '@/components/change-orders/change-order-approval';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import { hasPermission } from '@/lib/permissions';
import { toast } from '@/hooks/use-toast';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Mock data - in real app this would come from the database
const mockChangeOrders = [
  {
    id: '1',
    title: 'Additional Electrical Outlets',
    description:
      'Client requested 10 additional electrical outlets in the main conference room for presentation equipment.',
    amount: 2500,
    status: 'pending' as const,
    project_id: '1',
    project_name: 'Downtown Office Building',
    created_by: '1',
    created_by_name: 'John Smith',
    created_at: '2024-01-15T10:30:00Z',
    attachments: [
      {
        id: '1',
        file_name: 'electrical_plan.pdf',
        file_size: 1024000,
        file_path: '/attachments/electrical_plan.pdf',
      },
    ],
  },
  {
    id: '2',
    title: 'Premium Flooring Upgrade',
    description:
      'Upgrade from standard carpet to premium hardwood flooring in executive offices.',
    amount: 8500,
    status: 'approved' as const,
    project_id: '2',
    project_name: 'Residential Complex',
    created_by: '2',
    created_by_name: 'Sarah Johnson',
    created_at: '2024-01-10T14:20:00Z',
    approved_by: '3',
    approved_at: '2024-01-12T09:15:00Z',
  },
  {
    id: '3',
    title: 'Kitchen Island Addition',
    description:
      'Add custom kitchen island with granite countertop and built-in storage.',
    amount: 3200,
    status: 'rejected' as const,
    project_id: '3',
    project_name: 'Shopping Center',
    created_by: '4',
    created_by_name: 'Mike Davis',
    created_at: '2024-01-08T16:45:00Z',
    approved_by: '3',
    approved_at: '2024-01-09T11:30:00Z',
    rejection_reason:
      'Budget constraints - client requested to defer this upgrade to Phase 2',
  },
];

export default function ChangeOrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  // Mock user data - in real app this would come from the auth context
  const currentUser = {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@mdmconstruction.com',
    phone: null,
    avatar_url: null,
    is_internal: true,
    azure_ad_id: null,
    supabase_user_id: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_divisions: [
      {
        id: '1',
        user_id: '1',
        division_id: 'group',
        role: 'admin' as const,
        is_primary: true,
        created_at: '2024-01-01T00:00:00Z',
        division: {
          id: 'group',
          name: 'Group' as const,
          display_name: 'Group',
          description: 'Group division',
          color: '#3B82F6',
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      },
    ],
  };

  const canCreate = hasPermission(currentUser, 'create_change_orders');
  const canApprove = hasPermission(currentUser, 'approve_change_orders');
  const canEdit = hasPermission(currentUser, 'edit_projects');

  const handleViewChangeOrder = (changeOrder: any) => {
    setSelectedChangeOrder(changeOrder);
    setShowApprovalDialog(true);
  };

  const handleEditChangeOrder = (changeOrder: any) => {
    setSelectedChangeOrder(changeOrder);
    setShowEditForm(true);
  };

  const handleCreateChangeOrder = () => {
    setShowCreateForm(true);
  };

  const handleApproveChangeOrder = async (changeOrderId: string) => {
    try {
      // TODO: Implement approval logic
      console.log('Approving change order:', changeOrderId);
      toast({
        title: 'Success',
        description: 'Change order approved successfully',
      });
      setShowApprovalDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve change order',
        variant: 'destructive',
      });
    }
  };

  const handleRejectChangeOrder = async (
    changeOrderId: string,
    reason: string
  ) => {
    try {
      // TODO: Implement rejection logic
      console.log('Rejecting change order:', changeOrderId, 'Reason:', reason);
      toast({
        title: 'Success',
        description: 'Change order rejected',
      });
      setShowApprovalDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject change order',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedChangeOrder(null);
  };

  const handleFormCancel = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedChangeOrder(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-950">
            Change Orders
          </h1>
          <p className="text-charcoal-600 mt-2">
            Manage project change orders, approvals, and cost tracking
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Orders
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <ChangeOrderList
              changeOrders={mockChangeOrders}
              onView={handleViewChangeOrder}
              onEdit={handleEditChangeOrder}
              onCreate={handleCreateChangeOrder}
              canCreate={canCreate}
              canEdit={canEdit}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <ChangeOrderList
              changeOrders={mockChangeOrders.filter(
                co => co.status === 'pending'
              )}
              onView={handleViewChangeOrder}
              onEdit={handleEditChangeOrder}
              onCreate={handleCreateChangeOrder}
              canCreate={canCreate}
              canEdit={canEdit}
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <ChangeOrderList
              changeOrders={mockChangeOrders.filter(
                co => co.status === 'approved'
              )}
              onView={handleViewChangeOrder}
              onEdit={handleEditChangeOrder}
              onCreate={handleCreateChangeOrder}
              canCreate={canCreate}
              canEdit={canEdit}
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <ChangeOrderList
              changeOrders={mockChangeOrders.filter(
                co => co.status === 'rejected'
              )}
              onView={handleViewChangeOrder}
              onEdit={handleEditChangeOrder}
              onCreate={handleCreateChangeOrder}
              canCreate={canCreate}
              canEdit={canEdit}
            />
          </TabsContent>
        </Tabs>

        {/* Create Change Order Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Change Order</DialogTitle>
            </DialogHeader>
            <ChangeOrderForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Change Order Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Change Order</DialogTitle>
            </DialogHeader>
            <ChangeOrderForm
              mode="edit"
              initialData={selectedChangeOrder}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>

        {/* Change Order Approval Dialog */}
        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Change Order Details</DialogTitle>
            </DialogHeader>
            {selectedChangeOrder && (
              <ChangeOrderApproval
                changeOrder={selectedChangeOrder}
                onApprove={handleApproveChangeOrder}
                onReject={handleRejectChangeOrder}
                canApprove={canApprove}
                canReject={canApprove}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
