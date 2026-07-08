import {
    SalaryCoefficient,
    SalaryCoefficientPayload,
    OperationClusterHeader,
    GsdOption,
    OperationClusterOperationPayload,
    OperationClusterGroupPayload,
    CreateOperationClusterPayload,
    OperationClusterDetail,
    GsdActionDetail
} from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message || 'Có lỗi xảy ra');
    }

    return res.json();
}

export const operationClusterService = {
    getAll() {
        return request<OperationClusterHeader[]>('/api/operation-clusters');
    },

    getById(id: number) {
        return request<OperationClusterDetail>(`/api/operation-clusters/${id}`);
    },

    getGsdOptions() {
        return request<GsdOption[]>('/api/operation-clusters/gsd-options');
    },

    getGsdActions(id: number) {
        return request<GsdActionDetail[]>(
            `/api/operation-clusters/gsd-options/${id}/actions`
        );
    },

    create(payload: CreateOperationClusterPayload) {
        return request<OperationClusterDetail>('/api/operation-clusters', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
};