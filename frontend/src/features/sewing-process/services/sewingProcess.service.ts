import {
  request,
} from '../../../services/httpClient';

import type {
  ApiResponse,
} from '../../../shared/types/api.types';

import type {
  SewingProcessActionDetail,
  SewingProcessListItem,
  SewingProcessMachineNeed,
  SewingProcessMutationResult,
  SewingProcessPayload,
  SewingProcessResult,
  SewingProcessUploadResult,
  DeactivateResponse,
} from '../types/sewingProcess.types';

import type {
  SewingProcessActionDetailDto,
} from '../types/sewingProcess.dto';

import {
  mapActionDetailDto,
} from '../model/sewingProcess.mapper';

export const sewingProcessService = {
  async getActionDetailsByOperationClusterLineId(
    id: number
  ): Promise<SewingProcessActionDetail[]> {
    const response = await request<
      ApiResponse<SewingProcessActionDetailDto[]>
    >(
      `/api/sewing-processes/operation-lines/${id}/action-details`,
    );

    return Array.isArray(response.data)
      ? response.data.map(mapActionDetailDto)
      : [];
  },

  async getGsdActionDetailsById(
    id: number
  ): Promise<SewingProcessActionDetail[]> {
    const response = await request<
      ApiResponse<SewingProcessActionDetailDto[]>
    >(
      `/api/sewing-processes/${id}/action-details`,
    );

    return Array.isArray(response.data)
      ? response.data.map(mapActionDetailDto)
      : [];
  },

  async getSewingProcesses():
    Promise<SewingProcessListItem[]> {
    const response = await request<
      ApiResponse<SewingProcessListItem[]>
    >(
      '/api/sewing-processes',
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
  },

  async getSewingProcessById(
    id: number
  ): Promise<SewingProcessResult> {
    const response = await request<
      ApiResponse<SewingProcessResult>
    >(
      `/api/sewing-processes/${id}`,
    );
    return response.data;
  },

  async deactivate(id: number): Promise<DeactivateResponse> {
    const response = await request<ApiResponse<DeactivateResponse>>(
      `/api/sewing-processes/deactivate/${id}`,
      {
        method: 'PUT'
      }
    );
    return response;
  },

  async calculateSewingProcess(
    payload: SewingProcessPayload
  ): Promise<SewingProcessResult> {
    const response = await request<
      ApiResponse<SewingProcessResult>
    >(
      '/api/sewing-processes/calculate',
      {
        method: 'POST',
        body: payload,
      }
    );

    return response.data;
  },

  async calculateMachineNeeds(
    payload: SewingProcessPayload
  ): Promise<SewingProcessMachineNeed[]> {
    const response = await request<
      ApiResponse<SewingProcessMachineNeed[]>
    >(
      '/api/sewing-processes/calculate-machine-needs',
      {
        method: 'POST',
        body: payload,
      }
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
  },

  async createSewingProcess(
    payload: SewingProcessPayload
  ): Promise<
    ApiResponse<SewingProcessMutationResult>
  > {
    return request<
      ApiResponse<SewingProcessMutationResult>
    >(
      '/api/sewing-processes',
      {
        method: 'POST',
        body: payload,
      }
    );
  },

  async updateSewingProcess(
    id: number,
    payload: SewingProcessPayload
  ): Promise<
    ApiResponse<SewingProcessMutationResult>
  > {
    return request<
      ApiResponse<SewingProcessMutationResult>
    >(
      `/api/sewing-processes/${id}`,
      {
        method: 'PUT',
        body: payload,
      }
    );
  },

  async uploadImage(
    file: File
  ): Promise<SewingProcessUploadResult> {
    const formData = new FormData();

    formData.append(
      'image',
      file
    );

    const response = await request<
      ApiResponse<SewingProcessUploadResult>
    >(
      '/api/sewing-processes/images/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    return response.data;
  },
};