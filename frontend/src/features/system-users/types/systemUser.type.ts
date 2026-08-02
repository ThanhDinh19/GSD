export type SystemUser = {
  id: number;
  employeeId: number | null;
  employeeCode: string | null;
  employeeName: string | null;
  departmentCode: string | null;
  username: string;
  loginEmail: string | null;

  roleNames: string | null;

  mustChangePassword: boolean;
  failedLoginCount: number;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  
  statusId: number;
  createdAt: string;
};

export type CreateUserPayload = {
  employeeId: number;
  username: string;
  loginEmail: string | null;
  password: string;
};

export type CreateUserWithRolesPayload =
  CreateUserPayload & {
    roleIds: number[];
  };


export type EmployeeOption = {
  id: number;
  employeeCode: string;
  fullName: string;
  departmentCode: string | null;
  positionCode: string | null;
  jobTitle: string | null;
};

export type UserRoleAssignment = {
  userRoleId: number;
  roleId: number;
  roleCode: string;
  roleName: string;
  departmentCode: string | null;
  validFrom: string | null;
  validTo: string | null;
  statusId: number;
};

export type SystemUserDetail = {
  id: number;
  employeeId: number | null;
  employeeCode: string | null;
  employeeName: string | null;
  departmentCode: string | null;

  username: string;
  loginEmail: string | null;
  mustChangePassword: boolean;
  lockedUntil: string | null;
  statusId: number;
  isSystemAccount: boolean;

  createdAt: string;
  updatedAt: string | null;

  roles: UserRoleAssignment[];
};

export type UpdateUserPayload = {
  employeeId: number;
  username: string;
  loginEmail: string | null;
  statusId: number;
};