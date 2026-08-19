import {
    DynamicTable
} from '../../../shared/components/DynamicTable';

import {
    useMyService
} from '../hooks/useMyService';


export default function BizDocPage() {

    const {
        vGSD30BizDoc,
        columns,
        loading,

        get_vGSD30BizDoc,
        add_vGSD30BizDoc,
        update_vGSD30BizDoc,
        delete_vGSD30BizDoc,

    } = useMyService();


    return (
        <DynamicTable
            columns={columns}
            rows={vGSD30BizDoc}

            idField="BizDocID"

            loading={loading}

            onRefresh={
                get_vGSD30BizDoc
            }

            onAdd={
                add_vGSD30BizDoc
            }

            onEdit={
                update_vGSD30BizDoc
            }

            onDelete={async (
                id
            ) => {
                await delete_vGSD30BizDoc(
                    id
                );
            }}
        />
    );
}