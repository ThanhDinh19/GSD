import { request } from './httpClient';
import {
    ApiResponse,
    SewingProcessListItem,
    SewingProcessPayload,
    SewingProcessResult,
    SewingProcessMachineNeed,
} from '../types';


const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

export function getSewingProcessImageUrl(fileName?: string | null) {
  if (!fileName) return '';

  const cleanFileName = String(fileName).split('/').pop();

  return `${API_URL}/sewing_process_images/${cleanFileName}`;
}

export const sewingProcessService = {
    async getSewingProcesses() {
        const res = await request<ApiResponse<SewingProcessListItem[]>>(
            '/api/sewing-processes'
        );

        return res.data;
    },

    async getSewingProcessById(id: number) {
        const res = await request<ApiResponse<SewingProcessResult>>(
            `/api/sewing-processes/${id}`
        );

        return res.data;
    },

    async calculateSewingProcess(payload: SewingProcessPayload) {
        const res = await request<ApiResponse<SewingProcessResult>>(
            '/api/sewing-processes/calculate',
            {
                method: 'POST',
                body: payload,
            }
        );

        return res.data;
    },

    async calculateMachineNeeds(payload: SewingProcessPayload) {
        const res = await request<ApiResponse<SewingProcessMachineNeed[]>>(
            '/api/sewing-processes/calculate-machine-needs',
            {
                method: 'POST',
                body: payload,
            }
        );

        return res.data;
    },

    async createSewingProcess(payload: SewingProcessPayload) {
        return request<ApiResponse<any>>('/api/sewing-processes', {
            method: 'POST',
            body: payload,
        });
    },

    async updateSewingProcess(id: number, payload: SewingProcessPayload) {
        return request<ApiResponse<any>>(`/api/sewing-processes/${id}`, {
            method: 'PUT',
            body: payload,
        });
    },

    async uploadImage(file: File) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_URL}/api/sewing-processes/images/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => null);
            throw new Error(error?.message || 'Upload hình ảnh thất bại.');
        }

        const json = await res.json();

        return json.data as {
            imageFileName: string;
            imageUrl: string;
        };
    },


};

