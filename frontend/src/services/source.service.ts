import { request } from './httpClient';
import { SourceMaster, SourceMasterPayload } from '../types';

export const sourceService = {
  getSources() {
    return request<SourceMaster[]>('/api/sources');
  },

  createSource(payload: SourceMasterPayload) {
    return request<{ message: string }>('/api/sources', {
      method: 'POST',
      body: payload,
    });
  },

  updateSource(id: number, payload: SourceMasterPayload) {
    return request<{ message: string }>(`/api/sources/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};