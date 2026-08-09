import {
  GsdAnalysisCalculateResult,
  GsdAnalysisPayload,
  GsdAnalysisSummary,
  SourceActionForAnalysis,
  GsdAnalysisDetail,
  DeactivateResponse,
} from '../types';

import type {
  ApiResponse,
} from '../shared/types/api.types';

import {
  request,
} from './httpClient';

type SaveAnalysisResponse = {
  message: string;
  data: GsdAnalysisDetail;
};

type CopyAnalysisDraftResponse = {
  success: boolean;
  message: string;

  data: GsdAnalysisDetail & {
    copyOfAnalysisId: number;
  };
};

type UploadGsdAnalysisImageResponse = {
  success: boolean;

  data: {
    imageFileName: string;
    imageUrl: string;
  };
};

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:9000'
).replace(/\/$/, '');

export function getGsdAnalysisImageUrl(
  fileName?: string | null
) {
  if (!fileName) {
    return '';
  }

  const cleanFileName =
    String(fileName)
      .split('/')
      .pop();

  return `${API_URL}/gsd_analysis_images/${cleanFileName}`;
}

export const gsdAnalysisService = {
  getAnalysisById(id: number) {
    return request<GsdAnalysisDetail>(
      `/api/gsd-analysis/${id}`,
    );
  },

  getAnalyses() {
    return request<GsdAnalysisSummary[]>(
      '/api/gsd-analysis',
    );
  },

  getSourceActions(
    sourceId: number
  ) {
    return request<
      SourceActionForAnalysis[]
    >(
      `/api/gsd-analysis/source-actions/${sourceId}`,
    );
  },

  calculate(
    payload: GsdAnalysisPayload
  ) {
    return request<
      GsdAnalysisCalculateResult
    >(
      '/api/gsd-analysis/calculate',
      {
        method: 'POST',
        body: payload,
      }
    );
  },

  createAnalysis(
    payload: GsdAnalysisPayload
  ) {
    return request<{
      message: string;

      data:
        GsdAnalysisCalculateResult & {
          id: number;
          analysisNo: string;
        };
    }>(
      '/api/gsd-analysis',
      {
        method: 'POST',
        body: payload,
      }
    );
  },

  updateAnalysis(
    id: number,
    payload: GsdAnalysisPayload
  ) {
    return request<SaveAnalysisResponse>(
      `/api/gsd-analysis/${id}`,
      {
        method: 'PUT',
        body: payload,
      }
    );
  },

  getAnalysisCopyDraft(
    id: number
  ) {
    return request<
      CopyAnalysisDraftResponse
    >(
      `/api/gsd-analysis/${id}/copy-draft`,
    );
  },

  async uploadImage(
    file: File
  ) {
    const formData =
      new FormData();

    formData.append(
      'image',
      file,
      file.name
    );

    const response =
      await request<
        UploadGsdAnalysisImageResponse
      >(
        '/api/gsd-analysis/images/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

    return response.data;
  },

    async deactivate(id: number): Promise<DeactivateResponse> {
      const response = await request<ApiResponse<DeactivateResponse>>(
        `/api/gsd-analysis/deactivate/${id}`,
        {
          method: 'PUT'
        }
      );
      return response;
    },
};