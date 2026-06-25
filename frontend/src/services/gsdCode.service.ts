import { request } from './httpClient';
import { GsdCode, GsdCodePayload } from '../types';
import { API_BASE_URL } from '../config/api.config';

export const gsdCodeService = {
    getGsdCodes() {
        return request<GsdCode[]>('/api/gsd-codes');
    },

    getActiveGsdCodes() {
        return request<GsdCode[]>('/api/gsd-codes/active');
    },

    createGsdCode(payload: GsdCodePayload) {
        return request<{ message: string }>('/api/gsd-codes', {
            method: 'POST',
            body: payload,
        });
    },

    updateGsdCode(id: number, payload: GsdCodePayload) {
        return request<{ message: string }>(`/api/gsd-codes/${id}`, {
            method: 'PUT',
            body: payload,
        });
    },

    // importGsdCodesFromExcel(file: File, sheetName = 'GSD') {
    //     const formData = new FormData();
    //     formData.append('file', file);
    //     formData.append('sheetName', sheetName);

    //     return fetch(`${API_BASE_URL}/api/gsd-codes/import-gsd`, {
    //         method: 'POST',
    //         body: formData,
    //     }).then(async (response) => {
    //         const data = await response.json().catch(() => null);

    //         if (!response.ok) {
    //             throw new Error(data?.error || 'Import Excel thất bại.');
    //         }

    //         return data as {
    //             inserted: number;
    //             skippedDuplicate: number;
    //             skippedEmpty: number;
    //             totalRead: number;
    //             message: string;
    //         };
    //     });
    // },


    importGsdCodesExcel(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        return fetch('/api/gsd-codes/import-excel', {
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