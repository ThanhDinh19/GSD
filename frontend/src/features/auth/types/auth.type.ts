export type LoginPayload = {
  username: string;
  password: string;
};

export type AuthUser = {
  id: string;
  employeeId: string;
  employeeCode: string;
  username: string;
  loginEmail: string | null;
  fullName: string;
  departmentCode: string | null;
};

export type AuthRole = {
  id: number;
  roleCode: string;
  roleName: string;
};

export type PermissionScope = 'ALL' | 'DEPARTMENT' | 'SELF' | string;

export type AuthPermission = {
  code: string;
  name: string;
  screenCode: string;
  actionCode: string;
  scopes: PermissionScope[];
};

export type AuthNavigation = {
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  moduleIconKey: string | null;
  moduleSortOrder: number;

  screenId: number;
  parentScreenId: number | null;
  screenCode: string;
  screenName: string;
  routePath: string;
  componentKey: string;
  screenIconKey: string | null;
  screenSortOrder: number;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
  roles: AuthRole[];
  permissions: AuthPermission[];
  navigation: AuthNavigation[];
};


export type RefreshTokenResponse = {
  accessToken: string;
};

