import {
  getAccessToken,
} from '../../auth/storage/auth.storage';

import type {
  ApiResponse,
  CreateRolePayload,
  RoleDetail,
  RoleListItem,
  RolePermissionMatrix,
  UpdateRolePayload,
  UpdateRolePermissionsPayload,
} from '../types/roleManagement.type';

const API_URL =
  `${import.meta.env.VITE_API_URL || 'http://localhost:9000'}/api`;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = getAccessToken();

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken
          ? {
              Authorization:
                `Bearer ${accessToken}`,
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

  if (!response.ok) {
    throw new Error(
      result?.message ||
      'Có lỗi xảy ra khi gọi API.'
    );
  }

  if (!result?.success) {
    throw new Error(
      result?.message ||
      'API trả về kết quả không hợp lệ.'
    );
  }

  return result.data;
}

export const roleManagementService = {
  getRoles(): Promise<RoleListItem[]> {
    return request<RoleListItem[]>(
      '/roles'
    );
  },

  getRoleById(
    roleId: number
  ): Promise<RoleDetail> {
    return request<RoleDetail>(
      `/roles/${roleId}`
    );
  },

  createRole(
    payload: CreateRolePayload
  ): Promise<RoleDetail> {
    return request<RoleDetail>(
      '/roles',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  updateRole(
    roleId: number,
    payload: UpdateRolePayload
  ): Promise<RoleDetail> {
    return request<RoleDetail>(
      `/roles/${roleId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  deactivateRole(
    roleId: number
  ): Promise<{
    id: number;
    statusId: number;
  }> {
    return request<{
      id: number;
      statusId: number;
    }>(
      `/roles/${roleId}`,
      {
        method: 'DELETE',
      }
    );
  },

  getRolePermissions(
    roleId: number
  ): Promise<RolePermissionMatrix> {
    return request<RolePermissionMatrix>(
      `/roles/${roleId}/permissions`
    );
  },

  updateRolePermissions(
    roleId: number,
    payload: UpdateRolePermissionsPayload
  ): Promise<RolePermissionMatrix> {
    return request<RolePermissionMatrix>(
      `/roles/${roleId}/permissions`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },
};