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
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useDivisions } from '@/hooks/use-database';
import { useCreateProject } from '@/hooks/use-database';
import { projectFormSchema, type ProjectFormData } from '@/lib/validation';
import { toast } from '@/hooks/use-toast';

interface ProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<ProjectFormData>;
}

export function ProjectForm({
  onSuccess,
  onCancel,
  initialData,
}: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: divisions } = useDivisions();
  const createProject = useCreateProject();

  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      division_id: initialData?.division_id || '',
      project_manager_id: initialData?.project_manager_id || '',
      status: initialData?.status || 'planning',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      budget: initialData?.budget || undefined,
      location: initialData?.location || '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createProject.mutateAsync(data);
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Set up a new construction project with all the necessary details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <div className="md:col-span-2 space-y-2">
                  <Label>Project Name</Label>
                  <Input placeholder="Enter project name" {...field} />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="division_id"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Division</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions?.map(division => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.display_name}
                        </SelectItem>
                      ))}
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
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="datetime-local" {...field} />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="datetime-local" {...field} />
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="budget"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
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
              name="location"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="Project location" {...field} />
                </div>
              )}
            />
          </div>

          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Enter project description"
                  className="min-h-[100px]"
                  {...field}
                />
              </div>
            )}
          />

          <div className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={isSubmitting}>
              Create Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
