import {
    useState,
} from 'react';
import type {
    Dispatch,
    SetStateAction,
} from 'react';

import type {
    CreateOperationClusterPayload,
    FormMode,
    GsdActionDetail,
    OperationActionPopupState,
    OperationClusterDetail,
    OperationClusterFormState,
    OperationClusterGroupPayload,
    OperationClusterOperationView,
} from '../types/operationCluster.types';

import {
    useToast,
} from '../../../shared/notifications/ToastProvider';

import {
    toNumber,
} from '../utils/operationCluster.utils';

type UseOperationClusterWorkflowParams = {
    form: OperationClusterFormState;
    groups: OperationClusterGroupPayload[];
    requiredEfficiency: number;
    formMode: FormMode;
    editingId: number | null;

    loadItems: () => Promise<unknown>;
    loadDetail: (
        id: number
    ) => Promise<OperationClusterDetail>;
    loadGsdActions: (
        id: number
    ) => Promise<GsdActionDetail[]>;

    createItem: (
        payload: CreateOperationClusterPayload
    ) => Promise<unknown>;
    updateItem: (
        id: number,
        payload: CreateOperationClusterPayload
    ) => Promise<unknown>;
    copyItem: (
        payload: CreateOperationClusterPayload
    ) => Promise<unknown>;

    setSelectedDetail: Dispatch<
        SetStateAction<OperationClusterDetail | null>
    >;

    openEditFromDetail: (
        detail: OperationClusterDetail,
        id: number
    ) => void;
    openCopyFromDetail: (
        detail: OperationClusterDetail
    ) => void;
    closeEditorAfterSave: () => void;
};

export function useOperationClusterWorkflow({
    form,
    groups,
    requiredEfficiency,
    formMode,
    editingId,

    loadItems,
    loadDetail,
    loadGsdActions,

    createItem,
    updateItem,
    copyItem,

    setSelectedDetail,

    openEditFromDetail,
    openCopyFromDetail,
    closeEditorAfterSave,
}: UseOperationClusterWorkflowParams) {
    const toast = useToast();

    const [
        selectedSavedId,
        setSelectedSavedId,
    ] = useState<number | null>(null);

    const [
        isSavedDetailOpen,
        setIsSavedDetailOpen,
    ] = useState(false);

    const [
        previewImageUrl,
        setPreviewImageUrl,
    ] = useState('');

    const [
        operationActionPopup,
        setOperationActionPopup,
    ] = useState<OperationActionPopupState | null>(null);

    const [
        operationActions,
        setOperationActions,
    ] = useState<GsdActionDetail[]>([]);

    const [
        loadingOperationActions,
        setLoadingOperationActions,
    ] = useState(false);

    const handleOpenOperationActions = async (
        operation: OperationClusterOperationView
    ) => {
        const gsdAnalysisId = Number(
            operation.gsd_analysis_id || 0
        );

        if (!gsdAnalysisId) {
            alert(
                'Công đoạn này chưa có mã phân tích GSD để xem thao tác'
            );
            return;
        }

        setOperationActionPopup({
            operationName:
                operation.operation_name,
            operationCode:
                operation.operation_code,
            gsdAnalysisId,
        });

        setOperationActions([]);
        setLoadingOperationActions(true);

        try {
            const actions =
                await loadGsdActions(
                    gsdAnalysisId
                );

            setOperationActions(
                actions
            );
        } catch (error) {
            console.error(
                'Load thao tác công đoạn lỗi:',
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : 'Không lấy được danh sách thao tác'
            );
        } finally {
            setLoadingOperationActions(
                false
            );
        }
    };

    const handleCloseOperationActions = () => {
        setOperationActionPopup(null);
        setOperationActions([]);
        setLoadingOperationActions(false);
    };

    const handleExportExcel = () => {
        toast.success(
            'Do you have a boyfriend ?',
            {
                duration: 2000,
            }
        );
    };

    const handleEdit = async () => {
        if (!selectedSavedId) {
            alert(
                'Vui lòng chọn một chứng từ cần sửa'
            );
            return;
        }

        try {
            const detail =
                await loadDetail(
                    selectedSavedId
                );

            if (
                !detail ||
                !detail.header
            ) {
                alert(
                    'Không lấy được dữ liệu chứng từ cần sửa'
                );
                return;
            }

            openEditFromDetail(
                detail,
                selectedSavedId
            );
        } catch (error) {
            console.error(
                'Load chứng từ để sửa lỗi:',
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : 'Không mở được chứng từ để sửa'
            );
        }
    };

    const handleCopy = async () => {
        if (!selectedSavedId) {
            alert(
                'Vui lòng chọn một chứng từ cần sao chép'
            );
            return;
        }

        try {
            const detail =
                await loadDetail(
                    selectedSavedId
                );

            if (
                !detail ||
                !detail.header
            ) {
                alert(
                    'Không lấy được dữ liệu chứng từ cần sao chép'
                );
                return;
            }

            openCopyFromDetail(
                detail
            );
        } catch (error) {
            console.error(
                'Load chứng từ để sao chép lỗi:',
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : 'Không mở được chứng từ để sao chép'
            );
        }
    };

    const handleSave = async () => {
        try {
            if (
                !form.document_code.trim()
            ) {
                toast.warning(
                    'Vui lòng nhập mã chứng từ'
                );
                return;
            }

            const documentCode =
                form.document_code.trim();

            if (
                documentCode.length > 16
            ) {
                toast.warning(
                    `Mã chứng từ tối đa 16 ký tự. Mã hiện tại có ${documentCode.length} ký tự.`
                );
                return;
            }

            if (!form.work_id) {
                alert(
                    'Vui lòng chọn nhóm công việc'
                );
                return;
            }

            if (
                !form.product_category_id
            ) {
                alert(
                    'Vui lòng chọn chủng loại'
                );
                return;
            }

            if (
                !form.product_category_group_id
            ) {
                alert(
                    'Vui lòng chọn nhóm chủng loại'
                );
                return;
            }

            const validGroups = groups
                .filter(
                    (group) =>
                        group.cluster_name.trim()
                )
                .map(
                    (
                        group,
                        groupIndex
                    ) => ({
                        ...group,
                        line_no:
                            groupIndex + 1,
                        operations:
                            group.operations.map(
                                (
                                    operation,
                                    operationIndex
                                ) => ({
                                    ...operation,
                                    line_no:
                                        operationIndex +
                                        1,
                                    required_efficiency:
                                        toNumber(
                                            operation.required_efficiency,
                                            requiredEfficiency
                                        ) ||
                                        null,
                                })
                            ),
                    })
                );

            // const hasOperation =
            //     validGroups.some(
            //         (group) =>
            //             group.operations
            //                 .length > 0
            //     );
            // if (!hasOperation) {
            //     alert(
            //         'Vui lòng chọn ít nhất một công đoạn GSD'
            //     );


            const payload:
                CreateOperationClusterPayload = {
                    document_code:
                        documentCode,
                    work_id: Number(
                        form.work_id
                    ),
                    product_category_id:
                        Number(
                            form.product_category_id
                        ),
                    product_category_group_id:
                        Number(
                            form.product_category_group_id
                        ),
                    required_efficiency:
                        requiredEfficiency ||
                        null,
                    price_method:
                        form.price_method,
                    note:
                        form.note || null,
                    status_id:
                        form.status_id,
                    groups: validGroups,
                };

            if (
                formMode === 'edit'
            ) {
                if (!editingId) {
                    alert(
                        'Không xác định được chứng từ cần cập nhật'
                    );
                    return;
                }

                await updateItem(
                    editingId,
                    payload
                );
            } else if (
                formMode === 'copy'
            ) {
                await copyItem(
                    payload
                );
            } else {
                await createItem(
                    payload
                );
            }

            await loadItems();

            const wasEditing =
                formMode === 'edit';

            closeEditorAfterSave();
            setSelectedSavedId(null);

            setIsSavedDetailOpen(false);
            setSelectedDetail(null);
            setPreviewImageUrl('');

            alert(
                wasEditing
                    ? 'Cập nhật chứng từ thành công'
                    : 'Lưu chứng từ thành công'
            );
        } catch (error) {
            console.error(
                'Lưu kho cụm lỗi:',
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : 'Không lưu được chứng từ'
            );
        }
    };

    const handleViewSavedDocument = async (
        id: number
    ) => {
        try {
            setSelectedSavedId(id);
            setSelectedDetail(null);
            setPreviewImageUrl('');

            const detail =
                await loadDetail(id);

            if (
                !detail ||
                !detail.header
            ) {
                alert(
                    'Không lấy được chi tiết chứng từ'
                );
                return;
            }

            setSelectedDetail(
                detail
            );
            setIsSavedDetailOpen(
                true
            );
        } catch (error) {
            console.error(
                'Không xem được chi tiết:',
                error
            );

            alert(
                error instanceof Error
                    ? error.message
                    : 'Không xem được chi tiết chứng từ'
            );
        }
    };

    const handleCloseSavedDetail = () => {
        setIsSavedDetailOpen(false);
        setSelectedDetail(null);
        setSelectedSavedId(null);
        setPreviewImageUrl('');
    };

    const handlePreviewImage = (
        imageUrl: string
    ) => {
        setPreviewImageUrl(
            imageUrl
        );
    };

    const handleClosePreview = () => {
        setPreviewImageUrl('');
    };

    return {
        selectedSavedId,
        setSelectedSavedId,

        isSavedDetailOpen,
        previewImageUrl,

        operationActionPopup,
        operationActions,
        loadingOperationActions,

        handleExportExcel,
        handleEdit,
        handleCopy,
        handleSave,
        handleViewSavedDocument,

        handleOpenOperationActions,
        handleCloseOperationActions,

        handleCloseSavedDetail,
        handlePreviewImage,
        handleClosePreview,
    };
}