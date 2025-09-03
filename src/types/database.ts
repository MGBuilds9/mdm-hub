export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string | null;
          operation: string;
          user_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id?: string | null;
          operation: string;
          user_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string | null;
          operation?: string;
          user_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      change_orders: {
        Row: {
          id: string;
          project_id: string;
          order_number: string | null;
          title: string;
          description: string | null;
          reason: string | null;
          cost_impact: number | null;
          schedule_impact_days: number | null;
          status: Database['public']['Enums']['change_order_status'];
          requested_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejected_reason: string | null;
          documents: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          order_number?: string | null;
          title: string;
          description?: string | null;
          reason?: string | null;
          cost_impact?: number | null;
          schedule_impact_days?: number | null;
          status?: Database['public']['Enums']['change_order_status'];
          requested_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_reason?: string | null;
          documents?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          order_number?: string | null;
          title?: string;
          description?: string | null;
          reason?: string | null;
          cost_impact?: number | null;
          schedule_impact_days?: number | null;
          status?: Database['public']['Enums']['change_order_status'];
          requested_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          rejected_reason?: string | null;
          documents?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'change_orders_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'change_orders_requested_by_fkey';
            columns: ['requested_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'change_orders_approved_by_fkey';
            columns: ['approved_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      divisions: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          description: string | null;
          manager_id: string | null;
          is_active: boolean;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          description?: string | null;
          manager_id?: string | null;
          is_active?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          description?: string | null;
          manager_id?: string | null;
          is_active?: boolean;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'divisions_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          filename: string;
          storage_path: string;
          sharepoint_url: string | null;
          mime_type: string | null;
          size_bytes: number | null;
          version: number;
          tags: string[] | null;
          metadata: Json;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          filename: string;
          storage_path: string;
          sharepoint_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          version?: number;
          tags?: string[] | null;
          metadata?: Json;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          filename?: string;
          storage_path?: string;
          sharepoint_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          version?: number;
          tags?: string[] | null;
          metadata?: Json;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'documents_uploaded_by_fkey';
            columns: ['uploaded_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: Database['public']['Enums']['notification_type'];
          title: string;
          message: string | null;
          data: Json;
          read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: Database['public']['Enums']['notification_type'];
          title: string;
          message?: string | null;
          data?: Json;
          read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database['public']['Enums']['notification_type'];
          title?: string;
          message?: string | null;
          data?: Json;
          read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      photos: {
        Row: {
          id: string;
          project_id: string;
          task_id: string | null;
          filename: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          width: number | null;
          height: number | null;
          caption: string | null;
          tags: string[] | null;
          exif_data: Json | null;
          location: Json | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          task_id?: string | null;
          filename: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          caption?: string | null;
          tags?: string[] | null;
          exif_data?: Json | null;
          location?: Json | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          task_id?: string | null;
          filename?: string;
          storage_path?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          caption?: string | null;
          tags?: string[] | null;
          exif_data?: Json | null;
          location?: Json | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'photos_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'photos_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'photos_uploaded_by_fkey';
            columns: ['uploaded_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: Database['public']['Enums']['user_role'];
          hours_allocated: number | null;
          joined_at: string;
          left_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: Database['public']['Enums']['user_role'];
          hours_allocated?: number | null;
          joined_at?: string;
          left_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: Database['public']['Enums']['user_role'];
          hours_allocated?: number | null;
          joined_at?: string;
          left_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_members_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'project_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          description: string | null;
          division_id: string;
          status: Database['public']['Enums']['project_status'];
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          spent: number;
          location: string | null;
          client_name: string | null;
          client_email: string | null;
          client_phone: string | null;
          manager_id: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          description?: string | null;
          division_id: string;
          status?: Database['public']['Enums']['project_status'];
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          spent?: number;
          location?: string | null;
          client_name?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          manager_id?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          description?: string | null;
          division_id?: string;
          status?: Database['public']['Enums']['project_status'];
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          spent?: number;
          location?: string | null;
          client_name?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          manager_id?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_division_id_fkey';
            columns: ['division_id'];
            isOneToOne: false;
            referencedRelation: 'divisions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'projects_manager_id_fkey';
            columns: ['manager_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'projects_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          status: Database['public']['Enums']['task_status'];
          priority: Database['public']['Enums']['task_priority'];
          assigned_to: string | null;
          assigned_by: string | null;
          due_date: string | null;
          completed_at: string | null;
          estimated_hours: number | null;
          actual_hours: number | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          status?: Database['public']['Enums']['task_status'];
          priority?: Database['public']['Enums']['task_priority'];
          assigned_to?: string | null;
          assigned_by?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          status?: Database['public']['Enums']['task_status'];
          priority?: Database['public']['Enums']['task_priority'];
          assigned_to?: string | null;
          assigned_by?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_assigned_by_fkey';
            columns: ['assigned_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tasks_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_divisions: {
        Row: {
          id: string;
          user_id: string;
          division_id: string;
          role: Database['public']['Enums']['user_role'];
          is_primary: boolean;
          joined_at: string;
          left_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          division_id: string;
          role?: Database['public']['Enums']['user_role'];
          is_primary?: boolean;
          joined_at?: string;
          left_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          division_id?: string;
          role?: Database['public']['Enums']['user_role'];
          is_primary?: boolean;
          joined_at?: string;
          left_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_divisions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_divisions_division_id_fkey';
            columns: ['division_id'];
            isOneToOne: false;
            referencedRelation: 'divisions';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          supabase_user_id: string | null;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: Database['public']['Enums']['user_role'];
          is_active: boolean;
          is_internal: boolean;
          last_login_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supabase_user_id?: string | null;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          is_active?: boolean;
          is_internal?: boolean;
          last_login_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supabase_user_id?: string | null;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          is_active?: boolean;
          is_internal?: boolean;
          last_login_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_supabase_user_id_fkey';
            columns: ['supabase_user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      user_has_division_role: {
        Args: {
          p_user_id: string;
          p_division_id: string;
          p_role: Database['public']['Enums']['user_role'];
        };
        Returns: boolean;
      };
      user_has_project_access: {
        Args: {
          p_user_id: string;
          p_project_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      change_order_status:
        | 'draft'
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'cancelled';
      notification_type: 'info' | 'warning' | 'error' | 'success';
      project_status:
        | 'planning'
        | 'active'
        | 'on_hold'
        | 'completed'
        | 'cancelled';
      task_priority: 'low' | 'medium' | 'high' | 'urgent';
      task_status:
        | 'pending'
        | 'in_progress'
        | 'review'
        | 'completed'
        | 'cancelled';
      user_role:
        | 'admin'
        | 'manager'
        | 'supervisor'
        | 'worker'
        | 'client'
        | 'subcontractor';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

// Custom types for complex queries
export type User = Tables<'users'>;
export type Division = Tables<'divisions'>;
export type Project = Tables<'projects'>;
export type Task = Tables<'tasks'>;
export type ChangeOrder = Tables<'change_orders'>;
export type Photo = Tables<'photos'>;
export type Document = Tables<'documents'>;
export type Notification = Tables<'notifications'>;
export type UserDivision = Tables<'user_divisions'>;
export type ProjectMember = Tables<'project_members'>;
export type Milestone = Tables<'tasks'>; // Using tasks table for milestones
export type ProjectInvitation = Tables<'project_members'>; // Using project_members for invitations

// Complex types with relationships
export type UserWithDivisions = User & {
  user_divisions?: (UserDivision & {
    division?: Division;
  })[];
};

export type ProjectWithDetails = Project & {
  division?: Division;
  manager?: User;
  project_members?: (ProjectMember & {
    user?: User;
  })[];
  tasks?: Task[];
};

export type ProjectWithFullDetails = ProjectWithDetails & {
  change_orders?: ChangeOrder[];
  photos?: Photo[];
  documents?: Document[];
};

export type ChangeOrderWithDetails = ChangeOrder & {
  project?: Project;
  requested_by_user?: User;
  approved_by_user?: User;
};

export type PhotoWithDetails = Photo & {
  project?: Project;
  task?: Task;
  uploaded_by_user?: User;
};
