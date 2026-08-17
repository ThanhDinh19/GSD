import {
    useMyService
} from '../hooks/useMyService';

import {
    DynamicTable
} from '../../../shared/components/DataTable';

export default function MyPage() {
    const {
        vGSD30BizDoc,
        columns,
        add_vGSD30BizDoc
    } = useMyService();

    return (
        <DynamicTable
            columns={columns}
            rows={vGSD30BizDoc}
            onAdd={add_vGSD30BizDoc}
        />
    );
}