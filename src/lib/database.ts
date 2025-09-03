import { supabase, createServerClient } from './supabase';
import {
  User,
  Project,
  Division,
  UserDivision,
  ProjectUser,
  Photo,
  ChangeOrder,
  ChangeOrderAttachment,
  Notification,
  UserWithDivisions,
  ProjectWithDetails,
  ChangeOrderWithDetails,
  PhotoWithDetails,
  ProjectWithFullDetails,
  Milestone,
  Task,
  ProjectInvitation,
  Database,
} from '@/types/database';
import { PostgrestError } from '@supabase/supabase-js';

// Generic error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: PostgrestError | Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Helper function to handle Supabase errors
const handleError = (
  error: PostgrestError | Error,
  operation: string
): never => {
  console.error(`Database ${operation} error:`, error);
  throw new DatabaseError(`Failed to ${operation}`, error);
};

// User operations
export const userService = {
  // Get user by ID
  async getById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        handleError(error, 'get user by ID');
      }

      return data;
    } catch (error) {
      handleError(error as Error, 'get user by ID');
    }
    return null; // This line will never be reached due to handleError throwing
  },

  // Get all users
  async getAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, 'get all users');
      }

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get all users');
    }
    return []; // This line will never be reached due to handleError throwing
  },

  // Get all users with divisions
  async getAllWithDivisions(): Promise<UserWithDivisions[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          *,
          user_divisions (
            *,
            division:divisions (*)
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        handleError(error, 'get all users with divisions');
      }

      return (data || []) as UserWithDivisions[];
    } catch (error) {
      handleError(error as Error, 'get all users with divisions');
    }
    return []; // This line will never be reached due to handleError throwing
  },

  // Get user with divisions
  async getWithDivisions(id: string): Promise<UserWithDivisions | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          *,
          user_divisions (
            *,
            division:divisions (*)
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleError(error, 'get user with divisions');
      }

      return data as UserWithDivisions;
    } catch (error) {
      handleError(error as Error, 'get user with divisions');
    }
    return null; // This line will never be reached due to handleError throwing
  },

  // Update user profile
  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'update user');

      if (!data) handleError(new Error('No data returned'), 'update user');
      return data as User;
    } catch (error) {
      handleError(error as Error, 'update user');
    }
    return {} as User; // This line will never be reached due to handleError throwing
  },

  // Get users by division
  async getByDivision(divisionId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          *,
          user_divisions!inner (
            division_id
          )
        `
        )
        .eq('user_divisions.division_id', divisionId);

      if (error) handleError(error, 'get users by division');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get users by division');
    }
    return []; // This line will never be reached due to handleError throwing
  },
};

// Division operations
export const divisionService = {
  // Get all divisions
  async getAll(): Promise<Division[]> {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .select('*')
        .order('display_name');

      if (error) handleError(error, 'get all divisions');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get all divisions');
    }
    return []; // This line will never be reached due to handleError throwing
  },

  // Get division by ID
  async getById(id: string): Promise<Division | null> {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleError(error, 'get division by ID');
      }

      return data;
    } catch (error) {
      handleError(error as Error, 'get division by ID');
    }
    return null; // This line will never be reached due to handleError throwing
  },

  // Create division
  async create(
    division: Omit<Division, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Division> {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .insert(division)
        .select()
        .single();

      if (error) handleError(error, 'create division');

      if (!data) handleError(new Error('No data returned'), 'create division');
      return data as Division;
    } catch (error) {
      handleError(error as Error, 'create division');
    }
    return {} as Division; // This line will never be reached due to handleError throwing
  },

  // Update division
  async update(id: string, updates: Partial<Division>): Promise<Division> {
    try {
      const { data, error } = await supabase
        .from('divisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'update division');

      if (!data) handleError(new Error('No data returned'), 'update division');
      return data as Division;
    } catch (error) {
      handleError(error as Error, 'update division');
    }
    return {} as Division; // This line will never be reached due to handleError throwing
  },
};

// Project operations
export const projectService = {
  // Get all projects
  async getAll(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'get all projects');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get all projects');
    }
    return []; // This line will never be reached due to handleError throwing
  },

  // Get project by ID
  async getById(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleError(error, 'get project by ID');
      }

      return data;
    } catch (error) {
      handleError(error as Error, 'get project by ID');
    }
    return null; // This line will never be reached due to handleError throwing
  },

  // Get project with details
  async getWithDetails(id: string): Promise<ProjectWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          *,
          division:divisions (*),
          project_manager:users!projects_project_manager_id_fkey (*),
          project_users (
            *,
            user:users (*)
          ),
          photos (*),
          change_orders (*)
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleError(error, 'get project with details');
      }

      return data as ProjectWithDetails;
    } catch (error) {
      handleError(error as Error, 'get project with details');
    }
    return null; // This line will never be reached due to handleError throwing
  },

  // Get project with full details including milestones and tasks
  async getWithFullDetails(id: string): Promise<ProjectWithFullDetails | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(
          `
          *,
          division:divisions (*),
          project_manager:users!projects_project_manager_id_fkey (*),
          project_users (
            *,
            user:users (*)
          ),
          photos (*),
          change_orders (*),
          milestones (*),
          tasks (*),
          invitations (*)
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleError(error, 'get project with full details');
      }

      return data as unknown as ProjectWithFullDetails;
    } catch (error) {
      handleError(error as Error, 'get project with full details');
    }
    return null; // This line will never be reached due to handleError throwing
  },

  // Get projects by division
  async getByDivision(divisionId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('division_id', divisionId)
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'get projects by division');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get projects by division');
    }
    return []; // This line will never be reached due to handleError throwing
  },

  // Create project
  async create(
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) handleError(error, 'create project');

      if (!data) handleError(new Error('No data returned'), 'create project');
      return data as Project;
    } catch (error) {
      handleError(error as Error, 'create project');
    }
    return {} as Project; // This line will never be reached due to handleError throwing
  },

  // Update project
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'update project');

      if (!data) handleError(new Error('No data returned'), 'update project');
      return data as Project;
    } catch (error) {
      handleError(error as Error, 'update project');
    }
    return {} as Project; // This line will never be reached due to handleError throwing
  },

  // Delete project
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);

      if (error) handleError(error, 'delete project');
    } catch (error) {
      handleError(error as Error, 'delete project');
    }
  },
};

// Photo operations
export const photoService = {
  // Get photos by project
  async getByProject(projectId: string): Promise<Photo[]> {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'get photos by project');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get photos by project');
    }
    return [];
  },

  // Get photo with details
  async getWithDetails(id: string): Promise<PhotoWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select(
          `
          *,
          project:projects (*),
          uploaded_by_user:users!photos_uploaded_by_fkey (*)
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleError(error, 'get photo with details');
      }

      return data as PhotoWithDetails;
    } catch (error) {
      handleError(error as Error, 'get photo with details');
    }
    return null;
  },

  // Create photo
  async create(photo: Omit<Photo, 'id' | 'created_at'>): Promise<Photo> {
    try {
      const { data, error } = await supabase
        .from('photos')
        .insert(photo)
        .select()
        .single();

      if (error) handleError(error, 'create photo');

      if (!data) handleError(new Error('No data returned'), 'create photo');
      return data as Photo;
    } catch (error) {
      handleError(error as Error, 'create photo');
    }
    return {} as Photo;
  },

  // Update photo
  async update(id: string, updates: Partial<Photo>): Promise<Photo> {
    try {
      const { data, error } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'update photo');

      if (!data) handleError(new Error('No data returned'), 'update photo');
      return data as Photo;
    } catch (error) {
      handleError(error as Error, 'update photo');
    }
    return {} as Photo;
  },

  // Delete photo
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('photos').delete().eq('id', id);

      if (error) handleError(error, 'delete photo');
    } catch (error) {
      handleError(error as Error, 'delete photo');
    }
  },
};

// Change order operations
export const changeOrderService = {
  // Get change orders by project
  async getByProject(projectId: string): Promise<ChangeOrder[]> {
    try {
      const { data, error } = await supabase
        .from('change_orders')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'get change orders by project');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get change orders by project');
    }
    return [];
  },

  // Get change order with details
  async getWithDetails(id: string): Promise<ChangeOrderWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('change_orders')
        .select(
          `
          *,
          project:projects (*),
          created_by_user:users!change_orders_created_by_fkey (*),
          approved_by_user:users!change_orders_approved_by_fkey (*),
          attachments:change_order_attachments (*)
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        handleError(error, 'get change order with details');
      }

      return data as ChangeOrderWithDetails;
    } catch (error) {
      handleError(error as Error, 'get change order with details');
    }
    return null;
  },

  // Create change order
  async create(
    changeOrder: Omit<ChangeOrder, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ChangeOrder> {
    try {
      const { data, error } = await supabase
        .from('change_orders')
        .insert(changeOrder)
        .select()
        .single();

      if (error) handleError(error, 'create change order');

      if (!data)
        handleError(new Error('No data returned'), 'create change order');
      return data as ChangeOrder;
    } catch (error) {
      handleError(error as Error, 'create change order');
    }
    return {} as ChangeOrder;
  },

  // Update change order
  async update(
    id: string,
    updates: Partial<ChangeOrder>
  ): Promise<ChangeOrder> {
    try {
      const { data, error } = await supabase
        .from('change_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'update change order');

      if (!data)
        handleError(new Error('No data returned'), 'update change order');
      return data as ChangeOrder;
    } catch (error) {
      handleError(error as Error, 'update change order');
    }
    return {} as ChangeOrder;
  },

  // Approve change order
  async approve(id: string, approvedBy: string): Promise<ChangeOrder> {
    try {
      const { data, error } = await supabase
        .from('change_orders')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'approve change order');

      if (!data)
        handleError(new Error('No data returned'), 'approve change order');
      return data as ChangeOrder;
    } catch (error) {
      handleError(error as Error, 'approve change order');
    }
    return {} as ChangeOrder;
  },

  // Reject change order
  async reject(id: string, rejectionReason: string): Promise<ChangeOrder> {
    try {
      const { data, error } = await supabase
        .from('change_orders')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'reject change order');

      if (!data)
        handleError(new Error('No data returned'), 'reject change order');
      return data as ChangeOrder;
    } catch (error) {
      handleError(error as Error, 'reject change order');
    }
    return {} as ChangeOrder;
  },
};

// Notification operations
export const notificationService = {
  // Get notifications for user
  async getByUser(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false });

      if (error) handleError(error, 'get notifications by user');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get notifications by user');
    }
    return [];
  },

  // Get unread notifications
  async getUnread(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('sent_at', { ascending: false });

      if (error) handleError(error, 'get unread notifications');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get unread notifications');
    }
    return [];
  },

  // Create notification
  async create(
    notification: Omit<Notification, 'id' | 'sent_at' | 'read_at'>
  ): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) handleError(error, 'create notification');

      if (!data)
        handleError(new Error('No data returned'), 'create notification');
      return data as Notification;
    } catch (error) {
      handleError(error as Error, 'create notification');
    }
    return {} as Notification;
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'mark notification as read');

      if (!data)
        handleError(new Error('No data returned'), 'mark notification as read');
      return data as Notification;
    } catch (error) {
      handleError(error as Error, 'mark notification as read');
    }
    return {} as Notification;
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) handleError(error, 'mark all notifications as read');
    } catch (error) {
      handleError(error as Error, 'mark all notifications as read');
    }
  },
};

// Milestone operations
export const milestoneService = {
  // Get milestones by project
  async getByProject(projectId: string): Promise<Milestone[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date');

      if (error) handleError(error, 'get milestones by project');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get milestones by project');
    }
    return [];
  },

  // Create milestone
  async create(
    milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Milestone> {
    try {
      const { data, error } = await (supabase as any)
        .from('milestones')
        .insert(milestone)
        .select()
        .single();

      if (error) handleError(error, 'create milestone');

      if (!data) handleError(new Error('No data returned'), 'create milestone');
      return data as Milestone;
    } catch (error) {
      handleError(error as Error, 'create milestone');
    }
    return {} as Milestone;
  },

  // Update milestone
  async update(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    try {
      const { data, error } = await (supabase as any)
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'update milestone');

      if (!data) handleError(new Error('No data returned'), 'update milestone');
      return data as Milestone;
    } catch (error) {
      handleError(error as Error, 'update milestone');
    }
    return {} as Milestone;
  },
};

// Task operations
export const taskService = {
  // Get tasks by project
  async getByProject(projectId: string): Promise<Task[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'get tasks by project');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get tasks by project');
    }
    return [];
  },

  // Create task
  async create(
    task: Omit<Task, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Task> {
    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (error) handleError(error, 'create task');

      if (!data) handleError(new Error('No data returned'), 'create task');
      return data as Task;
    } catch (error) {
      handleError(error as Error, 'create task');
    }
    return {} as Task;
  },

  // Update task
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    try {
      const { data, error } = await (supabase as any)
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'update task');

      if (!data) handleError(new Error('No data returned'), 'update task');
      return data as Task;
    } catch (error) {
      handleError(error as Error, 'update task');
    }
    return {} as Task;
  },
};

// Project invitation operations
export const projectInvitationService = {
  // Get invitations by project
  async getByProject(projectId: string): Promise<ProjectInvitation[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('project_invitations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) handleError(error, 'get invitations by project');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get invitations by project');
    }
    return [];
  },

  // Create invitation
  async create(
    invitation: Omit<ProjectInvitation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ProjectInvitation> {
    try {
      const { data, error } = await (supabase as any)
        .from('project_invitations')
        .insert(invitation)
        .select()
        .single();

      if (error) handleError(error, 'create invitation');

      if (!data)
        handleError(new Error('No data returned'), 'create invitation');
      return data as unknown as ProjectInvitation;
    } catch (error) {
      handleError(error as Error, 'create invitation');
    }
    return {} as ProjectInvitation;
  },

  // Update invitation
  async update(
    id: string,
    updates: Partial<ProjectInvitation>
  ): Promise<ProjectInvitation> {
    try {
      const { data, error } = await (supabase as any)
        .from('project_invitations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleError(error, 'update invitation');

      if (!data)
        handleError(new Error('No data returned'), 'update invitation');
      return data as unknown as ProjectInvitation;
    } catch (error) {
      handleError(error as Error, 'update invitation');
    }
    return {} as ProjectInvitation;
  },
};

// RLS testing functions
export const rlsService = {
  // Test user access to project
  async testProjectAccess(userId: string, projectId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('user_has_project_access', {
        user_id: userId,
        project_id: projectId,
      });

      if (error) handleError(error, 'test project access');

      return data || false;
    } catch (error) {
      handleError(error as Error, 'test project access');
    }
    return false;
  },

  // Get user divisions
  async getUserDivisions(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_divisions', {
        user_id: userId,
      });

      if (error) handleError(error, 'get user divisions');

      return data || [];
    } catch (error) {
      handleError(error as Error, 'get user divisions');
    }
    return [];
  },

  // Set current user context
  async setCurrentUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_current_user', {
        user_id: userId,
      });

      if (error) handleError(error, 'set current user');
    } catch (error) {
      handleError(error as Error, 'set current user');
    }
  },
};
