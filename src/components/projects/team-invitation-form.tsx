'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { projectInvitationFormSchema, type ProjectInvitationFormData } from '@/lib/validation'
import { toast } from '@/hooks/use-toast'
import { UserPlus, Mail } from 'lucide-react'

interface TeamInvitationFormProps {
  projectId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function TeamInvitationForm({ projectId, onSuccess, onCancel }: TeamInvitationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProjectInvitationFormData>({
    resolver: zodResolver(projectInvitationFormSchema),
    defaultValues: {
      email: '',
      role: 'worker',
    },
  })

  const onSubmit = async (data: ProjectInvitationFormData) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement team invitation
      console.log('Sending invitation:', { ...data, project_id: projectId })
      
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite Team Member
        </CardTitle>
        <CardDescription>
          Send an invitation to join this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                      <Input 
                        placeholder="Enter email address" 
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="observer">
                        <div>
                          <div className="font-medium">Observer</div>
                          <div className="text-sm text-charcoal-600">View-only access</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="worker">
                        <div>
                          <div className="font-medium">Worker</div>
                          <div className="text-sm text-charcoal-600">Can update tasks and upload photos</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="supervisor">
                        <div>
                          <div className="font-medium">Supervisor</div>
                          <div className="text-sm text-charcoal-600">Can manage tasks and team members</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div>
                          <div className="font-medium">Manager</div>
                          <div className="text-sm text-charcoal-600">Full project management access</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" loading={isSubmitting}>
                Send Invitation
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
