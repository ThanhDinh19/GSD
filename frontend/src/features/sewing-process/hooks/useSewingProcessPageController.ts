// hooks/useSewingProcessPageController.ts

import {
    useState,
    type ChangeEvent,
} from 'react';

import {
    useSewingProcess,
} from './useSewingProcess';

import {
    useOperationPicker,
} from './useOperationPicker';

import {
    useOperationActions,
} from './useOperationActions';

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
    useSalaryCoefficients,
} from '../../../hooks/useSalaryCoefficient';

import {
    usePermissions,
} from '../../auth/hooks/usePermissions';

import {
    SCREEN,
} from '../../auth/constants/permission.constants';

import {
    useToast,
} from '../../../shared/notifications/ToastProvider';

import {
    sewingProcessService,
} from '../services/sewingProcess.service';

import {
    exportSewingProcessExcel,
} from '../utils/sewingProcessExcel';

import {
    getSewingProcessImageUrl,
} from '../utils/sewingProcessImage';

import type {
    SewingProcessLine,
} from '../types/sewingProcess.types';

import type {
    OperationClusterDetailDto,
} from '../types/sewingProcess.dto';


type ModalMode =
    | 'create'
    | 'view'
    | 'edit'
    | null;


function normalizeMachineCode(
    value: unknown
) {
    return String(
        value ?? ''
    )
        .normalize('NFKC')
        .trim()
        .replace(/\s+/g, '')
        .toUpperCase();
}


// function getProductCategoryGroupId(
//     item: unknown
// ): number {
//     const row =
//         item as Record<
//             string,
//             unknown
//         >;

//     return Number(
//         row.productCategoryGroupId ??
//         row.product_category_group_id ??
//         0
//     );
// }


export function useSewingProcessPageController() {
    const permissions =
        usePermissions(
            SCREEN.SEWING_PROCESS
        );

    const toast =
        useToast();

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
        salaryCoefficients,
    } = useSalaryCoefficients();

    const {
        items:
        operationClusterItems,

        loadDetail:
        loadOperationClusterDetail,
    } = useOperationClusters();

    const {
        productCateGroups,

        loading:
        productCateGroupsLoading,
    } = useProductCateGroups();


    const [
        selectedId,
        setSelectedId,
    ] = useState<
        number | null
    >(null);

    const [
        modalMode,
        setModalMode,
    ] = useState<ModalMode>(
        null
    );

    const [
        activeTab,
        setActiveTab,
    ] = useState<
        'process' | 'machine'
    >('process');

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

    const [
        importModalOpen,
        setImportModalOpen,
    ] = useState(false);

    const [
        operationClusterTreePickerOpen,
        setOperationClusterTreePickerOpen,
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
        loadCopyToForm,

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


    const activeCustomers =
        customers.filter(
            (item) =>
                Number(
                    item.statusId
                ) === 0
        );


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


    const operationClusters =
        Array.isArray(
            operationClusterItems
        )
            ? operationClusterItems
            : [];


    const mainImage =
        form.images?.[0] ??
        null;

    const mainImageFileName =
        mainImage?.imageFileName ||
        mainImage?.imageUrl ||
        '';

    const mainImageSrc =
        getSewingProcessImageUrl(
            mainImageFileName
        );


    const handleCustomerChange = (
        value: string
    ) => {
        const customerId =
            value
                ? Number(value)
                : null;

        const customer =
            activeCustomers.find(
                (item) =>
                    Number(
                        item.id
                    ) ===
                    customerId
            );

        updateForm(
            'customerId',
            customerId
        );

        updateForm(
            'customerCode',
            customer?.cusCode ??
            ''
        );

        updateForm(
            'customerName',
            customer?.cusName ??
            ''
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
                    Number(
                        item.id
                    ) ===
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
            machine?.machineName ??
            ''
        );
    };


    const handleUploadMainImage =
        async (
            event:
                ChangeEvent<HTMLInputElement>
        ) => {
            if (
                !permissions.canUploadImage
            ) {
                event.target.value =
                    '';

                return;
            }

            const canModify =
                modalMode ===
                    'create'
                    ? permissions.canCreate
                    : modalMode ===
                        'edit'
                        ? permissions.canUpdate
                        : false;

            if (!canModify) {
                event.target.value =
                    '';

                return;
            }

            const file =
                event.target
                    .files?.[0];

            if (!file) {
                return;
            }

            setImageUploading(
                true
            );

            try {
                const uploaded =
                    await sewingProcessService
                        .uploadImage(
                            file
                        );

                setForm(
                    (previous) => ({
                        ...previous,

                        images: [
                            {
                                imageFileName:
                                    uploaded
                                        .imageFileName,

                                imageUrl:
                                    uploaded
                                        .imageUrl ||
                                    uploaded
                                        .imageFileName,

                                sortOrder: 1,
                            },
                        ],
                    })
                );
            } catch (error) {
                alert(
                    error instanceof
                        Error
                        ? error.message
                        : 'Upload hình ảnh thất bại.'
                );
            } finally {
                setImageUploading(
                    false
                );

                event.target.value =
                    '';
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

            setForm(
                (previous) => ({
                    ...previous,
                    images: [],
                })
            );
        };


    const addPickedLines = (
        selectedRows:
            SewingProcessLine[]
    ) => {
        setForm(
            (previous) => {
                const currentLines =
                    previous.lines.filter(
                        (line) =>
                            String(
                                line.operationName ||
                                ''
                            ).trim() !==
                            ''
                    );

                const getKey = (
                    row:
                        SewingProcessLine
                ) =>
                    [
                        row.sourceDocumentCode ??
                        '',

                        row.sourceLineId ??
                        '',

                        row.gsdAnalysisId ??
                        '',

                        row.operationCode ??
                        '',

                        row.operationName ??
                        '',
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
                                getKey(
                                    row
                                )
                            )
                    );

                return {
                    ...previous,

                    lines: [
                        ...currentLines,
                        ...newRows,
                    ].map(
                        (
                            line,
                            index
                        ) => ({
                            ...line,

                            lineNo:
                                index +
                                1,

                            lineOrder:
                                index +
                                1,
                        })
                    ),
                };
            }
        );

        setActiveTab(
            'process'
        );
    };

    const openOperationClusterTreePicker =
        () => {
            if (
                modalMode === 'view'
            ) {
                return;
            }

            setOperationClusterTreePickerOpen(
                true
            );
        };


    const closeOperationClusterTreePicker =
        () => {
            setOperationClusterTreePickerOpen(
                false
            );
        };


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


    // const filteredOperationClusters =
    //     operationPicker
    //         .state
    //         .productCategoryGroupId
    //         ? operationClusters.filter(
    //             (item) =>
    //                 getProductCategoryGroupId(
    //                     item
    //                 ) ===
    //                 Number(
    //                     operationPicker
    //                         .state
    //                         .productCategoryGroupId
    //                 )
    //         )
    //         : operationClusters;


    const openCreate = () => {
        if (
            !permissions.canCreate
        ) {
            return;
        }

        setSelectedId(
            null
        );

        resetForm();

        setActiveTab(
            'process'
        );

        setModalMode(
            'create'
        );
    };


    const openImport = () => {
        if (
            !permissions.canCreate
        ) {
            return;
        }

        setSelectedId(
            null
        );

        resetForm();

        setActiveTab(
            'process'
        );

        setModalMode(
            'create'
        );

        setImportModalOpen(
            true
        );
    };


    const openDetail =
        async (
            id: number
        ) => {
            await loadDetailToForm(
                id
            );

            setSelectedId(
                id
            );

            setActiveTab(
                'process'
            );

            setModalMode(
                'view'
            );
        };


    const openEdit =
        async () => {
            if (
                !permissions.canUpdate
            ) {
                return;
            }

            if (!selectedId) {
                toast.warning(
                    'Vui lòng chọn chứng từ cần sửa.',
                    {
                        duration:
                            2000,
                    }
                );

                return;
            }

            await loadDetailToForm(
                selectedId
            );

            setModalMode(
                'edit'
            );
        };


    const openCopy =
        async () => {
            if (
                !permissions.canCreate
            ) {
                return;
            }


            if (
                !selectedId
            ) {
                toast.warning(
                    'Vui lòng chọn chứng từ cần sao chép.',
                    {
                        duration: 2000,
                    }
                );

                return;
            }


            try {
                await loadCopyToForm(
                    selectedId
                );


                /*
                 * Copy phải trở thành CREATE mới.
                 * Không giữ selectedId của chứng từ nguồn.
                 */
                setSelectedId(
                    null
                );


                setActiveTab(
                    'process'
                );


                setModalMode(
                    'create'
                );
            } catch (
            error
            ) {
                console.error(
                    'Copy Sewing Process lỗi:',
                    error
                );


                toast.warning(
                    error instanceof Error
                        ? error.message
                        : 'Không sao chép được chứng từ.',
                    {
                        duration: 3000,
                    }
                );
            }
        };


    const handleMoveToTrash =
        async (
            id: number
        ) => {
            const confirmed =
                window.confirm(
                    'Bạn có chắc muốn chuyển chứng từ này vào thùng rác?'
                );

            if (!confirmed) {
                return;
            }

            try {
                const response =
                    await deactivateSewingProcess(
                        id
                    );

                alert(
                    response.message
                );
            } catch (error) {
                alert(
                    error instanceof
                        Error
                        ? error.message
                        : 'Không thể chuyển vào thùng rác'
                );
            }
        };


    const save =
        async () => {
            const isEdit =
                Boolean(
                    selectedId
                ) &&
                modalMode ===
                'edit';

            if (
                isEdit &&
                !permissions.canUpdate
            ) {
                return;
            }

            if (
                !isEdit &&
                !permissions.canCreate
            ) {
                return;
            }

            const response =
                isEdit &&
                    selectedId
                    ? await updateSewingProcess(
                        selectedId
                    )
                    : await createSewingProcess();

            if (!response) {
                return;
            }

            toast.success(
                String(
                    response.message
                ),
                {
                    duration:
                        3000,
                }
            );

            setModalMode(
                null
            );
        };


    const handleExportExcel =
        async () => {
            if (!selectedId) {
                toast.warning(
                    'Vui lòng chọn chứng từ cần xuất.',
                    {
                        duration:
                            2000,
                    }
                );

                return;
            }

            try {
                const detail =
                    await sewingProcessService
                        .getSewingProcessById(
                            selectedId
                        );

                await exportSewingProcessExcel(
                    detail
                );

                toast.success(
                    'Xuất Excel thành công.',
                    {
                        duration:
                            2000,
                    }
                );
            } catch (error) {
                console.error(
                    'Export Excel lỗi:',
                    error
                );

                toast.warning(
                    error instanceof
                        Error
                        ? error.message
                        : 'Không xuất được Excel.',
                    {
                        duration:
                            3000,
                    }
                );
            }
        };


    const handleApplyImportedLines =
        (
            importedLines:
                SewingProcessLine[]
        ) => {
            const normalizedLines =
                importedLines.map(
                    (
                        line,
                        index
                    ) => {
                        const importedMachineCode =
                            normalizeMachineCode(
                                line.machineCode
                            );

                        const matchedMachine =
                            importedMachineCode
                                ? activeMachines.find(
                                    (
                                        machine
                                    ) => {
                                        const row =
                                            machine as typeof machine & {
                                                codeMMTB?: string | null;
                                                code_mmtb?: string | null;
                                            };

                                        const machineCodes =
                                            [
                                                row.codeMmtb,
                                                row.codeMMTB,
                                                row.code_mmtb,
                                                row.machineCode,
                                            ]
                                                .map(
                                                    normalizeMachineCode
                                                )
                                                .filter(
                                                    Boolean
                                                );

                                        return machineCodes.includes(
                                            importedMachineCode
                                        );
                                    }
                                )
                                : undefined;

                        const importedSkillGradeLevel =
                            line.skillGradeLevel !==
                                null &&
                                line.skillGradeLevel !==
                                undefined
                                ? Number(
                                    line.skillGradeLevel
                                )
                                : null;

                        const matchedSalaryCoefficient =
                            importedSkillGradeLevel !==
                                null
                                ? salaryCoefficients.find(
                                    (
                                        item
                                    ) =>
                                        Number(
                                            item.level
                                        ) ===
                                        importedSkillGradeLevel &&
                                        Number(
                                            item.statusId
                                        ) ===
                                        0
                                )
                                : undefined;

                        return {
                            ...line,

                            lineNo:
                                index +
                                1,

                            lineOrder:
                                index +
                                1,

                            machineId:
                                matchedMachine
                                    ? Number(
                                        matchedMachine.id
                                    )
                                    : null,

                            machineCode:
                                matchedMachine
                                    ? (
                                        matchedMachine.codeMmtb ||
                                        matchedMachine.machineCode ||
                                        line.machineCode ||
                                        ''
                                    )
                                    : (
                                        line.machineCode ||
                                        ''
                                    ),

                            machineName:
                                matchedMachine
                                    ? (
                                        matchedMachine.machineName ||
                                        ''
                                    )
                                    : (
                                        line.machineName ||
                                        ''
                                    ),

                            skillGradeId:
                                matchedSalaryCoefficient
                                    ? Number(
                                        matchedSalaryCoefficient.levelId
                                    )
                                    : (
                                        line.skillGradeId ??
                                        null
                                    ),

                            skillGradeLevel:
                                importedSkillGradeLevel,

                            salaryCoefficient:
                                matchedSalaryCoefficient
                                    ? Number(
                                        matchedSalaryCoefficient.coefficient
                                    )
                                    : Number(
                                        line.salaryCoefficient ??
                                        0
                                    ),
                        };
                    }
                );

            updateForm(
                'lines',
                normalizedLines
            );

            setActiveTab(
                'process'
            );

            setImportModalOpen(
                false
            );

            toast.success(
                `Đã áp dụng ${normalizedLines.length} dòng từ Excel.`,
                {
                    duration:
                        2000,
                }
            );
        };


    const canModify =
        modalMode ===
            'create'
            ? permissions.canCreate
            : modalMode ===
                'edit'
                ? permissions.canUpdate
                : false;

    const canCalculate =
        canModify &&
        permissions.canCalculate;

    const canUploadImage =
        canModify &&
        permissions.canUploadImage;

    const handleConfirmOperationClusterTree =
        (
            rows:
                SewingProcessLine[]
        ) => {
            addPickedLines(
                rows
            );

            setOperationClusterTreePickerOpen(
                false
            );
        };


    const closeMainModal =
        () => {
            setOperationClusterTreePickerOpen(
                false
            );

            setImportModalOpen(
                false
            );

            setModalMode(
                null
            );
        };


    const closeImportModal =
        () => {
            setImportModalOpen(
                false
            );

            setModalMode(
                null
            );
        };


    return {
        permissions,

        items,
        form,
        result,

        loading,
        calculating,
        saving,
        deactivatingId,

        selectedId,
        modalMode,
        activeTab,

        previewImageUrl,
        previewGsdImageUrl,

        imageUploading,
        importModalOpen,

        activeCustomers,
        activeMachines,

        mainImageFileName,
        mainImageSrc,

        productCateGroups,
        productCateGroupsLoading,

        // filteredOperationClusters,

        operationActions,

        operationClusterTreePickerOpen,

        openOperationClusterTreePicker,
        closeOperationClusterTreePicker,
        handleConfirmOperationClusterTree,

        operationPicker,


        canModify,
        canCalculate,
        canUploadImage,

        setSelectedId,
        setModalMode,
        setActiveTab,

        setPreviewImageUrl,
        setPreviewGsdImageUrl,

        refresh,
        updateForm,
        updateLine,
        removeLine,
        calculate,

        handleCustomerChange,
        handleMachineChange,

        handleUploadMainImage,
        handleRemoveMainImage,

        openCreate,
        openImport,
        openDetail,
        openEdit,
        openCopy,

        handleMoveToTrash,
        save,

        handleExportExcel,

        handleApplyImportedLines,

        closeMainModal,
        closeImportModal,
    };
}