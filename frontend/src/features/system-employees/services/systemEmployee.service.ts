import {
  getAccessToken,
} from '../../auth/storage/auth.storage';

import type {
  CreateEmployeePayload,
  EmployeeFilters,
  SystemEmployee,
  SystemEmployeeDetail,
  UpdateEmployeePayload,
} from '../types/systemEmployee.type';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:9000';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
        ...options.headers,
      },
    }
  );

  let result: ApiResponse<T> | null = null;

  try {
    result =
      await response.json() as ApiResponse<T>;
  } catch {
    result = null;
  }

  if (response.status === 401) {
    sessionStorage.removeItem(
      'auth_session'
    );

    window.location.href = '/login';

    throw new Error(
      'Phiên đăng nhập đã hết hạn.'
    );
  }

  if (
    !response.ok ||
    !result?.success
  ) {
    throw new Error(
      result?.message ||
      'Có lỗi xảy ra khi gọi API.'
    );
  }

  return result.data;
}

function createQueryString(
  filters: EmployeeFilters = {}
) {
  const params = new URLSearchParams();

  const search =
    filters.search?.trim();

  const departmentCode =
    filters.departmentCode?.trim();

  if (search) {
    params.set(
      'search',
      search
    );
  }

  if (
    filters.statusId !== undefined &&
    filters.statusId !== ''
  ) {
    params.set(
      'statusId',
      String(filters.statusId)
    );
  }

  if (departmentCode) {
    params.set(
      'departmentCode',
      departmentCode
    );
  }

  const queryString =
    params.toString();

  return queryString
    ? `?${queryString}`
    : '';
}

export const systemEmployeeService = {
  getEmployees(
    filters: EmployeeFilters = {}
  ) {
    return request<SystemEmployee[]>(
      `/api/employees${createQueryString(filters)}`
    );
  },

  getEmployeeById(
    employeeId: number
  ) {
    return request<SystemEmployeeDetail>(
      `/api/employees/${employeeId}`
    );
  },

  createEmployee(
    payload: CreateEmployeePayload
  ) {
    return request<SystemEmployeeDetail>(
      '/api/employees',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  updateEmployee(
    employeeId: number,
    payload: UpdateEmployeePayload
  ) {
    return request<SystemEmployeeDetail>(
      `/api/employees/${employeeId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  deactivateEmployee(
    employeeId: number
  ) {
    return request<SystemEmployeeDetail>(
      `/api/employees/${employeeId}`,
      {
        method: 'DELETE',
      }
    );
  },
};