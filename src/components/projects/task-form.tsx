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
import { taskFormSchema, type TaskFormData } from '@/lib/validation';
import { User, Milestone } from '@/types/database';
import { toast } from '@/hooks/use-toast';

interface TaskFormProps {
  projectId: string;
  milestones?: Milestone[];
  teamMembers?: User[];
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<TaskFormData>;
}

export function TaskForm({
  projectId,
  milestones = [],
  teamMembers = [],
  onSuccess,
  onCancel,
  initialData,
}: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      assigned_to: initialData?.assigned_to || '',
      status: initialData?.status || 'pending',
      priority: initialData?.priority || 'medium',
      due_date: initialData?.due_date || '',
      estimated_hours: initialData?.estimated_hours || undefined,
      actual_hours: initialData?.actual_hours || undefined,
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement task creation
      console.log('Creating task:', { ...data, project_id: projectId });

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Task</CardTitle>
        <CardDescription>Add a new task to track project work</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            control={form.control}
            name="title"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input placeholder="Enter task title" {...field} />
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
                  placeholder="Enter task description"
                  className="min-h-[100px]"
                  {...field}
                />
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="estimated_hours"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    {...field}
                    onChange={e =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="actual_hours"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Actual Hours</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    {...field}
                    onChange={e =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
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
              Create Task
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
