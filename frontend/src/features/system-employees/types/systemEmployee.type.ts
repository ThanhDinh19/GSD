export type SystemEmployee = {
  id: number;
  employeeCode: string;
  fullName: string;
  preferredName: string | null;

  departmentCode: string | null;
  positionCode: string | null;
  jobTitle: string | null;

  managerEmployeeId: number | null;
  managerEmployeeCode: string | null;
  managerName: string | null;

  workEmail: string | null;
  personalEmail: string | null;
  phoneNumber: string | null;

  employmentTypeCode: string | null;

  hireDate: string | null;
  probationEndDate: string | null;
  terminationDate: string | null;

  statusId: number;
  createdAt: string;
  updatedAt: string | null;

  accountId: number | null;
  username: string | null;
  accountStatusId: number | null;
};

export type SystemEmployeeDetail =
  SystemEmployee & {
    extraDataJson: string | null;
    extraData: Record<string, unknown> | null;

    createdByUserId: number | null;
    updatedByUserId: number | null;

    rowVersion: string;
  };

export type EmployeeFormPayload = {
  employeeCode: string;
  fullName: string;
  preferredName: string | null;

  departmentCode: string | null;
  positionCode: string | null;
  jobTitle: string | null;

  managerEmployeeId: number | null;

  workEmail: string | null;
  personalEmail: string | null;
  phoneNumber: string | null;

  employmentTypeCode: string | null;

  hireDate: string | null;
  probationEndDate: string | null;
  terminationDate: string | null;

  statusId: number;
};

export type CreateEmployeePayload =
  EmployeeFormPayload;

export type UpdateEmployeePayload =
  EmployeeFormPayload;

export type EmployeeFilters = {
  search?: string;
  statusId?: number | '';
  departmentCode?: string;
};

export type EmployeeManagerOption = {
  id: number;
  employeeCode: string;
  fullName: string;
  departmentCode: string | null;
  jobTitle: string | null;
};