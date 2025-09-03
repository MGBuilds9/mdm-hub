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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDivisions } from '@/hooks/use-database';
import { userFormSchema, type UserFormData } from '@/lib/validation';
import { getInitials } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Upload,
  Trash2,
  UserPlus,
  Building2,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<UserFormData>;
  mode?: 'create' | 'edit';
}

export function UserForm({
  onSuccess,
  onCancel,
  initialData,
  mode = 'create',
}: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(
    initialData?.divisions || []
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: divisions } = useDivisions();

  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      internal: initialData?.internal || false,
      active: initialData?.active ?? true,
      divisions: initialData?.divisions || [],
      roles: initialData?.roles || {},
    },
  });

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement user creation/update
      console.log('Creating/updating user:', {
        ...data,
        divisions: selectedDivisions,
      });

      toast({
        title: 'Success',
        description: `User ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} user`,
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

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDivisionName = (divisionId: string) => {
    const division = divisions?.find(d => d.id === divisionId);
    return division?.display_name || 'Unknown Division';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          {mode === 'create' ? 'Add New User' : 'Edit User'}
        </CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Create a new team member with their roles and permissions'
            : 'Update user information and permissions'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback className="text-xl">
                {getInitials(form.watch('first_name'), form.watch('last_name'))}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById('avatar-upload')?.click()
                }
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  onClick={() => setAvatarPreview(null)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Photo
                </Button>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
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
                name="phone"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                      <Input
                        placeholder="Enter phone number"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </div>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="address"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-charcoal-400" />
                    <Textarea
                      placeholder="Enter full address"
                      className="pl-10 min-h-[80px]"
                      {...field}
                    />
                  </div>
                </div>
              )}
            />
          </div>

          {/* Account Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Controller
                  control={form.control}
                  name="internal"
                  render={({ field }) => (
                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
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

                <Controller
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                      <div className="space-y-1 leading-none">
                        <Label>Active Account</Label>
                        <p className="text-sm text-charcoal-600">
                          User can log in and access the system
                        </p>
                      </div>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {form.watch('internal')
                      ? 'Internal Staff'
                      : 'External User'}
                  </Badge>
                  <Badge
                    className={
                      form.watch('active')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {form.watch('active') ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

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
              <h3 className="text-lg font-medium">Role Assignment</h3>
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
                          <Label>Role</Label>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="project_manager">
                                Project Manager
                              </SelectItem>
                              <SelectItem value="supervisor">
                                Supervisor
                              </SelectItem>
                              <SelectItem value="estimator">
                                Estimator
                              </SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="subcontractor">
                                Subcontractor
                              </SelectItem>
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

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={isSubmitting}>
              {mode === 'create' ? 'Create User' : 'Update User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
