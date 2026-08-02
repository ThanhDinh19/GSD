export type RoleListItem = {
  id: number;
  roleCode: string;
  roleName: string;
  description: string | null;
  roleTypeCode: string;
  priorityNo: number;
  isSystemRole: boolean;
  statusId: number;
  userCount: number;
  permissionCount: number;
};

export type RoleDetail = {
  id: number;
  roleCode: string;
  roleName: string;
  description: string | null;
  roleTypeCode: string;
  priorityNo: number;
  isSystemRole: boolean;
  statusId: number;
};

export type CreateRolePayload = {
  roleCode: string;
  roleName: string;
  description: string | null;
  roleTypeCode: string;
  priorityNo: number;
};

export type UpdateRolePayload = {
  roleCode?: string;
  roleName?: string;
  description?: string | null;
  roleTypeCode?: string;
  priorityNo?: number;
  statusId?: number;
};

export type RolePermissionAction = {
  actionId: number;
  actionCode: string;
  actionName: string;
  actionGroupCode: string | null;
  actionSortOrder: number;

  permissionId: number;
  permissionCode: string;
  permissionName: string;
  isSensitive: boolean;

  assigned: boolean;
  scopeCode: string;
};

export type RolePermissionScreen = {
  screenId: number;
  screenCode: string;
  screenName: string;
  routePath: string | null;
  screenSortOrder: number;
  actions: RolePermissionAction[];
};

export type RolePermissionModule = {
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  moduleSortOrder: number;
  screens: RolePermissionScreen[];
};

export type RolePermissionMatrix = {
  role: RoleDetail;
  modules: RolePermissionModule[];
  updatedPermissionCount?: number;
  affectedUserCount?: number;
};

export type RolePermissionInput = {
  permissionId: number;
  scopeCode: string;
};

export type UpdateRolePermissionsPayload = {
  permissions: RolePermissionInput[];
  reason?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};