import {
    getAccessToken,
} from '../../auth/storage/auth.storage';

import type {
    RoleListItem,
} from '../../role-management/types/roleManagement.type';

import type {
    CreateUserPayload,
    EmployeeOption,
    SystemUser,
    SystemUserDetail,
    UpdateUserPayload,
} from '../types/systemUser.type';

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

    const result =
        await response.json() as ApiResponse<T>;

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
            'Có lỗi xảy ra.'
        );
    }

    return result.data;
}

export const systemUserService = {
    getUsers() {
        return request<SystemUser[]>(
            '/api/system/users'
        );
    },

    getUserById(userId: number) {
        return request<SystemUserDetail>(
            `/api/system/users/${userId}`
        );
    },

    getEmployeeOptions() {
        return request<EmployeeOption[]>(
            '/api/system/employees/options'
        );
    },

    getRoles() {
        return request<RoleListItem[]>(
            '/api/roles'
        );
    },

    createUser(
        payload: CreateUserPayload
    ) {
        return request<SystemUser>(
            '/api/system/users',
            {
                method: 'POST',
                body: JSON.stringify(payload),
            }
        );
    },

    updateUser(
        userId: number,
        payload: UpdateUserPayload
    ) {
        return request<SystemUserDetail>(
            `/api/system/users/${userId}`,
            {
                method: 'PUT',
                body: JSON.stringify(payload),
            }
        );
    },

    assignRoles(
        userId: number,
        roleIds: number[]
    ) {
        return request<unknown>(
            `/api/users/${userId}/roles`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    roles: roleIds,
                    reason:
                        'Gán vai trò khi tạo tài khoản',
                }),
            }
        );
    },
};