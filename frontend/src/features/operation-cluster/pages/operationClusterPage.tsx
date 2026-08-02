import {
    useState,
} from 'react';

import {
    Button
} from '../../../shared/components';

import {
    useOperationClusters
} from '../hooks/useOperationCluster';

import {
    useWorks
} from '../../../hooks/useWorks';

import {
    useProductCates
} from '../../../hooks/useProductCate';

import {
    useProductCateGroups
} from '../../../hooks/useProductCateGroup';

import {
    useStatuses
} from '../../../hooks/useStatus' 



import type {
    OperationClusterHeader
} from '../types/operationCluster.type'

import {
    OperationClusterListTable
} from '../components/operationClusterListTable';

import {
    ModalDetail,
} from '../components/modalDetail';

import {
    Form
} from '../components/Form';

export default function OperationClusterPage() {
    const {
        items,
        form,
        selectedItemDetail,
        loading,
        resetForm,
        updateForm,
        loadOperationCluster,
        loadOperationClusterDetail,
        refresh,
        handleExportExcel,
        createOperationCluster,
    } = useOperationClusters();

    const {
        works
    } = useWorks();

    const {
        productCates
    } = useProductCates();

    const {
        productCateGroups
    } = useProductCateGroups();

    const {
        statuses
    } = useStatuses();

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [
        modalMode,
        setModalMode,
    ] = useState<'create' | 'view' | 'edit' | null>(null);

    const activeWorks = works.filter(
        (item) => Number(item.statusId) === 0
    )

    const activeProductCates = productCates.filter(
        (item) => Number(item.statusId) === 0
    )

    const activeProductCateGroups = productCateGroups.filter(
        (item) => Number(item.statusId) === 0
    )

    const openDetail = async (id: number) => {
        await loadOperationClusterDetail(id);

        setSelectedId(id);

        setModalMode('view');
    };

    const openCreate = () => {
        setSelectedId(null);
        resetForm();
        setModalMode('create');
    }

    const save = async () => {
        if (modalMode === 'create') {
            await createOperationCluster();
        }
    }

    const handleWorkChange = (value: string) => {
        const workId = value ? Number(value) : null

        updateForm('work_id', workId)
    }

    const handleProductCateChange = (value: string) => {
        const productCateId = value ? Number(value) : null

        updateForm('product_category_id', productCateId)
    }

    const handleProductCateGroupChange = (value: string) => {
        const productCateGroupId = value ? Number(value) : null

        updateForm('product_category_group_id', productCateGroupId)
    }

    const handleStatusChange = (value: string) => {
        const statusId = value ? Number(value) : null

        updateForm('status_id', statusId)
    }

    const onClose = () => {
        setModalMode(null);
    }

    return (
        <div className="h-full min-h-0 bg-slate-50 p-4 overflow-auto">
            <div className="max-w-[1720px] mx-auto space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-lg font-bold uppercase text-slate-800">
                            Danh sách kho cụm công đoạn
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant='primary'
                            onClick={openCreate}
                        >
                            Thêm mới
                        </Button>

                        <Button
                            variant='warning'
                        // onClick={handleEdit}
                        >
                            Sửa
                        </Button>

                        <Button
                        // onClick={handleCopy}
                        >
                            Sao chép
                        </Button>

                        <Button
                            onClick={handleExportExcel}
                        >
                            Xuất Excel
                        </Button>

                        <Button
                            variant='default'
                            onClick={() => {
                                void refresh();
                            }}
                            loading={loading}
                            loadingText='Đang tải...'
                        >
                            Tải lại
                        </Button>
                    </div>
                </div>

                <OperationClusterListTable
                    items={items}
                    onOpenDetail={openDetail}
                />
            </div>

            {modalMode === 'view' && (
                <ModalDetail
                    dashboard={selectedItemDetail?.dashboard}
                    header={selectedItemDetail?.header}
                    operations={selectedItemDetail?.operations}
                    onClose={() => {
                        setModalMode(null)
                    }}
                />
            )}

            {modalMode === 'create' && (
                <Form
                    form={form}
                    works={activeWorks}
                    productCates={activeProductCates}
                    productCateGroups={activeProductCateGroups}
                    statuses={statuses}
                    onUpdate={updateForm}
                    onWorkChange={handleWorkChange}
                    onProductCateChange={handleProductCateChange}
                    onProductCateGroupChange={handleProductCateGroupChange}
                    onStatusChange={handleStatusChange}
                    onClose={onClose}
                    onSave={save}
                />
            )}
        </div>
    );
}