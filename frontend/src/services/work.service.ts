import { request } from './httpClient';
import { Work, WorkPayload } from '../types';

export const workService = {
  getWorks() {
    return request<Work[]>('/api/works');
  },

  createWork(payload: WorkPayload) {
    return request<{ message: string }>('/api/works', {
      method: 'POST',
      body: payload,
    });
  },

  updateWork(id: number, payload: WorkPayload) {
    return request<{ message: string }>(`/api/works/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};