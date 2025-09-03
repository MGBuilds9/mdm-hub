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
// Form components removed - using Controller directly
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/Badge';
import { useDivisions } from '@/hooks/use-database';
import {
  userInvitationFormSchema,
  type UserInvitationFormData,
} from '@/lib/validation';
import { toast } from '@/hooks/use-toast';
import { Mail, UserPlus, Building2, Send, Users } from 'lucide-react';

interface UserInvitationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserInvitationForm({
  onSuccess,
  onCancel,
}: UserInvitationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [invitationType, setInvitationType] = useState<'single' | 'bulk'>(
    'single'
  );
  const [bulkEmails, setBulkEmails] = useState('');

  const { data: divisions } = useDivisions();

  const form = useForm({
    resolver: zodResolver(userInvitationFormSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      internal: false,
      divisions: [],
      roles: {},
    },
  });

  const onSubmit = async (data: UserInvitationFormData) => {
    setIsSubmitting(true);
    try {
      if (invitationType === 'bulk') {
        // Handle bulk invitations
        const emails = bulkEmails.split('\n').filter(email => email.trim());
        console.log('Sending bulk invitations:', {
          emails,
          divisions: selectedDivisions,
        });
      } else {
        // Handle single invitation
        console.log('Sending single invitation:', {
          ...data,
          divisions: selectedDivisions,
        });
      }

      toast({
        title: 'Success',
        description: `Invitation${invitationType === 'bulk' ? 's' : ''} sent successfully`,
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to send invitation${invitationType === 'bulk' ? 's' : ''}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDivisionToggle = (divisionId: string) => {
    setSelectedDivisions(prev =>
      prev.includes(divisionId)
        ? prev.filter(id => id !== divisionId)
        : [...prev, divisionId]
    );
  };

  const getDivisionName = (divisionId: string) => {
    const division = divisions?.find(d => d.id === divisionId);
    return division?.display_name || 'Unknown Division';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite Team Members
        </CardTitle>
        <CardDescription>
          Send invitations to new team members to join your construction
          projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Invitation Type */}
          <div className="space-y-4">
            <Label>Invitation Type</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={invitationType === 'single' ? 'default' : 'outline'}
                onClick={() => setInvitationType('single')}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Single User
              </Button>
              <Button
                type="button"
                variant={invitationType === 'bulk' ? 'default' : 'outline'}
                onClick={() => setInvitationType('bulk')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Bulk Invite
              </Button>
            </div>
          </div>

          {invitationType === 'single' ? (
            <>
              {/* Single User Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input placeholder="Enter first name" {...field} />
                    </div>
                  )}
                />

                <Controller
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input placeholder="Enter last name" {...field} />
                    </div>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                      <Input
                        placeholder="Enter email address"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="internal"
                render={({ field }) => (
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={checked =>
                        field.onChange(checked === true)
                      }
                    />
                    <div className="space-y-1 leading-none">
                      <Label>Internal Staff Member</Label>
                      <p className="text-sm text-charcoal-600">
                        Check if this user is an internal MDM employee
                      </p>
                    </div>
                  </div>
                )}
              />
            </>
          ) : (
            <>
              {/* Bulk Invite Form */}
              <div className="space-y-2">
                <Label htmlFor="bulk-emails">Email Addresses</Label>
                <Textarea
                  id="bulk-emails"
                  placeholder="Enter email addresses, one per line:&#10;john@example.com&#10;jane@example.com&#10;..."
                  value={bulkEmails}
                  onChange={e => setBulkEmails(e.target.value)}
                  className="min-h-[120px]"
                />
                <p className="text-sm text-charcoal-600">
                  Enter one email address per line. All users will be assigned
                  the same roles.
                </p>
              </div>
            </>
          )}

          {/* Division Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Division Assignment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {divisions?.map(division => (
                <div key={division.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={division.id}
                    checked={selectedDivisions.includes(division.id)}
                    onCheckedChange={() => handleDivisionToggle(division.id)}
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-charcoal-400" />
                    <Label htmlFor={division.id} className="font-medium">
                      {division.display_name}
                    </Label>
                  </div>
                </div>
              ))}
            </div>

            {selectedDivisions.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Divisions</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedDivisions.map(divisionId => (
                    <Badge key={divisionId} variant="outline">
                      {getDivisionName(divisionId)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Assignment */}
          {selectedDivisions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Default Role Assignment</h3>
              <div className="space-y-4">
                {selectedDivisions.map(divisionId => (
                  <div key={divisionId} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">
                      {getDivisionName(divisionId)}
                    </h4>
                    <Controller
                      control={form.control}
                      name={`roles.${divisionId}`}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Default Role</Label>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select default role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="subcontractor">
                                Subcontractor
                              </SelectItem>
                              <SelectItem value="supervisor">
                                Supervisor
                              </SelectItem>
                              <SelectItem value="project_manager">
                                Project Manager
                              </SelectItem>
                              <SelectItem value="estimator">
                                Estimator
                              </SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invitation Preview */}
          {invitationType === 'single' &&
            form.watch('email') &&
            selectedDivisions.length > 0 && (
              <div className="border rounded-lg p-4 bg-charcoal-50">
                <h4 className="font-medium mb-2">Invitation Preview</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Email:</strong> {form.watch('email')}
                  </p>
                  <p>
                    <strong>Name:</strong> {form.watch('first_name')}{' '}
                    {form.watch('last_name')}
                  </p>
                  <p>
                    <strong>Type:</strong>{' '}
                    {form.watch('internal')
                      ? 'Internal Staff'
                      : 'External User'}
                  </p>
                  <p>
                    <strong>Divisions:</strong>{' '}
                    {selectedDivisions.map(getDivisionName).join(', ')}
                  </p>
                </div>
              </div>
            )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              Send Invitation{invitationType === 'bulk' ? 's' : ''}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
