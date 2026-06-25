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


  importSourcesExcel(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return fetch('/api/sources/import-excel', {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Import Excel thất bại.');
      }

      return data as {
        message: string;
        data: {
          sheetName: string;
          totalRows: number;
          inserted: number;
          updated: number;
          skipped: number;
          errors: string[];
        };
      };
    });
  },
};

