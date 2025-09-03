'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
import { Label } from '@/components/ui/label';
import { milestoneFormSchema, type MilestoneFormData } from '@/lib/validation';
import { toast } from '@/hooks/use-toast';

interface MilestoneFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<MilestoneFormData>;
}

export function MilestoneForm({
  projectId,
  onSuccess,
  onCancel,
  initialData,
}: MilestoneFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      due_date: initialData?.due_date || '',
      completion_percentage: initialData?.completion_percentage || 0,
    },
  });

  const onSubmit = async (data: MilestoneFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement milestone creation
      console.log('Creating milestone:', { ...data, project_id: projectId });

      toast({
        title: 'Success',
        description: 'Milestone created successfully',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create milestone',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Milestone</CardTitle>
        <CardDescription>
          Set up a key milestone for tracking project progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            control={form.control}
            name="name"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Milestone Name</Label>
                <Input placeholder="Enter milestone name" {...field} />
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
                  placeholder="Enter milestone description"
                  className="min-h-[100px]"
                  {...field}
                />
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="datetime-local" {...field} />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="completion_percentage"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Initial Progress (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    {...field}
                    onChange={e =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={isSubmitting}>
              Create Milestone
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
