import {
    useState,
    useEffect,
} from 'react';

import {
    myService
} from '../services/my.service';

import type {
    DynamicColumn,
    DynamicRow,
} from '../types/types';

export function useMyService() {
    const [vGSD30BizDoc, setVGSD30BizDoc] = useState<DynamicRow[]>([]);

    const [columns, setColumns] = useState<DynamicColumn[]>([]);

    const [loading, setLoading] = useState(false);

    const get_vGSD30BizDoc = async () => {
        try {
            setLoading(true);

            const result = await myService.vGSD30BizDoc();

            setVGSD30BizDoc(result.data);
            setColumns(result.columns);

            return result;
        } finally {
            setLoading(false);
        }
    };

    const add_vGSD30BizDoc = async (formData: Record<string, unknown>) => {
        await myService.addVGSD30BizDoc(formData);
        await get_vGSD30BizDoc();
    };

    useEffect(() => {
        get_vGSD30BizDoc();
    }, []);

    return {
        vGSD30BizDoc,
        columns,
        loading,

        get_vGSD30BizDoc,
        add_vGSD30BizDoc
    };
}