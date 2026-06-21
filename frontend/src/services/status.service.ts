import { request } from './httpClient';
import { MasterStatus } from '../types';

export const statusService = {
  getStatuses() {
    return request<MasterStatus[]>('/api/statuses');
  },
};