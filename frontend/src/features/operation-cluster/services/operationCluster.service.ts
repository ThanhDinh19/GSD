import { GsdActionDetail } from '@/src/types';
import { request } from '../../../services/httpClient';

import type {
    ApiResponse,
} from '../../../shared/types/api.types';

import type {
    OperationClusterHeader,
    OperationClusterDetail,
    GsdOption,
    OperationClusterOperationPayload,
    OperationClusterGroupPayload,
    CreateOperationClusterPayload,
} from '../types/operationCluster.type';

export const operationClusterService = {
    async getOperationCluster():
        Promise<OperationClusterHeader[]> {
        const response = await request<ApiResponse<OperationClusterHeader[]>>('/api/operation-clusters');
        return response.data;
    },

    async getOperationClusterById(id: number) {
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

    async createOperationCluster(payload: CreateOperationClusterPayload) {
        alert(
            JSON.stringify(
                payload,
                null,
                2
            )
        )
    }
}

