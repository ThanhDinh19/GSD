import {
    SalaryCoefficient,
    SalaryCoefficientPayload,
    OperationClusterHeader,
    GsdOption,
    OperationClusterOperationPayload,
    OperationClusterGroupPayload,
    CreateOperationClusterPayload,
    OperationClusterDetail,
    GsdActionDetail,
    ApiResponse,
} from '../types';

import {
  request,
} from './httpClient';

// async function request<T>(url: string, options?: RequestInit): Promise<T> {
//     const res = await fetch(url, {
//         headers: {
//             'Content-Type': 'application/json',
//             ...(options?.headers || {}),
//         },
//         ...options,
//     });

//     if (!res.ok) {
//         const error = await res.json().catch(() => null);
//         throw new Error(error?.message || 'Có lỗi xảy ra');
//     }

//     return res.json();
// }

export const operationClusterService = {

    async getAll() {
        const res = await request<ApiResponse<OperationClusterHeader[]>>('/api/operation-clusters');
        return res.data;
    },

    async getById(id: number) {
        const res = await request<ApiResponse<OperationClusterDetail>>(`/api/operation-clusters/${id}`);
        return res.data;
    },

    async getGsdOptions() {
        const res = await request<ApiResponse<GsdOption[]>>('/api/operation-clusters/gsd-options');
        return res.data;
    },

    async getGsdActions(id: number) {
        const res = await request<ApiResponse<GsdActionDetail[]>>(`/api/operation-clusters/gsd-options/${id}/actions`);
        return res.data;
    },

    create(payload: CreateOperationClusterPayload) {
        return request<OperationClusterDetail>('/api/operation-clusters', {
            method: 'POST',
            body: payload,
        });
    },

    update(id: number, payload: CreateOperationClusterPayload) {
        return request(`/api/operation-clusters/${id}`, {
            method: 'PUT',
            body: payload,
        });
    },

    copy(payload: CreateOperationClusterPayload) {
        return request('/api/operation-clusters/copy', {
            method: 'POST',
            body: payload,
        });
    }
};

