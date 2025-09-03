import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  userService,
  divisionService,
  projectService,
  photoService,
  changeOrderService,
  notificationService,
  milestoneService,
  taskService,
  projectInvitationService,
  rlsService,
  DatabaseError,
} from '@/lib/database';
import {
  User,
  Project,
  Division,
  Photo,
  ChangeOrder,
  Notification,
  UserWithDivisions,
  ProjectWithDetails,
  ProjectWithFullDetails,
  ChangeOrderWithDetails,
  PhotoWithDetails,
  Milestone,
  Task,
  ProjectInvitation,
} from '@/types/database';
import { toast } from '@/hooks/use-toast';

// Query keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  userWithDivisions: (id: string) => ['users', id, 'divisions'] as const,
  usersByDivision: (divisionId: string) =>
    ['users', 'division', divisionId] as const,

  divisions: ['divisions'] as const,
  division: (id: string) => ['divisions', id] as const,

  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  projectWithDetails: (id: string) => ['projects', id, 'details'] as const,
  projectsByDivision: (divisionId: string) =>
    ['projects', 'division', divisionId] as const,

  photos: ['photos'] as const,
  photosByProject: (projectId: string) =>
    ['photos', 'project', projectId] as const,
  photoWithDetails: (id: string) => ['photos', id, 'details'] as const,

  changeOrders: ['change-orders'] as const,
  changeOrdersByProject: (projectId: string) =>
    ['change-orders', 'project', projectId] as const,
  changeOrderWithDetails: (id: string) =>
    ['change-orders', id, 'details'] as const,

  notifications: ['notifications'] as const,
  notificationsByUser: (userId: string) =>
    ['notifications', 'user', userId] as const,
  unreadNotifications: (userId: string) =>
    ['notifications', 'user', userId, 'unread'] as const,
};

// User hooks
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: userService.getAll,
  });
};

export const useUsersWithDivisions = () => {
  return useQuery({
    queryKey: ['users', 'with-divisions'],
    queryFn: userService.getAllWithDivisions,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};

export const useUserWithDivisions = (id: string) => {
  return useQuery({
    queryKey: queryKeys.userWithDivisions(id),
    queryFn: () => userService.getWithDivisions(id),
    enabled: !!id,
  });
};

export const useUsersByDivision = (divisionId: string) => {
  return useQuery({
    queryKey: queryKeys.usersByDivision(divisionId),
    queryFn: () => userService.getByDivision(divisionId),
    enabled: !!divisionId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      userService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.userWithDivisions(variables.id),
      });
      toast({
        title: 'Success',
        description: 'User profile updated successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Division hooks
export const useDivisions = () => {
  return useQuery({
    queryKey: queryKeys.divisions,
    queryFn: divisionService.getAll,
  });
};

export const useDivision = (id: string) => {
  return useQuery({
    queryKey: queryKeys.division(id),
    queryFn: () => divisionService.getById(id),
    enabled: !!id,
  });
};

export const useCreateDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      division: Omit<Division, 'id' | 'created_at' | 'updated_at'>
    ) => divisionService.create(division),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions });
      toast({
        title: 'Success',
        description: 'Division created successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Division> }) =>
      divisionService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.division(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.divisions });
      toast({
        title: 'Success',
        description: 'Division updated successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Project hooks
export const useProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectService.getAll,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
};

export const useProjectWithDetails = (id: string) => {
  return useQuery({
    queryKey: queryKeys.projectWithDetails(id),
    queryFn: () => projectService.getWithDetails(id),
    enabled: !!id,
  });
};

export const useProjectsByDivision = (divisionId: string) => {
  return useQuery({
    queryKey: queryKeys.projectsByDivision(divisionId),
    queryFn: () => projectService.getByDivision(divisionId),
    enabled: !!divisionId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) =>
      projectService.create(project),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectsByDivision(data.division_id),
      });
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Project> }) =>
      projectService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.project(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectWithDetails(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectsByDivision(data.division_id),
      });
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      queryClient.invalidateQueries({ queryKey: queryKeys.project(id) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectWithDetails(id),
      });
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Photo hooks
export const usePhotosByProject = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.photosByProject(projectId),
    queryFn: () => photoService.getByProject(projectId),
    enabled: !!projectId,
  });
};

export const usePhotoWithDetails = (id: string) => {
  return useQuery({
    queryKey: queryKeys.photoWithDetails(id),
    queryFn: () => photoService.getWithDetails(id),
    enabled: !!id,
  });
};

export const useCreatePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photo: Omit<Photo, 'id' | 'created_at'>) =>
      photoService.create(photo),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.photosByProject(data.project_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.photos });
      toast({
        title: 'Success',
        description: 'Photo uploaded successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Photo> }) =>
      photoService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.photoWithDetails(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.photosByProject(data.project_id),
      });
      toast({
        title: 'Success',
        description: 'Photo updated successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => photoService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos });
      queryClient.invalidateQueries({
        queryKey: queryKeys.photoWithDetails(id),
      });
      toast({
        title: 'Success',
        description: 'Photo deleted successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Change order hooks
export const useChangeOrdersByProject = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.changeOrdersByProject(projectId),
    queryFn: () => changeOrderService.getByProject(projectId),
    enabled: !!projectId,
  });
};

export const useChangeOrderWithDetails = (id: string) => {
  return useQuery({
    queryKey: queryKeys.changeOrderWithDetails(id),
    queryFn: () => changeOrderService.getWithDetails(id),
    enabled: !!id,
  });
};

export const useCreateChangeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      changeOrder: Omit<ChangeOrder, 'id' | 'created_at' | 'updated_at'>
    ) => changeOrderService.create(changeOrder),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.changeOrdersByProject(data.project_id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.changeOrders });
      toast({
        title: 'Success',
        description: 'Change order created successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateChangeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ChangeOrder>;
    }) => changeOrderService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.changeOrderWithDetails(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.changeOrdersByProject(data.project_id),
      });
      toast({
        title: 'Success',
        description: 'Change order updated successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useApproveChangeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy: string }) =>
      changeOrderService.approve(id, approvedBy),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.changeOrderWithDetails(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.changeOrdersByProject(data.project_id),
      });
      toast({
        title: 'Success',
        description: 'Change order approved successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useRejectChangeOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      rejectionReason,
    }: {
      id: string;
      rejectionReason: string;
    }) => changeOrderService.reject(id, rejectionReason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.changeOrderWithDetails(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.changeOrdersByProject(data.project_id),
      });
      toast({
        title: 'Success',
        description: 'Change order rejected',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Notification hooks
export const useNotificationsByUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.notificationsByUser(userId),
    queryFn: () => notificationService.getByUser(userId),
    enabled: !!userId,
  });
};

export const useUnreadNotifications = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.unreadNotifications(userId),
    queryFn: () => notificationService.getUnread(userId),
    enabled: !!userId,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      notification: Omit<Notification, 'id' | 'sent_at' | 'read_at'>
    ) => notificationService.create(notification),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notificationsByUser(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unreadNotifications(data.user_id),
      });
      toast({
        title: 'Success',
        description: 'Notification sent successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notificationsByUser(data.user_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unreadNotifications(data.user_id),
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => notificationService.markAllAsRead(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notificationsByUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.unreadNotifications(userId),
      });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Project management hooks
export const useProjectWithFullDetails = (id: string) => {
  return useQuery({
    queryKey: ['projects', id, 'full-details'],
    queryFn: () => projectService.getWithFullDetails(id),
    enabled: !!id,
  });
};

export const useMilestonesByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['milestones', 'project', projectId],
    queryFn: () => milestoneService.getByProject(projectId),
    enabled: !!projectId,
  });
};

export const useTasksByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => taskService.getByProject(projectId),
    enabled: !!projectId,
  });
};

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>
    ) => milestoneService.create(milestone),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['milestones', 'project', data.project_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', data.project_id, 'full-details'],
      });
      toast({
        title: 'Success',
        description: 'Milestone created successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
      taskService.create(task),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'project', data.project_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', data.project_id, 'full-details'],
      });
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      taskService.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'project', data.project_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', data.project_id, 'full-details'],
      });
      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCreateProjectInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      invitation: Omit<ProjectInvitation, 'id' | 'created_at' | 'updated_at'>
    ) => projectInvitationService.create(invitation),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: ['project-invitations', 'project', data.project_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', data.project_id, 'full-details'],
      });
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// RLS testing hooks
export const useTestProjectAccess = () => {
  return useMutation({
    mutationFn: ({
      userId,
      projectId,
    }: {
      userId: string;
      projectId: string;
    }) => rlsService.testProjectAccess(userId, projectId),
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useGetUserDivisions = () => {
  return useMutation({
    mutationFn: (userId: string) => rlsService.getUserDivisions(userId),
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useSetCurrentUser = () => {
  return useMutation({
    mutationFn: (userId: string) => rlsService.setCurrentUser(userId),
    onError: (error: DatabaseError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
