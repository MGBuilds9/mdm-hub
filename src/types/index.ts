// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  endDate: Date;
  budget: number;
  progress: number;
  client: string;
  location: string;
  teamMembers: TeamMember[];
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';

// Team Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  joinedAt: Date;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  dueDate: Date;
  estimatedHours: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'supervisor' | 'worker';

// Dashboard Types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTeamMembers: number;
  upcomingDeadlines: number;
  totalBudget: number;
  spentBudget: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreateProjectForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  client: string;
  location: string;
}

export interface CreateTaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeId: string;
  dueDate: string;
  estimatedHours: number;
}

// Filter Types
export interface ProjectFilters {
  status?: ProjectStatus;
  client?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  projectId?: string;
}
