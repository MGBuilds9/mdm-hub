export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_log: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values: Json | null
          new_values: Json | null
          changed_by: string | null
          changed_at: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values?: Json | null
          new_values?: Json | null
          changed_by?: string | null
          changed_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: 'INSERT' | 'UPDATE' | 'DELETE'
          old_values?: Json | null
          new_values?: Json | null
          changed_by?: string | null
          changed_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      change_order_attachments: {
        Row: {
          id: string
          change_order_id: string
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          change_order_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          change_order_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_order_attachments_change_order_id_fkey"
            columns: ["change_order_id"]
            isOneToOne: false
            referencedRelation: "change_orders"
            referencedColumns: ["id"]
          }
        ]
      }
      change_orders: {
        Row: {
          id: string
          project_id: string
          created_by: string
          title: string
          description: string
          reason: string | null
          estimated_cost: number | null
          estimated_hours: number | null
          status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'implemented'
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          created_by: string
          title: string
          description: string
          reason?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'implemented'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          created_by?: string
          title?: string
          description?: string
          reason?: string | null
          estimated_cost?: number | null
          estimated_hours?: number | null
          status?: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'implemented'
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      divisions: {
        Row: {
          id: string
          name: 'Group' | 'Contracting' | 'Homes' | 'Wood' | 'Telecom'
          display_name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: 'Group' | 'Contracting' | 'Homes' | 'Wood' | 'Telecom'
          display_name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: 'Group' | 'Contracting' | 'Homes' | 'Wood' | 'Telecom'
          display_name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'project_update' | 'change_order' | 'photo_upload' | 'system_alert'
          title: string
          message: string
          data: Json | null
          is_read: boolean
          sent_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'project_update' | 'change_order' | 'photo_upload' | 'system_alert'
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          sent_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'project_update' | 'change_order' | 'photo_upload' | 'system_alert'
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          sent_at?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      photos: {
        Row: {
          id: string
          project_id: string
          uploaded_by: string
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          camera_make: string | null
          camera_model: string | null
          taken_at: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          gps_altitude: number | null
          description: string | null
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          uploaded_by: string
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          camera_make?: string | null
          camera_model?: string | null
          taken_at?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          gps_altitude?: number | null
          description?: string | null
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          uploaded_by?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          camera_make?: string | null
          camera_model?: string | null
          taken_at?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          gps_altitude?: number | null
          description?: string | null
          tags?: string[] | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      project_users: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'admin' | 'manager' | 'supervisor' | 'worker' | 'viewer'
          assigned_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'admin' | 'manager' | 'supervisor' | 'worker' | 'viewer'
          assigned_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'admin' | 'manager' | 'supervisor' | 'worker' | 'viewer'
          assigned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_users_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          division_id: string
          project_manager_id: string | null
          status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
          start_date: string | null
          end_date: string | null
          budget: number | null
          location: string | null
          client_name: string | null
          client_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          division_id: string
          project_manager_id?: string | null
          status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          location?: string | null
          client_name?: string | null
          client_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          division_id?: string
          project_manager_id?: string | null
          status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          location?: string | null
          client_name?: string | null
          client_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_id_fkey"
            columns: ["project_manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_divisions: {
        Row: {
          id: string
          user_id: string
          division_id: string
          role: 'admin' | 'manager' | 'supervisor' | 'worker' | 'viewer'
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          division_id: string
          role?: 'admin' | 'manager' | 'supervisor' | 'worker' | 'viewer'
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          division_id?: string
          role?: 'admin' | 'manager' | 'supervisor' | 'worker' | 'viewer'
          is_primary?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_divisions_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_divisions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          is_internal: boolean
          azure_ad_id: string | null
          supabase_user_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          is_internal?: boolean
          azure_ad_id?: string | null
          supabase_user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          is_internal?: boolean
          azure_ad_id?: string | null
          supabase_user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_divisions: {
        Args: {
          user_id: string
        }
        Returns: {
          division_id: string
          division_name: 'Group' | 'Contracting' | 'Homes' | 'Wood' | 'Telecom'
          role: 'admin' | 'manager' | 'supervisor' | 'worker' | 'viewer'
          is_primary: boolean
        }[]
      }
      set_current_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      user_has_project_access: {
        Args: {
          user_id: string
          project_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      audit_action: 'INSERT' | 'UPDATE' | 'DELETE'
      change_order_status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'implemented'
      division_type: 'Group' | 'Contracting' | 'Homes' | 'Wood' | 'Telecom'
      notification_type: 'project_update' | 'change_order' | 'photo_upload' | 'system_alert'
      project_status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
      user_role: 'admin' | 'manager' | 'supervisor' | 'worker' | 'viewer'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types
export type User = Tables<'users'>
export type Project = Tables<'projects'>
export type Division = Tables<'divisions'>
export type UserDivision = Tables<'user_divisions'>
export type ProjectUser = Tables<'project_users'>
export type Photo = Tables<'photos'>
export type ChangeOrder = Tables<'change_orders'>
export type ChangeOrderAttachment = Tables<'change_order_attachments'>
export type Notification = Tables<'notifications'>
export type AuditLog = Tables<'audit_log'>

// Enum types
export type UserRole = Enums<'user_role'>
export type ProjectStatus = Enums<'project_status'>
export type ChangeOrderStatus = Enums<'change_order_status'>
export type NotificationType = Enums<'notification_type'>
export type DivisionType = Enums<'division_type'>
export type AuditAction = Enums<'audit_action'>

// Extended types with relationships
export type UserWithDivisions = User & {
  user_divisions: (UserDivision & {
    division: Division
  })[]
}

export type ProjectWithDetails = Project & {
  division: Division
  project_manager?: User
  project_users: (ProjectUser & {
    user: User
  })[]
  photos: Photo[]
  change_orders: ChangeOrder[]
}

export type ChangeOrderWithDetails = ChangeOrder & {
  project: Project
  created_by_user: User
  approved_by_user?: User
  attachments: ChangeOrderAttachment[]
}

export type PhotoWithDetails = Photo & {
  project: Project
  uploaded_by_user: User
}
