import type {
    CreateOperationClusterPayload,
    GsdActionDetail,
    GsdOption,
    OperationClusterDetail,
    OperationClusterHeader,
} from '../types/operationCluster.types';

import {
    request,
} from '../../../services/httpClient';

type ApiResponse<T> = {
    success: boolean;
    message?: string;
    data: T;
};

export const operationClusterService = {
    async getAll():
        Promise<
            OperationClusterHeader[]
        > {
        const response =
            await request<
                ApiResponse<
                    OperationClusterHeader[]
                >
            >(
                '/api/operation-clusters'
            );

        return response.data;
    },

    async getById(
        id: number
    ): Promise<
        OperationClusterDetail
    > {
        const response =
            await request<
                ApiResponse<
                    OperationClusterDetail
                >
            >(
                `/api/operation-clusters/${id}`
            );

        return response.data;
    },

    async getGsdOptions():
        Promise<GsdOption[]> {
        const response =
            await request<
                ApiResponse<
                    GsdOption[]
                >
            >(
                '/api/operation-clusters/gsd-options'
            );

        return response.data;
    },

    async getGsdActions(
        id: number
    ): Promise<
        GsdActionDetail[]
    > {
        const response =
            await request<
                ApiResponse<
                    GsdActionDetail[]
                >
            >(
                `/api/operation-clusters/gsd-options/${id}/actions`
            );

        return response.data;
    },

    create(
        payload:
            CreateOperationClusterPayload
    ) {
        return request<
            OperationClusterDetail
        >(
            '/api/operation-clusters',
            {
                method: 'POST',
                body: payload,
            }
        );
    },

    update(
        id: number,
        payload:
            CreateOperationClusterPayload
    ) {
        return request(
            `/api/operation-clusters/${id}`,
            {
                method: 'PUT',
                body: payload,
            }
        );
    },

    copy(
        payload:
            CreateOperationClusterPayload
    ) {
        return request(
            '/api/operation-clusters/copy',
            {
                method: 'POST',
                body: payload,
            }
        );
    },
};