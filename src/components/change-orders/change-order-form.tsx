'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/Badge';
import { useProjects, useUsers } from '@/hooks/use-database';
import {
  changeOrderFormSchema,
  type ChangeOrderFormData,
} from '@/lib/validation';
import { toast } from '@/hooks/use-toast';
import {
  DollarSign,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building2,
} from 'lucide-react';

interface ChangeOrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<ChangeOrderFormData>;
  mode?: 'create' | 'edit';
  projectId?: string;
}

export function ChangeOrderForm({
  onSuccess,
  onCancel,
  initialData,
  mode = 'create',
  projectId,
}: ChangeOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const { data: projects } = useProjects();
  const { data: users } = useUsers();

  const form = useForm({
    resolver: zodResolver(changeOrderFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      amount: initialData?.amount || 0,
    },
  });

  const onSubmit = async (data: {
    title: string;
    description: string;
    amount: number;
  }) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement change order creation/update
      console.log('Creating/updating change order:', { ...data, attachments });

      toast({
        title: 'Success',
        description: `Change order ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} change order`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getProjectName = (projectId: string) => {
    const project = projects?.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const selectedProject = projects?.find(p => p.id === projectId);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {mode === 'create' ? 'Create Change Order' : 'Edit Change Order'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Submit a new change order for approval'
            : 'Update change order details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Selection */}
          {projectId && (
            <div className="space-y-2">
              <Label>Project</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                <Building2 className="h-4 w-4" />
                {getProjectName(projectId)}
              </div>
            </div>
          )}

          {/* Project Details Preview */}
          {selectedProject && (
            <div className="p-4 border rounded-lg bg-charcoal-50">
              <h4 className="font-medium mb-2">Project Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-charcoal-600">Status:</span>
                  <Badge
                    className={`ml-2 ${getStatusColor(selectedProject.status)}`}
                  >
                    {selectedProject.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div>
                  <span className="text-charcoal-600">Location:</span>
                  <span className="ml-2">
                    {selectedProject.location || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-600">Start Date:</span>
                  <span className="ml-2">
                    {selectedProject.start_date
                      ? formatDate(selectedProject.start_date)
                      : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-charcoal-600">Budget:</span>
                  <span className="ml-2">
                    {selectedProject.budget
                      ? `$${selectedProject.budget.toLocaleString()}`
                      : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Change Order Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Change Order Details</h3>

            <Controller
              control={form.control}
              name="title"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Enter change order title" {...field} />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the changes in detail..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="amount"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      {...field}
                      onChange={e =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              )}
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Attachments</h3>

            <div className="border-2 border-dashed border-charcoal-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 text-charcoal-400 mx-auto mb-2" />
                <p className="text-sm text-charcoal-600 mb-2">
                  Upload supporting documents, photos, or drawings
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.dxf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                >
                  Choose Files
                </Button>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-charcoal-400" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-charcoal-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approval Workflow Info */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Approval Workflow
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-charcoal-400" />
                <span>
                  Change orders under $5,000: Project Manager approval
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-charcoal-400" />
                <span>Change orders over $5,000: Admin approval required</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-charcoal-400" />
                <span>Client notification will be sent upon approval</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={isSubmitting}>
              {mode === 'create'
                ? 'Submit Change Order'
                : 'Update Change Order'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'planning':
      return 'bg-blue-100 text-blue-800';
    case 'on-hold':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}
