import { getAccessToken } from '../../auth/storage/auth.storage';

import type {
  SavePermissionOverridesPayload,
  UserListItem,
  UserPermissionMatrix,
} from '../types/accessControl.type';

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

import { API_BASE_URL } from '../../../config/api.config';
const API_URL = API_BASE_URL;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...options.headers,
    },
  });

  const result = await response.json() as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Có lỗi xảy ra.');
  }

  return result.data;
}

export const accessControlService = {
  getUsers() {
    return request<UserListItem[]>('/api/system/users');
  },

  getUserPermissionMatrix(userId: number) {
    return request<UserPermissionMatrix>(
      `/api/system/users/${userId}/permission-matrix`
    );
  },

  saveUserPermissionOverrides(
    userId: number,
    payload: SavePermissionOverridesPayload
  ) {
    return request<{
      userId: number;
      updatedCount: number;
    }>(
      `/api/system/users/${userId}/permission-overrides`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },
};