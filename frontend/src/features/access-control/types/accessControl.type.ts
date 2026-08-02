export type PermissionOperation =
  | 'ALLOW'
  | 'DENY'
  | 'REMOVE_OVERRIDE';

export type UserListItem = {
  id: number;
  employeeId: number | null;
  employeeCode: string | null;
  employeeName: string | null;
  departmentCode: string | null;
  username: string;
  loginEmail: string | null;
  statusId: number;
};

export type UserRoleItem = {
  id: number;
  roleCode: string;
  roleName: string;
};

export type UserPermissionAction = {
  actionId: number;
  actionCode: string;
  actionName: string;
  actionGroupCode: string;
  actionSortOrder: number;

  permissionId: number;
  permissionCode: string;
  permissionName: string;
  isSensitive: boolean;

  effectiveAllowed: boolean;
  inheritedFromRole: boolean;
  overrideEffect: 'ALLOW' | 'DENY' | null;
  overrideScopeCode: string | null;
};

export type UserPermissionScreen = {
  screenId: number;
  screenCode: string;
  screenName: string;
  routePath: string | null;
  screenSortOrder: number;
  actions: UserPermissionAction[];
};

export type UserPermissionModule = {
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  moduleSortOrder: number;
  screens: UserPermissionScreen[];
};

export type UserPermissionMatrix = {
  user: {
    id: number;
    username: string;
    statusId: number;
  };
  roles: UserRoleItem[];
  modules: UserPermissionModule[];
};

export type PermissionChange = {
  permissionId: number;
  operation: PermissionOperation;
  scopeCode?: string;
};

export type SavePermissionOverridesPayload = {
  changes: PermissionChange[];
};