import { z } from 'zod'

// User validation schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  is_internal: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createUserSchema = userSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateUserSchema = createUserSchema.partial()

// Division validation schemas
export const divisionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  display_name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createDivisionSchema = divisionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateDivisionSchema = createDivisionSchema.partial()

// User division validation schemas
export const userDivisionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  division_id: z.string().uuid(),
  role: z.enum(['admin', 'manager', 'member']),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createUserDivisionSchema = userDivisionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateUserDivisionSchema = createUserDivisionSchema.partial()

// Project validation schemas
export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  division_id: z.string().uuid(),
  project_manager_id: z.string().uuid(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  location: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createProjectSchema = projectSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateProjectSchema = createProjectSchema.partial()

// Project user validation schemas
export const projectUserSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['manager', 'supervisor', 'worker', 'observer']),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createProjectUserSchema = projectUserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateProjectUserSchema = createProjectUserSchema.partial()

// Photo validation schemas
export const photoSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  uploaded_by: z.string().uuid(),
  file_path: z.string().min(1),
  file_name: z.string().min(1),
  file_size: z.number().positive(),
  mime_type: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  exif_data: z.record(z.any()).optional(),
  is_public: z.boolean().default(false),
  created_at: z.string().datetime(),
})

export const createPhotoSchema = photoSchema.omit({
  id: true,
  created_at: true,
})

export const updatePhotoSchema = createPhotoSchema.partial()

// Change order validation schemas
export const changeOrderSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  created_by: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  amount: z.number().positive(),
  status: z.enum(['pending', 'approved', 'rejected']),
  approved_by: z.string().uuid().optional(),
  approved_at: z.string().datetime().optional(),
  rejection_reason: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createChangeOrderSchema = changeOrderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  approved_by: true,
  approved_at: true,
  rejection_reason: true,
})

export const updateChangeOrderSchema = createChangeOrderSchema.partial()

export const approveChangeOrderSchema = z.object({
  approved_by: z.string().uuid(),
})

export const rejectChangeOrderSchema = z.object({
  rejection_reason: z.string().min(1),
})

// Change order attachment validation schemas
export const changeOrderAttachmentSchema = z.object({
  id: z.string().uuid(),
  change_order_id: z.string().uuid(),
  file_path: z.string().min(1),
  file_name: z.string().min(1),
  file_size: z.number().positive(),
  mime_type: z.string().min(1),
  created_at: z.string().datetime(),
})

export const createChangeOrderAttachmentSchema = changeOrderAttachmentSchema.omit({
  id: true,
  created_at: true,
})

// Notification validation schemas
export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  type: z.enum(['info', 'warning', 'error', 'success']),
  is_read: z.boolean().default(false),
  sent_at: z.string().datetime(),
  read_at: z.string().datetime().optional(),
})

export const createNotificationSchema = notificationSchema.omit({
  id: true,
  sent_at: true,
  read_at: true,
})

// Form validation schemas
export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const profileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
})

export const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  division_id: z.string().uuid('Please select a division'),
  project_manager_id: z.string().uuid('Please select a project manager'),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  location: z.string().optional(),
})

export const changeOrderFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
})

export const photoFormSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  is_public: z.boolean().default(false),
})

// Search and filter schemas
export const projectSearchSchema = z.object({
  query: z.string().optional(),
  division_id: z.string().uuid().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
  project_manager_id: z.string().uuid().optional(),
  start_date_from: z.string().datetime().optional(),
  start_date_to: z.string().datetime().optional(),
  end_date_from: z.string().datetime().optional(),
  end_date_to: z.string().datetime().optional(),
})

export const userSearchSchema = z.object({
  query: z.string().optional(),
  division_id: z.string().uuid().optional(),
  role: z.enum(['admin', 'manager', 'member']).optional(),
  is_active: z.boolean().optional(),
  is_internal: z.boolean().optional(),
})

export const photoSearchSchema = z.object({
  query: z.string().optional(),
  project_id: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().optional(),
  uploaded_by: z.string().uuid().optional(),
  created_date_from: z.string().datetime().optional(),
  created_date_to: z.string().datetime().optional(),
})

// Export types
export type UserFormData = z.infer<typeof userSchema>
export type CreateUserData = z.infer<typeof createUserSchema>
export type UpdateUserData = z.infer<typeof updateUserSchema>

export type DivisionFormData = z.infer<typeof divisionSchema>
export type CreateDivisionData = z.infer<typeof createDivisionSchema>
export type UpdateDivisionData = z.infer<typeof updateDivisionSchema>

export type UserDivisionFormData = z.infer<typeof userDivisionSchema>
export type CreateUserDivisionData = z.infer<typeof createUserDivisionSchema>
export type UpdateUserDivisionData = z.infer<typeof updateUserDivisionSchema>

export type ProjectFormData = z.infer<typeof projectSchema>
export type CreateProjectData = z.infer<typeof createProjectSchema>
export type UpdateProjectData = z.infer<typeof updateProjectSchema>

export type ProjectUserFormData = z.infer<typeof projectUserSchema>
export type CreateProjectUserData = z.infer<typeof createProjectUserSchema>
export type UpdateProjectUserData = z.infer<typeof updateProjectUserSchema>

export type PhotoFormData = z.infer<typeof photoSchema>
export type CreatePhotoData = z.infer<typeof createPhotoSchema>
export type UpdatePhotoData = z.infer<typeof updatePhotoSchema>

export type ChangeOrderFormData = z.infer<typeof changeOrderSchema>
export type CreateChangeOrderData = z.infer<typeof createChangeOrderSchema>
export type UpdateChangeOrderData = z.infer<typeof updateChangeOrderSchema>
export type ApproveChangeOrderData = z.infer<typeof approveChangeOrderSchema>
export type RejectChangeOrderData = z.infer<typeof rejectChangeOrderSchema>

export type ChangeOrderAttachmentFormData = z.infer<typeof changeOrderAttachmentSchema>
export type CreateChangeOrderAttachmentData = z.infer<typeof createChangeOrderAttachmentSchema>

export type NotificationFormData = z.infer<typeof notificationSchema>
export type CreateNotificationData = z.infer<typeof createNotificationSchema>

export type LoginFormData = z.infer<typeof loginFormSchema>
export type ProfileFormData = z.infer<typeof profileFormSchema>
export type ProjectFormData = z.infer<typeof projectFormSchema>
export type ChangeOrderFormData = z.infer<typeof changeOrderFormSchema>
export type PhotoFormData = z.infer<typeof photoFormSchema>

export type ProjectSearchData = z.infer<typeof projectSearchSchema>
export type UserSearchData = z.infer<typeof userSearchSchema>
export type PhotoSearchData = z.infer<typeof photoSearchSchema>

// Project Management Validation Schemas
export const milestoneSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  name: z.string().min(1, 'Milestone name is required'),
  description: z.string().optional(),
  due_date: z.string().datetime('Invalid due date'),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']),
  completion_percentage: z.number().min(0).max(100),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createMilestoneSchema = milestoneSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateMilestoneSchema = createMilestoneSchema.partial()

export const taskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  milestone_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().min(0).optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createTaskSchema = taskSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateTaskSchema = createTaskSchema.partial()

export const projectInvitationSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  email: z.string().email('Invalid email address'),
  role: z.enum(['manager', 'supervisor', 'worker', 'observer']),
  invited_by: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'declined', 'expired']),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const createProjectInvitationSchema = projectInvitationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateProjectInvitationSchema = createProjectInvitationSchema.partial()

// Form validation schemas
export const milestoneFormSchema = z.object({
  name: z.string().min(1, 'Milestone name is required'),
  description: z.string().optional(),
  due_date: z.string().datetime('Invalid due date'),
  completion_percentage: z.number().min(0).max(100).default(0),
})

export const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().min(0).optional(),
})

export const projectInvitationFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['manager', 'supervisor', 'worker', 'observer']),
})

export const projectStatusUpdateSchema = z.object({
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  reason: z.string().optional(),
})

// Search and filter schemas
export const milestoneSearchSchema = z.object({
  query: z.string().optional(),
  project_id: z.string().uuid().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'overdue']).optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
})

export const taskSearchSchema = z.object({
  query: z.string().optional(),
  project_id: z.string().uuid().optional(),
  milestone_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
})

// Export types
export type MilestoneFormData = z.infer<typeof milestoneSchema>
export type CreateMilestoneData = z.infer<typeof createMilestoneSchema>
export type UpdateMilestoneData = z.infer<typeof updateMilestoneSchema>

export type TaskFormData = z.infer<typeof taskSchema>
export type CreateTaskData = z.infer<typeof createTaskSchema>
export type UpdateTaskData = z.infer<typeof updateTaskSchema>

export type ProjectInvitationFormData = z.infer<typeof projectInvitationSchema>
export type CreateProjectInvitationData = z.infer<typeof createProjectInvitationSchema>
export type UpdateProjectInvitationData = z.infer<typeof updateProjectInvitationSchema>

export type MilestoneFormData = z.infer<typeof milestoneFormSchema>
export type TaskFormData = z.infer<typeof taskFormSchema>
export type ProjectInvitationFormData = z.infer<typeof projectInvitationFormSchema>
export type ProjectStatusUpdateData = z.infer<typeof projectStatusUpdateSchema>

export type MilestoneSearchData = z.infer<typeof milestoneSearchSchema>
export type TaskSearchData = z.infer<typeof taskSearchSchema>
