import axios from 'axios';

import type {
    DynamicRow,
    DynamicTableResponse,
} from '../types/types';


const api = axios.create({
    baseURL: 'http://localhost:9000/api',
});


export const myService = {

    vGSD30BizDoc:
        async (): Promise<DynamicTableResponse> => {

            const res =
                await api.get<DynamicTableResponse>(
                    '/vGSD30BizDoc'
                );

            return res.data;
        },


    addVGSD30BizDoc:
        async (
            data: DynamicRow
        ) => {

            const res =
                await api.post(
                    '/vGSD30BizDoc',
                    data
                );

            return res.data;
        },


    updateVGSD30BizDoc:
        async (
            id: unknown,
            data: DynamicRow
        ) => {

            const res =
                await api.put(
                    `/vGSD30BizDoc/${id}`,
                    data
                );

            return res.data;
        },


    deleteVGSD30BizDoc:
        async (
            id: unknown
        ) => {

            const res =
                await api.delete(
                    `/vGSD30BizDoc/${id}`
                );

            return res.data;
        }
};