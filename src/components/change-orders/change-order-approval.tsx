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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUsers } from '@/hooks/use-database';
import { toast } from '@/hooks/use-toast';
import { getInitials, formatDate } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  User,
  Building2,
  AlertTriangle,
  MessageSquare,
  Download,
} from 'lucide-react';

interface ChangeOrderApprovalProps {
  changeOrder: {
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
    attachments?: Array<{
      id: string;
      file_name: string;
      file_size: number;
      file_path: string;
    }>;
  };
  onApprove?: (changeOrderId: string) => void;
  onReject?: (changeOrderId: string, reason: string) => void;
  canApprove?: boolean;
  canReject?: boolean;
}

export function ChangeOrderApproval({
  changeOrder,
  onApprove,
  onReject,
  canApprove = false,
  canReject = false,
}: ChangeOrderApprovalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { data: users } = useUsers();

  const handleApprove = async () => {
    if (!canApprove) return;

    setIsProcessing(true);
    try {
      await onApprove?.(changeOrder.id);
      toast({
        title: 'Success',
        description: 'Change order approved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve change order',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!canReject || !rejectionReason.trim()) return;

    setIsProcessing(true);
    try {
      await onReject?.(changeOrder.id, rejectionReason);
      toast({
        title: 'Success',
        description: 'Change order rejected',
      });
      setShowRejectForm(false);
      setRejectionReason('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject change order',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
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

  const getApprovalThreshold = (amount: number) => {
    return amount >= 5000 ? 'Admin' : 'Project Manager';
  };

  const getApprovalColor = (amount: number) => {
    return amount >= 5000 ? 'text-red-600' : 'text-blue-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(changeOrder.status)}
              {changeOrder.title}
            </CardTitle>
            <CardDescription className="mt-2">
              Change order for {changeOrder.project_name}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(changeOrder.status)}>
            {changeOrder.status.charAt(0).toUpperCase() +
              changeOrder.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Change Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-charcoal-600">
                Amount
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <DollarSign className="h-4 w-4 text-charcoal-400" />
                <span className="text-2xl font-bold">
                  ${changeOrder.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-charcoal-600">
                Created By
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(
                      changeOrder.created_by_name.split(' ')[0] || '',
                      changeOrder.created_by_name.split(' ')[1] || ''
                    )}
                  </AvatarFallback>
                </Avatar>
                <span>{changeOrder.created_by_name}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-charcoal-600">
                Created Date
              </Label>
              <p className="mt-1">{formatDate(changeOrder.created_at)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-charcoal-600">
                Project
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4 text-charcoal-400" />
                <span>{changeOrder.project_name}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-charcoal-600">
                Approval Required
              </Label>
              <p
                className={`mt-1 font-medium ${getApprovalColor(changeOrder.amount)}`}
              >
                {getApprovalThreshold(changeOrder.amount)}
              </p>
            </div>

            {changeOrder.approved_by && (
              <div>
                <Label className="text-sm font-medium text-charcoal-600">
                  {changeOrder.status === 'approved'
                    ? 'Approved By'
                    : 'Rejected By'}
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(
                        changeOrder.approved_by.split(' ')[0] || '',
                        changeOrder.approved_by.split(' ')[1] || ''
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span>{changeOrder.approved_by}</span>
                </div>
                {changeOrder.approved_at && (
                  <p className="text-sm text-charcoal-600 mt-1">
                    {formatDate(changeOrder.approved_at)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm font-medium text-charcoal-600">
            Description
          </Label>
          <div className="mt-2 p-4 border rounded-lg bg-charcoal-50">
            <p className="whitespace-pre-wrap">{changeOrder.description}</p>
          </div>
        </div>

        {/* Attachments */}
        {changeOrder.attachments && changeOrder.attachments.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-charcoal-600">
              Attachments
            </Label>
            <div className="mt-2 space-y-2">
              {changeOrder.attachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-charcoal-400" />
                    <div>
                      <p className="font-medium">{attachment.file_name}</p>
                      <p className="text-sm text-charcoal-600">
                        {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {changeOrder.status === 'rejected' && changeOrder.rejection_reason && (
          <div>
            <Label className="text-sm font-medium text-charcoal-600">
              Rejection Reason
            </Label>
            <div className="mt-2 p-4 border rounded-lg bg-red-50 border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <p className="text-red-800">{changeOrder.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Approval Actions */}
        {changeOrder.status === 'pending' && (canApprove || canReject) && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Approval Actions</h4>
                <p className="text-sm text-charcoal-600">
                  {getApprovalThreshold(changeOrder.amount)} approval required
                  for this amount
                </p>
              </div>

              <div className="flex gap-2">
                {canReject && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                )}

                {canApprove && (
                  <Button
                    onClick={handleApprove}
                    loading={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
              </div>
            </div>

            {/* Rejection Form */}
            {showRejectForm && (
              <div className="mt-4 p-4 border rounded-lg bg-red-50">
                <div className="space-y-3">
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please provide a reason for rejecting this change order..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectionReason('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      loading={isProcessing}
                      disabled={!rejectionReason.trim()}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Change Order
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Approval History */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Approval History
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div>
                <p className="font-medium">Change order created</p>
                <p className="text-sm text-charcoal-600">
                  by {changeOrder.created_by_name} on{' '}
                  {formatDate(changeOrder.created_at)}
                </p>
              </div>
            </div>

            {changeOrder.status === 'approved' && changeOrder.approved_at && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div>
                  <p className="font-medium">Change order approved</p>
                  <p className="text-sm text-charcoal-600">
                    by {changeOrder.approved_by} on{' '}
                    {formatDate(changeOrder.approved_at)}
                  </p>
                </div>
              </div>
            )}

            {changeOrder.status === 'rejected' && changeOrder.approved_at && (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-red-50">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <div>
                  <p className="font-medium">Change order rejected</p>
                  <p className="text-sm text-charcoal-600">
                    by {changeOrder.approved_by} on{' '}
                    {formatDate(changeOrder.approved_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
