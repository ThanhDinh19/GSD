import {
    useEffect,
    useState,
} from 'react';

import {
    myService
} from '../services/my.service';

import type {
    DynamicColumn,
    DynamicRow,
} from '../types/types';


export function useMyService() {

    const [
        vGSD30BizDoc,
        setVGSD30BizDoc
    ] = useState<DynamicRow[]>([]);

    const [
        columns,
        setColumns
    ] = useState<DynamicColumn[]>([]);

    const [
        loading,
        setLoading
    ] = useState(false);


    const get_vGSD30BizDoc =
        async () => {

            try {

                setLoading(true);

                const result =
                    await myService
                        .vGSD30BizDoc();

                setVGSD30BizDoc(
                    result.data
                );

                setColumns(
                    result.columns
                );

                return result;

            } finally {

                setLoading(false);
            }
        };


    const add_vGSD30BizDoc =
        async (
            data: DynamicRow
        ) => {

            await myService
                .addVGSD30BizDoc(
                    data
                );

            await get_vGSD30BizDoc();
        };


    const update_vGSD30BizDoc =
        async (
            id: unknown,
            data: DynamicRow
        ) => {

            await myService
                .updateVGSD30BizDoc(
                    id,
                    data
                );

            await get_vGSD30BizDoc();
        };


    const delete_vGSD30BizDoc =
        async (
            id: unknown
        ) => {

            await myService
                .deleteVGSD30BizDoc(
                    id
                );

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

        add_vGSD30BizDoc,
        update_vGSD30BizDoc,
        delete_vGSD30BizDoc,
    };
}