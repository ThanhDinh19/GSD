import {
  GsdAnalysisCalculateResult,
  GsdAnalysisPayload,
  SourceActionForAnalysis,
} from '../types';
import { request } from './httpClient';

export const gsdAnalysisService = {
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