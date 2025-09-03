import { User, UserWithDivisions } from '@/types/database';

export type Permission =
  | 'view_projects'
  | 'create_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'manage_team'
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'view_divisions'
  | 'manage_divisions'
  | 'view_change_orders'
  | 'create_change_orders'
  | 'approve_change_orders'
  | 'view_photos'
  | 'upload_photos'
  | 'delete_photos'
  | 'view_documents'
  | 'upload_documents'
  | 'delete_documents'
  | 'view_reports'
  | 'export_data'
  | 'system_settings';

export type Role =
  | 'admin'
  | 'manager'
  | 'supervisor'
  | 'estimator'
  | 'client'
  | 'subcontractor';

// Role-based permissions matrix
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'view_projects',
    'create_projects',
    'edit_projects',
    'delete_projects',
    'manage_team',
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'view_divisions',
    'manage_divisions',
    'view_change_orders',
    'create_change_orders',
    'approve_change_orders',
    'view_photos',
    'upload_photos',
    'delete_photos',
    'view_documents',
    'upload_documents',
    'delete_documents',
    'view_reports',
    'export_data',
    'system_settings',
  ],
  manager: [
    'view_projects',
    'create_projects',
    'edit_projects',
    'manage_team',
    'view_users',
    'create_users',
    'edit_users',
    'view_divisions',
    'view_change_orders',
    'create_change_orders',
    'approve_change_orders',
    'view_photos',
    'upload_photos',
    'delete_photos',
    'view_documents',
    'upload_documents',
    'delete_documents',
    'view_reports',
    'export_data',
  ],
  supervisor: [
    'view_projects',
    'edit_projects',
    'view_users',
    'view_divisions',
    'view_change_orders',
    'create_change_orders',
    'view_photos',
    'upload_photos',
    'view_documents',
    'upload_documents',
    'view_reports',
  ],
  estimator: [
    'view_projects',
    'view_users',
    'view_divisions',
    'view_change_orders',
    'create_change_orders',
    'view_photos',
    'view_documents',
    'view_reports',
  ],
  client: [
    'view_projects',
    'view_change_orders',
    'approve_change_orders',
    'view_photos',
    'view_documents',
    'view_reports',
  ],
  subcontractor: [
    'view_projects',
    'view_change_orders',
    'view_photos',
    'upload_photos',
    'view_documents',
    'upload_documents',
  ],
};

// Division-specific permissions
const DIVISION_PERMISSIONS: Record<string, Permission[]> = {
  // Group division has access to all other divisions
  group: [
    'view_projects',
    'create_projects',
    'edit_projects',
    'delete_projects',
    'manage_team',
    'view_users',
    'create_users',
    'edit_users',
    'view_divisions',
    'manage_divisions',
    'view_change_orders',
    'create_change_orders',
    'approve_change_orders',
    'view_photos',
    'upload_photos',
    'delete_photos',
    'view_documents',
    'upload_documents',
    'delete_documents',
    'view_reports',
    'export_data',
  ],
  // Other divisions have standard permissions
  contracting: [],
  homes: [],
  wood: [],
  telecom: [],
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  user: UserWithDivisions,
  permission: Permission,
  divisionId?: string
): boolean {
  // Admin users have all permissions
  if (user.user_divisions?.some(ud => ud.role === 'admin')) {
    return true;
  }

  // Check if user has permission through any of their division roles
  const hasPermissionInDivision = user.user_divisions?.some(userDivision => {
    const rolePermissions = ROLE_PERMISSIONS[userDivision.role as Role] || [];
    const divisionPermissions =
      DIVISION_PERMISSIONS[userDivision.division_id] || [];

    // If checking specific division, only check that division
    if (divisionId && userDivision.division_id !== divisionId) {
      return false;
    }

    return (
      rolePermissions.includes(permission) ||
      divisionPermissions.includes(permission)
    );
  });

  return hasPermissionInDivision || false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: UserWithDivisions,
  permissions: Permission[],
  divisionId?: string
): boolean {
  return permissions.some(permission =>
    hasPermission(user, permission, divisionId)
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: UserWithDivisions,
  permissions: Permission[],
  divisionId?: string
): boolean {
  return permissions.every(permission =>
    hasPermission(user, permission, divisionId)
  );
}

/**
 * Get all permissions for a user across all divisions
 */
export function getUserPermissions(user: UserWithDivisions): Permission[] {
  const permissions = new Set<Permission>();

  user.user_divisions?.forEach(userDivision => {
    const rolePermissions = ROLE_PERMISSIONS[userDivision.role as Role] || [];
    const divisionPermissions =
      DIVISION_PERMISSIONS[userDivision.division_id] || [];

    rolePermissions.forEach(permission => permissions.add(permission));
    divisionPermissions.forEach(permission => permissions.add(permission));
  });

  return Array.from(permissions);
}

/**
 * Get permissions for a user in a specific division
 */
export function getUserPermissionsInDivision(
  user: UserWithDivisions,
  divisionId: string
): Permission[] {
  const permissions = new Set<Permission>();

  user.user_divisions?.forEach(userDivision => {
    if (userDivision.division_id === divisionId) {
      const rolePermissions = ROLE_PERMISSIONS[userDivision.role as Role] || [];
      const divisionPermissions =
        DIVISION_PERMISSIONS[userDivision.division_id] || [];

      rolePermissions.forEach(permission => permissions.add(permission));
      divisionPermissions.forEach(permission => permissions.add(permission));
    }
  });

  return Array.from(permissions);
}

/**
 * Check if user can access a specific project
 */
export function canAccessProject(
  user: UserWithDivisions,
  projectDivisionId: string
): boolean {
  // Admin users can access all projects
  if (user.user_divisions?.some(ud => ud.role === 'admin')) {
    return true;
  }

  // Group division users can access all projects
  if (user.user_divisions?.some(ud => ud.division_id === 'group')) {
    return true;
  }

  // Check if user belongs to the project's division
  return (
    user.user_divisions?.some(ud => ud.division_id === projectDivisionId) ||
    false
  );
}

/**
 * Check if user can manage another user
 */
export function canManageUser(
  manager: UserWithDivisions,
  targetUser: UserWithDivisions
): boolean {
  // Admin users can manage everyone
  if (manager.user_divisions?.some(ud => ud.role === 'admin')) {
    return true;
  }

  // Managers can manage users in their divisions
  const managerDivisions =
    manager.user_divisions
      ?.filter(ud => ud.role === 'manager' || ud.role === 'admin')
      ?.map(ud => ud.division_id) || [];

  const targetDivisions =
    targetUser.user_divisions?.map(ud => ud.division_id) || [];

  // Check if manager has authority over any of target user's divisions
  return managerDivisions.some(divisionId =>
    targetDivisions.includes(divisionId)
  );
}

/**
 * Get user's highest role across all divisions
 */
export function getUserHighestRole(user: UserWithDivisions): Role | null {
  const roleHierarchy: Role[] = [
    'admin',
    'manager',
    'supervisor',
    'estimator',
    'client',
    'subcontractor',
  ];

  const userRoles = user.user_divisions?.map(ud => ud.role as Role) || [];

  for (const role of roleHierarchy) {
    if (userRoles.includes(role)) {
      return role;
    }
  }

  return null;
}

/**
 * Check if user is internal staff
 */
export function isInternalUser(user: User): boolean {
  return user.is_internal === true;
}

/**
 * Check if user is external (client or subcontractor)
 */
export function isExternalUser(user: User): boolean {
  return user.is_internal === false;
}

/**
 * Get user's role in a specific division
 */
export function getUserRoleInDivision(
  user: UserWithDivisions,
  divisionId: string
): Role | null {
  const userDivision = user.user_divisions?.find(
    ud => ud.division_id === divisionId
  );
  return (userDivision?.role as Role) || null;
}

/**
 * Check if user can approve change orders
 */
export function canApproveChangeOrders(
  user: UserWithDivisions,
  changeOrderAmount?: number
): boolean {
  // Admin users can approve any change order
  if (user.user_divisions?.some(ud => ud.role === 'admin')) {
    return true;
  }

  // Project managers can approve change orders under $5,000
  if (changeOrderAmount && changeOrderAmount < 5000) {
    return user.user_divisions?.some(ud => ud.role === 'manager') || false;
  }

  // Only admins can approve change orders over $5,000
  return false;
}

/**
 * Get accessible divisions for a user
 */
export function getAccessibleDivisions(user: UserWithDivisions): string[] {
  // Admin users can access all divisions
  if (user.user_divisions?.some(ud => ud.role === 'admin')) {
    return ['group', 'contracting', 'homes', 'wood', 'telecom'];
  }

  // Group division users can access all divisions
  if (user.user_divisions?.some(ud => ud.division_id === 'group')) {
    return ['group', 'contracting', 'homes', 'wood', 'telecom'];
  }

  // Return user's assigned divisions
  return user.user_divisions?.map(ud => ud.division_id) || [];
}
