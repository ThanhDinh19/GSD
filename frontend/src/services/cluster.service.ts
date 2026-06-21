import { request } from './httpClient';
import { Cluster, ClusterPayload } from '../types';

export const clusterService = {
  getClusters() {
    return request<Cluster[]>('/api/clusters');
  },

  createCluster(payload: ClusterPayload) {
    return request<{ message: string }>('/api/clusters', {
      method: 'POST',
      body: payload,
    });
  },

  updateCluster(id: number, payload: ClusterPayload) {
    return request<{ message: string }>(`/api/clusters/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};