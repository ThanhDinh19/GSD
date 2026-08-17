
import axios from 'axios';

import type {
    DynamicTableResponse
} from '../types/types';

const api = axios.create({
    baseURL: 'http://localhost:9000/api',
});

export const myService = {
    vGSD30BizDoc: async (): Promise<DynamicTableResponse> => {
        const res = await api.get<DynamicTableResponse>(
            '/vGSD30BizDoc'
        );

        return res.data;
    },

    addVGSD30BizDoc: async (data: Record<string, unknown>) => {
        const res = await api.post('/vGSD30BizDoc', data);

        return res.data;
    }
};