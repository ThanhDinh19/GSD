import {
  GsdAnalysisCalculateResult,
  GsdAnalysisPayload,
  GsdAnalysisSummary,
  SourceActionForAnalysis,
  GsdAnalysisDetail,
} from '../types';
import { request } from './httpClient';

export const gsdAnalysisService = {

  getAnalysisById(id: number) {
    return request<GsdAnalysisDetail>(`/api/gsd-analysis/${id}`);
  },

  getAnalyses() {
    return request<GsdAnalysisSummary[]>('/api/gsd-analysis');
  },

  getSourceActions(sourceId: number) {
    return request<SourceActionForAnalysis[]>(
      `/api/gsd-analysis/source-actions/${sourceId}`
    );
  },

  calculate(payload: GsdAnalysisPayload) {
    return request<GsdAnalysisCalculateResult>('/api/gsd-analysis/calculate', {
      method: 'POST',
      body: payload,
    });
  },

  createAnalysis(payload: GsdAnalysisPayload) {
    return request<{
      message: string;
      data: GsdAnalysisCalculateResult & {
        id: number;
        analysisNo: string;
      };
    }>('/api/gsd-analysis', {
      method: 'POST',
      body: payload,
    });
  },
};