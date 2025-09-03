'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/Badge'
import { projectStatusUpdateSchema, type ProjectStatusUpdateData } from '@/lib/validation'
import { Project, ProjectStatus } from '@/types/database'
import { getStatusColor } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { ArrowRight, CheckCircle, Pause, Play, Archive, X } from 'lucide-react'

interface ProjectStatusWorkflowProps {
  project: Project
  onStatusUpdate?: (status: ProjectStatus, reason?: string) => void
}

const statusTransitions: Record<ProjectStatus, ProjectStatus[]> = {
  planning: ['active', 'cancelled'],
  active: ['on-hold', 'completed', 'cancelled'],
  'on-hold': ['active', 'cancelled'],
  completed: ['active'], // Allow reopening if needed
  cancelled: [], // Terminal state
}

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  planning: <CheckCircle className="h-4 w-4" />,
  active: <Play className="h-4 w-4" />,
  'on-hold': <Pause className="h-4 w-4" />,
  completed: <CheckCircle className="h-4 w-4" />,
  cancelled: <X className="h-4 w-4" />,
}

const statusLabels: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function ProjectStatusWorkflow({ project, onStatusUpdate }: ProjectStatusWorkflowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const form = useForm<ProjectStatusUpdateData>({
    resolver: zodResolver(projectStatusUpdateSchema),
    defaultValues: {
      status: project.status,
      reason: '',
    },
  })

  const availableTransitions = statusTransitions[project.status] || []

  const handleStatusSelect = (status: ProjectStatus) => {
    setSelectedStatus(status)
    form.setValue('status', status)
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: ProjectStatusUpdateData) => {
    setIsUpdating(true)
    try {
      await onStatusUpdate?.(data.status, data.reason)
      toast({
        title: 'Success',
        description: `Project status updated to ${statusLabels[data.status]}`,
      })
      setIsDialogOpen(false)
      setSelectedStatus(null)
      form.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
        <CardDescription>Manage project status and workflow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Current Status:</span>
          <Badge className={getStatusColor(project.status)}>
            {statusIcons[project.status]}
            <span className="ml-1">{statusLabels[project.status]}</span>
          </Badge>
        </div>

        {/* Available Transitions */}
        {availableTransitions.length > 0 ? (
          <div className="space-y-3">
            <span className="text-sm font-medium">Available Actions:</span>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusSelect(status)}
                  className="flex items-center gap-2"
                >
                  {statusIcons[status]}
                  <span>Move to {statusLabels[status]}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-charcoal-600">
            No status transitions available from current state
          </div>
        )}

        {/* Status Update Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Project Status</DialogTitle>
              <DialogDescription>
                Change project status from {statusLabels[project.status]} to {selectedStatus && statusLabels[selectedStatus]}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Change (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain why you're changing the project status..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={isUpdating}>
                    Update Status
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Status History */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Status History</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Badge className={getStatusColor(project.status)}>
                {statusIcons[project.status]}
                <span className="ml-1">{statusLabels[project.status]}</span>
              </Badge>
              <span className="text-charcoal-600">Current</span>
            </div>
            {/* TODO: Add status history from audit log */}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
