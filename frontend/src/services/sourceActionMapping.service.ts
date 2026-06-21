import {
  SaveSourceActionMappingPayload,
  SourceActionMapping,
} from '../types';
import { request } from './httpClient';

export const sourceActionMappingService = {
  getMappingBySourceId(sourceId: number) {
    return request<SourceActionMapping>(`/api/source-action-mappings/${sourceId}`);
  },

  saveMapping(sourceId: number, payload: SaveSourceActionMappingPayload) {
    return request<{ message: string; totalActions: number; totalTmu: number }>(
      `/api/source-action-mappings/${sourceId}`,
      {
        method: 'PUT',
        body: payload,
      }
    );
  },
};