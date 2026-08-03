import {
    useState,
    type ChangeEvent,
} from 'react';

import {
    Button
} from '../../../shared/components';

import {
    useSewingProcess,
} from '../hooks/useSewingProcess';

import {
    useOperationPicker,
} from '../hooks/useOperationPicker';

import {
    useOperationActions,
} from '../hooks/useOperationActions';

import type {
    SewingProcessLine,
} from '../types/sewingProcess.types';

import {
    SewingProcessListTable,
} from '../components/SewingProcessListTable';

import {
    SewingProcessModal,
} from '../components/SewingProcessModal';

import {
    SewingProcessForm,
} from '../components/SewingProcessForm';

import {
    OperationPickerModal,
} from '../components/OperationPickerModal';

import {
    OperationActionsModal,
} from '../components/OperationActionsModal';

import {
    ImagePreviewModal,
} from '../../../shared/components/ImagePreviewModal';

import {
    useCustomers,
} from '../../../hooks/useCustomers';

import {
    useMachineEquipments,
} from '../../../hooks/useMachineEquipments';

import {
    useOperationClusters,
} from '../../../hooks/useOperationClusters';

import {
    useProductCateGroups,
} from '../../../hooks/useProductCateGroup';

import {
    sewingProcessService,
} from '../services/sewingProcess.service';

import {
    getSewingProcessImageUrl,
} from '../utils/sewingProcessImage';

import type {
    OperationClusterDetailDto,
} from '../types/sewingProcess.dto';

import {
    usePermissions,
} from '../../auth/hooks/usePermissions';
import {
    SCREEN,
} from '../../auth/constants/permission.constants';

import {
    useToast
} from '../../../shared/notifications/ToastProvider';


export default function SewingProcessPage() {
    const permissions = usePermissions(SCREEN.SEWING_PROCESS);
    const toast = useToast();
    const sewingProcess =
        useSewingProcess();

    const operationActions =
        useOperationActions();

    const {
        customers,
    } = useCustomers();

    const {
        machineEquiments_test,
    } = useMachineEquipments();

    const {
        items: rawOperationClusters,
        loadDetail:
        loadOperationClusterDetail,
    } = useOperationClusters();

    console.log(
        'rawOperationClusters:',
        rawOperationClusters
    );

    console.log(
        'isArray:',
        Array.isArray(rawOperationClusters)
    );


    const operationClusters =
        Array.isArray(rawOperationClusters)
            ? rawOperationClusters
            : [];

    const {
        productCateGroups,
    } = useProductCateGroups();

    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [
        modalMode,
        setModalMode,
    ] = useState<'create' | 'view' | 'edit' | null>(null);

    const [
        activeTab,
        setActiveTab,
    ] = useState<'process' | 'machine'>('process');

    const [
        previewImageUrl,
        setPreviewImageUrl,
    ] = useState('');

    const [
        previewGsdImageUrl,
        setPreviewGsdImageUrl,
    ] = useState('');

    const [
        imageUploading,
        setImageUploading,
    ] = useState(false);

    const {
        items,
        form,
        result,

        loading,
        calculating,
        saving,
        deactivatingId,

        refresh,
        loadDetailToForm,

        setForm,
        updateForm,
        updateLine,
        removeLine,

        resetForm,
        calculate,

        createSewingProcess,
        updateSewingProcess,
        deactivateSewingProcess,
    } = sewingProcess;

    const mainImage =
        form.images?.[0] ?? null;

    const mainImageFileName =
        mainImage?.imageFileName ||
        mainImage?.imageUrl ||
        '';

    const mainImageSrc =
        getSewingProcessImageUrl(
            mainImageFileName
        );

    const activeCustomers =
        customers.filter(
            (item) =>
                Number(item.statusId) === 0
        );

    // const activeMachines =
    //     machineEquiments_test.filter(
    //         (item) =>
    //             Number(item.statusId) === 0
    //     );

    const activeMachines =
        machineEquiments_test.filter(
            (item) => {
                const row =
                    item as typeof item & {
                        status_id?: number;
                    };

                return Number(
                    row.statusId ??
                    row.status_id ??
                    0
                ) === 0;
            }
        );

    const handleCustomerChange = (value: string) => {
        const customerId =
            value
                ? Number(value)
                : null;

        const customer =
            activeCustomers.find(
                (item) =>
                    Number(item.id) ===
                    customerId
            );

        updateForm(
            'customerId',
            customerId
        );

        updateForm(
            'customerCode',
            customer?.cusCode ?? ''
        );

        updateForm(
            'customerName',
            customer?.cusName ?? ''
        );
    };

    const handleMachineChange = (
        lineIndex: number,
        value: string
    ) => {
        const machineId =
            value
                ? Number(value)
                : null;

        const machine =
            activeMachines.find(
                (item) =>
                    Number(item.id) ===
                    machineId
            );

        updateLine(
            lineIndex,
            'machineId',
            machineId
        );

        updateLine(
            lineIndex,
            'machineCode',
            machine?.codeMmtb ??
            machine?.machineCode ??
            ''
        );

        updateLine(
            lineIndex,
            'machineName',
            machine?.machineName ?? ''
        );
    };

    const handleUploadMainImage = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        if (!permissions.canUploadImage) {
            event.target.value = '';
            return;
        }

        const canModify =
            modalMode === 'create'
                ? permissions.canCreate
                : modalMode === 'edit'
                    ? permissions.canUpdate
                    : false;

        if (!canModify) {
            event.target.value = '';
            return;
        }

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setImageUploading(true);

        try {
            const uploaded =
                await sewingProcessService.uploadImage(file);

            setForm((previous) => ({
                ...previous,
                images: [
                    {
                        imageFileName:
                            uploaded.imageFileName,

                        imageUrl:
                            uploaded.imageUrl ||
                            uploaded.imageFileName,

                        sortOrder: 1,
                    },
                ],
            }));
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : 'Upload hình ảnh thất bại.'
            );
        } finally {
            setImageUploading(false);
            event.target.value = '';
        }
    };

    const handleRemoveMainImage =
        () => {
            const confirmed =
                window.confirm(
                    'Bạn có chắc muốn xóa hình ảnh này?'
                );

            if (!confirmed) {
                return;
            }

            setForm((previous) => ({
                ...previous,
                images: [],
            }));
        };

    const addPickedLines = (
        selectedRows:
            SewingProcessLine[]
    ) => {
        setForm((previous) => {
            const currentLines =
                previous.lines.filter(
                    (line) =>
                        String(
                            line.operationName || ''
                        ).trim() !== ''
                );

            const getKey = (
                row: SewingProcessLine
            ) =>
                [
                    row.sourceDocumentCode ?? '',
                    row.sourceLineId ?? '',
                    row.gsdAnalysisId ?? '',
                    row.operationCode ?? '',
                    row.operationName ?? '',
                ].join('|');

            const currentKeys =
                new Set(
                    currentLines.map(
                        getKey
                    )
                );

            const newRows =
                selectedRows.filter(
                    (row) =>
                        !currentKeys.has(
                            getKey(row)
                        )
                );

            return {
                ...previous,

                lines: [
                    ...currentLines,
                    ...newRows,
                ].map(
                    (line, index) => ({
                        ...line,

                        lineNo: index + 1,
                        lineOrder: index + 1,
                    })
                ),
            };
        });

        setActiveTab('process');
    };

    // Truyền loadOperationClusterDetail
    // từ useOperationClusters vào đây.
    const operationPicker =
        useOperationPicker({
            loadDetail:
                async (id) => {
                    const detail =
                        await loadOperationClusterDetail(
                            id
                        );

                    return detail as
                        OperationClusterDetailDto;
                },

            onConfirm:
                addPickedLines,
        });

    function getProductCategoryGroupId(
        item: unknown
    ): number {
        const row =
            item as Record<
                string,
                unknown
            >;

        return Number(
            row.productCategoryGroupId ??
            row.product_category_group_id ??
            0
        );
    }

    const filteredOperationClusters =
        operationPicker.state
            .productCategoryGroupId
            ? operationClusters.filter(
                (item) =>
                    getProductCategoryGroupId(
                        item
                    ) ===
                    Number(
                        operationPicker.state
                            .productCategoryGroupId
                    )
            )
            : operationClusters;

    console.log(
        'operationClusters:',
        operationClusters
    );

    console.log(
        'filteredOperationClusters:',
        filteredOperationClusters
    );


    const openCreate = () => {

        if (!permissions.canCreate) {
            return;
        }

        setSelectedId(null);

        resetForm();

        setActiveTab('process');

        setModalMode('create');
    };

    const openDetail = async (id: number) => {
        await loadDetailToForm(id);

        setSelectedId(id);

        setActiveTab('process');

        setModalMode('view');
    };

    const openEdit = async () => {
        if (!permissions.canUpdate) {
            return;
        }

        if (!selectedId) {
            
            toast.warning(
                "Vui lòng chọn chứng từ cần sửa.",
                {
                    duration: 2000
                }
            )
            return;
        }

        await loadDetailToForm(selectedId);
        setModalMode('edit');
    };

    const handleMoveToTrash =
        async (id: number) => {
            const confirmed = window.confirm(
                'Bạn có chắc muốn chuyển chứng từ này vào thùng rác?'
            );

            if (!confirmed) {
                return;
            }

            try {
                const response =
                    await deactivateSewingProcess(id);

                alert(response.message);
            } catch (error) {
                alert(
                    error instanceof Error
                        ? error.message
                        : 'Không thể chuyển vào thùng rác'
                );
            }
        };

    const save = async () => {
        const isEdit =
            Boolean(selectedId) &&
            modalMode === 'edit';

        if (isEdit && !permissions.canUpdate) {
            return;
        }

        if (!isEdit && !permissions.canCreate) {
            return;
        }

        const response =
            isEdit && selectedId
                ? await updateSewingProcess(selectedId)
                : await createSewingProcess();

        if (!response) {
            return;
        }

       
        toast.success( 
            String(response.message),
            {
                duration: 3000
            }
        )
        setModalMode(null);
    };

    const handleExportExcel = () => {
        alert('Do you have a boyfriend ?');
    }

    const canModify =
        modalMode === 'create'
            ? permissions.canCreate
            : modalMode === 'edit'
                ? permissions.canUpdate
                : false;

    const canCalculate =
        canModify &&
        permissions.canCalculate;

    const canUploadImage =
        canModify &&
        permissions.canUploadImage;

    if (!permissions.canView) {
        return (
            <div className="p-6 text-sm text-red-600">
                Bạn không có quyền xem màn hình này.
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 bg-slate-50 p-4 overflow-auto">
            <div className="ax-w-[1720px] mx-auto space-y-4">
                <div className="flex items-center justify-between mb-4">
                   <div>    
                        <h2 className="text-lg font-bold uppercase text-slate-800">
                            Danh sách quy trình may
                        </h2>
                    </div>

                    <div className="flex gap-2">
                        {permissions.canCreate && (
                            <Button
                                variant="primary"
                                onClick={openCreate}
                            >
                                New
                            </Button>
                        )}

                        {permissions.canUpdate && (
                            <Button
                                variant="warning"
                                onClick={openEdit}
                                disabled={!selectedId}
                            >
                                Edit
                            </Button>
                        )}

                        {/* 
                        {permissions.canDelete && (
                            <Button
                                variant='danger'
                                disabled={!selectedId}
                                onClick={() =>
                                    void handleMoveToTrash(Number(selectedId))
                                }
                            >
                                Trash
                            </Button>
                        )} */}

                        {permissions.canExport && (
                            <Button
                                onClick={handleExportExcel}
                            >
                                Export
                            </Button>
                        )}

                        <Button
                            onClick={() => {
                                void refresh();
                            }}
                            loading={loading}
                            loadingText="Loading..."
                        >
                            Refresh
                        </Button>
                    </div>
                </div>

                {permissions.canView && (
                    <SewingProcessListTable
                        items={items}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        onOpenDetail={openDetail}
                        onPreviewImage={setPreviewImageUrl}
                    />
                )}

            </div>

            {modalMode && (
                <SewingProcessModal
                    mode={modalMode}
                    saving={saving}
                    calculating={calculating}
                    onClose={() =>
                        setModalMode(null)
                    }
                    onEdit={() =>
                        setModalMode('edit')
                    }
                    onSave={save}
                >
                    <SewingProcessForm
                        form={form}
                        result={result}
                        customers={activeCustomers}
                        machines={activeMachines}
                        readOnly={
                            modalMode === 'view' ||
                            !canModify
                        }
                        canCalculate={canCalculate}
                        canUploadImage={canUploadImage}
                        activeTab={activeTab}
                        calculating={calculating}
                        imageSrc={mainImageSrc}
                        imageFileName={mainImageFileName}
                        imageUploading={imageUploading}
                        onUpdateForm={updateForm}
                        onUpdateLine={updateLine}
                        onCustomerChange={handleCustomerChange}
                        onMachineChange={handleMachineChange}
                        onRemoveLine={removeLine}
                        onOpenActions={operationActions.open}
                        onPreviewImage={setPreviewGsdImageUrl}
                        onUploadImage={handleUploadMainImage}
                        onRemoveImage={handleRemoveMainImage}
                        onOpenOperationPicker={
                            operationPicker.actions.open
                        }
                        onCalculate={calculate}
                        onActiveTabChange={setActiveTab}
                    />
                </SewingProcessModal>
            )}

            {operationPicker.state.isOpen && (
                <OperationPickerModal
                    productCateGroups={
                        productCateGroups
                    }
                    operationClusters={
                        filteredOperationClusters
                    }
                    productCateGroupId={
                        operationPicker.state
                            .productCategoryGroupId
                    }
                    operationClusterId={
                        operationPicker.state
                            .operationClusterId
                    }
                    rows={
                        operationPicker.state.rows
                    }
                    selectedMap={
                        operationPicker.state
                            .selectedMap
                    }
                    selectedCount={
                        operationPicker.state
                            .selectedCount
                    }
                    onProductCateGroupChange={
                        operationPicker.actions
                            .changeProductCategoryGroup
                    }
                    onClusterChange={
                        operationPicker.actions
                            .changeCluster
                    }
                    onToggleRow={
                        operationPicker.actions
                            .toggleRow
                    }
                    onToggleAll={
                        operationPicker.actions
                            .toggleAll
                    }
                    onConfirm={
                        operationPicker.actions
                            .confirm
                    }
                    onClose={
                        operationPicker.actions
                            .close
                    }
                />
            )}

            {operationActions.modal && (
                <OperationActionsModal
                    title={
                        operationActions.modal.title
                    }
                    loading={
                        operationActions.modal.loading
                    }
                    rows={
                        operationActions.modal.rows
                    }
                    onClose={
                        operationActions.close
                    }
                />
            )}

            {previewImageUrl && (
                <ImagePreviewModal
                    imageUrl={previewImageUrl}
                    onClose={() =>
                        setPreviewImageUrl('')
                    }
                />
            )}

            {previewGsdImageUrl && (
                <ImagePreviewModal
                    imageUrl={
                        previewGsdImageUrl
                    }
                    onClose={() =>
                        setPreviewGsdImageUrl('')
                    }
                />
            )}
        </div>
    );
}