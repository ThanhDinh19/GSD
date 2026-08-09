import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import type {
    MouseEvent,
} from 'react';

import type {
    CoefficientPopupState,
    FormMode,
    GsdActionDetail,
    GsdOption,
    GroupContextMenuState,
    OperationClusterDetail,
    OperationClusterFormState,
    OperationClusterGroupPayload,
    OperationClusterOperationPayload,
    OperationClusterPriceMethod,
} from '../types/operationCluster.types';

import {
    DEFAULT_OPERATION_CLUSTER_FORM,
} from '../model/operationCluster.constants';
import {
    clearOperationClusterDraft,
    readOperationClusterDraft,
    saveOperationClusterDraft,
} from '../model/operationCluster.draft';
import type {
    OperationClusterDraft,
} from '../model/operationCluster.draft';
import {
    buildEnrichedGroups,
    buildOperationClusterDashboard,
    buildVisibleOperations,
} from '../model/operationCluster.calculations';
import {
    mapOperationClusterDetailToEditor,
} from '../model/operationCluster.mapper';
import {
    createEmptyGroup,
    normalizeDecimalInput,
    renumberGroups,
    toNumber,
} from '../utils/operationCluster.utils';

type UseOperationClusterEditorParams = {
    gsdOptions: GsdOption[];
    loadGsdActions: (
        id: number
    ) => Promise<GsdActionDetail[]>;
};

export function useOperationClusterEditor({
    gsdOptions,
    loadGsdActions,
}: UseOperationClusterEditorParams) {
    const initialDraft = useMemo(
        () => readOperationClusterDraft(),
        []
    );

    const [isCreateModalOpen, setIsCreateModalOpen] =
        useState(false);

    const [formMode, setFormMode] =
        useState<FormMode>('create');

    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [form, setForm] =
        useState<OperationClusterFormState>(
            initialDraft?.form ||
                DEFAULT_OPERATION_CLUSTER_FORM
        );

    const [groups, setGroups] =
        useState<OperationClusterGroupPayload[]>(
            initialDraft?.groups || []
        );

    const [activeGroupIndex, setActiveGroupIndex] =
        useState(
            initialDraft?.activeGroupIndex || 0
        );

    const [viewAllGroups, setViewAllGroups] =
        useState(
            initialDraft?.viewAllGroups || false
        );

    const [groupContextMenu, setGroupContextMenu] =
        useState<GroupContextMenuState>(null);

    const [isGroupOverviewOpen, setIsGroupOverviewOpen] =
        useState(false);

    const [isGsdPopupOpen, setIsGsdPopupOpen] =
        useState(false);

    const [gsdSearch, setGsdSearch] =
        useState('');

    const [checkedGsdIds, setCheckedGsdIds] =
        useState<number[]>([]);

    const [gsdActionsMap, setGsdActionsMap] =
        useState<Record<number, GsdActionDetail[]>>({});

    const [loadingActionIds, setLoadingActionIds] =
        useState<number[]>([]);

    const [coefficientPopup, setCoefficientPopup] =
        useState<CoefficientPopupState>(null);

    const [coefficientSearch, setCoefficientSearch] =
        useState('');

    useEffect(() => {
        const draft: OperationClusterDraft = {
            form,
            groups,
            activeGroupIndex,
            viewAllGroups,
        };

        saveOperationClusterDraft(draft);
    }, [
        form,
        groups,
        activeGroupIndex,
        viewAllGroups,
    ]);

    const requiredEfficiency =
        toNumber(
            form.required_efficiency,
            0
        );

    const enrichedGroups = useMemo(
        () =>
            buildEnrichedGroups(
                groups,
                requiredEfficiency,
                form.price_method
            ),
        [
            groups,
            requiredEfficiency,
            form.price_method,
        ]
    );

    const visibleOperations = useMemo(
        () =>
            buildVisibleOperations(
                enrichedGroups,
                viewAllGroups,
                activeGroupIndex
            ),
        [
            enrichedGroups,
            viewAllGroups,
            activeGroupIndex,
        ]
    );

    const dashboard = useMemo(
        () =>
            buildOperationClusterDashboard(
                enrichedGroups
            ),
        [enrichedGroups]
    );

    const filteredGsdOptions = useMemo(() => {
        const keyword =
            gsdSearch
                .trim()
                .toLowerCase();

        if (!keyword) {
            return gsdOptions;
        }

        return gsdOptions.filter(
            (item) =>
                String(
                    item.operation_code || ''
                )
                    .toLowerCase()
                    .includes(keyword) ||
                String(
                    item.operation_name || ''
                )
                    .toLowerCase()
                    .includes(keyword) ||
                String(
                    item.machine_name || ''
                )
                    .toLowerCase()
                    .includes(keyword) ||
                String(
                    item.machine_code || ''
                )
                    .toLowerCase()
                    .includes(keyword)
        );
    }, [
        gsdOptions,
        gsdSearch,
    ]);

    const checkedGsds = useMemo(
        () =>
            gsdOptions.filter(
                (item) =>
                    checkedGsdIds.includes(
                        item.gsd_analysis_id
                    )
            ),
        [
            gsdOptions,
            checkedGsdIds,
        ]
    );

    const resetGsdSelection = () => {
        setIsGsdPopupOpen(false);
        setGsdSearch('');
        setCheckedGsdIds([]);
        setGsdActionsMap({});
        setLoadingActionIds([]);
    };

    const resetCreateData = () => {
        clearOperationClusterDraft();

        setForm({
            ...DEFAULT_OPERATION_CLUSTER_FORM,
        });
        setGroups([]);

        setActiveGroupIndex(0);
        setViewAllGroups(false);

        setCheckedGsdIds([]);
        setGsdActionsMap({});
        setLoadingActionIds([]);
        setGsdSearch('');
        setIsGsdPopupOpen(false);

        setCoefficientPopup(null);
        setCoefficientSearch('');
        setGroupContextMenu(null);

        setIsGroupOverviewOpen(false);

        setEditingId(null);
    };

    const handleOpenCreateModal = () => {
        resetCreateData();
        setFormMode('create');
        setIsCreateModalOpen(true);
    };

    const handleCancelEditor = () => {
        const ok = window.confirm(
            'Bạn có chắc muốn hủy dữ liệu đang nhập không?'
        );

        if (!ok) {
            return;
        }

        resetCreateData();
        setIsCreateModalOpen(false);
    };

    const closeEditorAfterSave = () => {
        resetCreateData();
        setIsCreateModalOpen(false);
    };

    const fillEditFormFromDetail = (
        detail: OperationClusterDetail
    ) => {
        const mapped =
            mapOperationClusterDetailToEditor(
                detail
            );

        setForm(mapped.form);
        setGroups(mapped.groups);

        setActiveGroupIndex(0);
        setViewAllGroups(false);

        setCheckedGsdIds([]);
        setGsdActionsMap({});
        setLoadingActionIds([]);
        setGsdSearch('');
        setIsGsdPopupOpen(false);

        setCoefficientPopup(null);
        setCoefficientSearch('');
        setGroupContextMenu(null);
        setIsGroupOverviewOpen(false);
    };

    const openEditFromDetail = (
        detail: OperationClusterDetail,
        id: number
    ) => {
        fillEditFormFromDetail(detail);
        setEditingId(id);
        setFormMode('edit');
        setIsCreateModalOpen(true);
    };

    const openCopyFromDetail = (
        detail: OperationClusterDetail
    ) => {
        fillEditFormFromDetail(detail);

        const oldDocumentCode =
            detail.header.document_code || '';

        setForm((prev) => ({
            ...prev,
            document_code:
                `${oldDocumentCode}_COPY`,
            note:
                prev.note ||
                `Sao chép từ ${oldDocumentCode}`,
        }));

        setEditingId(null);
        setFormMode('copy');
        setIsCreateModalOpen(true);
    };

    const handleDocumentCodeChange = (
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            document_code: value,
        }));
    };

    const handleWorkIdChange = (
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            work_id: value,
        }));
    };

    const handleProductCategoryIdChange = (
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            product_category_id: value,
        }));
    };

    const handleProductCategoryGroupIdChange = (
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            product_category_group_id: value,
        }));
    };

    const handleStatusChange = (
        value: number
    ) => {
        setForm((prev) => ({
            ...prev,
            status_id: value,
        }));
    };

    const handlePriceMethodChange = (
        value: OperationClusterPriceMethod
    ) => {
        setForm((prev) => ({
            ...prev,
            price_method: value,
        }));
    };

    const handleNoteChange = (
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            note: value,
        }));
    };

    const handleChangeHeaderEfficiency = (
        value: string
    ) => {
        const nextValue =
            normalizeDecimalInput(
                value
            );

        if (nextValue === null) {
            return;
        }

        setForm((prev) => ({
            ...prev,
            required_efficiency:
                nextValue,
        }));

        setGroups((prev) =>
            prev.map((group) => ({
                ...group,
                operations:
                    group.operations.map(
                        (operation) => ({
                            ...operation,
                            required_efficiency:
                                nextValue,
                        })
                    ),
            }))
        );
    };

    const handleAddGroup = () => {
        setGroups((prev) => {
            const insertIndex =
                prev.length === 0
                    ? 0
                    : activeGroupIndex + 1;

            const next = [...prev];

            next.splice(
                insertIndex,
                0,
                createEmptyGroup()
            );

            setActiveGroupIndex(
                insertIndex
            );
            setViewAllGroups(false);

            return renumberGroups(
                next
            );
        });
    };

    const handleSelectGroup = (
        groupIndex: number
    ) => {
        setActiveGroupIndex(
            groupIndex
        );
        setViewAllGroups(false);
    };

    const handleOpenGroupContextMenu = (
        event: MouseEvent,
        groupIndex: number
    ) => {
        event.preventDefault();

        setActiveGroupIndex(
            groupIndex
        );
        setViewAllGroups(false);

        setGroupContextMenu({
            x: event.clientX,
            y: event.clientY,
            groupIndex,
        });
    };

    const handleCloseGroupContextMenu = () => {
        setGroupContextMenu(null);
    };

    const handleInsertGroupBelow = (
        groupIndex: number
    ) => {
        setGroups((prev) => {
            const next = [...prev];

            next.splice(
                groupIndex + 1,
                0,
                createEmptyGroup()
            );

            setActiveGroupIndex(
                groupIndex + 1
            );
            setViewAllGroups(false);

            return renumberGroups(
                next
            );
        });

        setGroupContextMenu(null);
    };

    const handleDeleteGroup = (
        groupIndex: number
    ) => {
        const group =
            groups[groupIndex];

        if (!group) {
            return;
        }

        if (
            group.operations.length > 0
        ) {
            const ok = window.confirm(
                `Cụm này đang có ${group.operations.length} công đoạn. Bạn có chắc muốn xóa không?`
            );

            if (!ok) {
                return;
            }
        }

        const next = renumberGroups(
            groups.filter(
                (_, index) =>
                    index !== groupIndex
            )
        );

        setGroups(next);

        if (next.length === 0) {
            setActiveGroupIndex(0);
        } else if (
            activeGroupIndex >=
            next.length
        ) {
            setActiveGroupIndex(
                next.length - 1
            );
        } else if (
            activeGroupIndex >
            groupIndex
        ) {
            setActiveGroupIndex(
                activeGroupIndex - 1
            );
        } else {
            setActiveGroupIndex(
                Math.max(
                    0,
                    activeGroupIndex
                )
            );
        }

        setGroupContextMenu(null);
    };

    const handleChangeGroupName = (
        groupIndex: number,
        value: string
    ) => {
        setGroups((prev) =>
            prev.map(
                (group, index) =>
                    index === groupIndex
                        ? {
                              ...group,
                              cluster_name:
                                  value,
                          }
                        : group
            )
        );
    };

    const handleOpenGroupOverview = () => {
        if (
            enrichedGroups.length === 0
        ) {
            alert(
                'Chưa có cụm để xem tổng quan'
            );
            return;
        }

        setIsGroupOverviewOpen(true);
    };

    const handleCloseGroupOverview = () => {
        setIsGroupOverviewOpen(false);
    };

    const handleOpenGsdPopup = () => {
        if (groups.length === 0) {
            alert(
                'Vui lòng thêm cụm trước khi chọn công đoạn GSD'
            );
            return;
        }

        const activeGroup =
            groups[activeGroupIndex];

        if (!activeGroup) {
            alert(
                'Vui lòng chọn một cụm trước khi chọn công đoạn GSD'
            );
            return;
        }

        if (
            !activeGroup.cluster_name ||
            !activeGroup.cluster_name.trim()
        ) {
            alert(
                'Vui lòng nhập tên cụm trước khi chọn công đoạn GSD'
            );
            return;
        }

        if (viewAllGroups) {
            alert(
                'Vui lòng tắt "Xem tất cả cụm" rồi chọn công đoạn cho cụm đang thao tác'
            );
            return;
        }

        setIsGsdPopupOpen(true);
        setGsdSearch('');
        setCheckedGsdIds([]);
        setGsdActionsMap({});
        setLoadingActionIds([]);
    };

    const handleCloseGsdPopup = () => {
        resetGsdSelection();
    };

    const loadActionsForGsd = async (
        gsd: GsdOption
    ) => {
        const id =
            gsd.gsd_analysis_id;

        if (gsdActionsMap[id]) {
            return;
        }

        setLoadingActionIds(
            (prev) =>
                prev.includes(id)
                    ? prev
                    : [...prev, id]
        );

        try {
            const actions =
                await loadGsdActions(
                    id
                );

            setGsdActionsMap(
                (prev) => ({
                    ...prev,
                    [id]: actions,
                })
            );
        } finally {
            setLoadingActionIds(
                (prev) =>
                    prev.filter(
                        (item) =>
                            item !== id
                    )
            );
        }
    };

    const handleToggleGsd = async (
        gsd: GsdOption
    ) => {
        const id =
            gsd.gsd_analysis_id;

        const existed =
            checkedGsdIds.includes(id);

        if (existed) {
            setCheckedGsdIds(
                (prev) =>
                    prev.filter(
                        (item) =>
                            item !== id
                    )
            );

            setGsdActionsMap(
                (prev) => {
                    const next = {
                        ...prev,
                    };

                    delete next[id];

                    return next;
                }
            );

            return;
        }

        setCheckedGsdIds(
            (prev) => [
                ...prev,
                id,
            ]
        );

        await loadActionsForGsd(
            gsd
        );
    };

    const handleConfirmSelectGsd = () => {
        if (
            checkedGsdIds.length === 0
        ) {
            alert(
                'Vui lòng chọn ít nhất một công đoạn GSD'
            );
            return;
        }

        const selectedGsds =
            gsdOptions.filter(
                (item) =>
                    checkedGsdIds.includes(
                        item.gsd_analysis_id
                    )
            );

        setGroups((prev) =>
            prev.map(
                (
                    group,
                    groupIndex
                ) => {
                    if (
                        groupIndex !==
                        activeGroupIndex
                    ) {
                        return group;
                    }

                    const newOperations:
                        OperationClusterOperationPayload[] =
                        selectedGsds.map(
                            (
                                gsd,
                                index
                            ) => ({
                                line_no:
                                    group
                                        .operations
                                        .length +
                                    index +
                                    1,
                                line_balance_no:
                                    null,

                                gsd_analysis_id:
                                    gsd.gsd_analysis_id,
                                operation_code:
                                    gsd.operation_code,
                                operation_name:
                                    gsd.operation_name,

                                skill_grade_id:
                                    gsd.skill_grade_id,
                                skill_level:
                                    gsd.skill_level,

                                machine_equipment_id:
                                    gsd.machine_equipment_id,
                                machine_name:
                                    gsd.machine_name,
                                machine_code:
                                    gsd.machine_code,
                                code_mmtb:
                                    gsd.code_mmtb,

                                sam_gsd:
                                    toNumber(
                                        gsd.sam_gsd,
                                        0
                                    ),
                                salary_coefficient:
                                    gsd.salary_coefficient,
                                manpower: 1,
                                required_efficiency:
                                    requiredEfficiency,

                                total_action_seconds:
                                    toNumber(
                                        gsd.total_action_seconds,
                                        0
                                    ),
                                total_actions:
                                    toNumber(
                                        gsd.total_actions,
                                        0
                                    ),
                                status_id: 0,
                            })
                        );

                    return {
                        ...group,
                        operations: [
                            ...group.operations,
                            ...newOperations,
                        ],
                    };
                }
            )
        );

        handleCloseGsdPopup();
    };

    const handleOpenCoefficientPopup = (
        event: MouseEvent,
        operationIndex: number
    ) => {
        event.stopPropagation();

        if (viewAllGroups) {
            alert(
                'Vui lòng tắt "Xem tất cả cụm" rồi chọn hệ số trong cụm đang thao tác'
            );
            return;
        }

        setCoefficientPopup({
            x: event.clientX,
            y: event.clientY,
            groupIndex:
                activeGroupIndex,
            operationIndex,
        });

        setCoefficientSearch('');
    };

    const handleSelectSalaryCoefficient = (
        coefficient: number,
        skillGradeId: number
    ) => {
        if (!coefficientPopup) {
            return;
        }

        setGroups((prev) =>
            prev.map(
                (
                    group,
                    groupIndex
                ) => {
                    if (
                        groupIndex !==
                        coefficientPopup.groupIndex
                    ) {
                        return group;
                    }

                    return {
                        ...group,
                        operations:
                            group.operations.map(
                                (
                                    operation,
                                    operationIndex
                                ) =>
                                    operationIndex ===
                                    coefficientPopup.operationIndex
                                        ? {
                                              ...operation,
                                              salary_coefficient:
                                                  coefficient,
                                              skill_grade_id:
                                                  skillGradeId,
                                          }
                                        : operation
                            ),
                    };
                }
            )
        );

        setCoefficientPopup(null);
    };

    const handleCloseCoefficientPopup = () => {
        setCoefficientPopup(null);
    };

    const handleRemoveOperation = (
        operationIndex: number
    ) => {
        if (viewAllGroups) {
            alert(
                'Vui lòng tắt View ALL Cụm rồi xóa trong cụm đang chọn'
            );
            return;
        }

        setGroups((prev) =>
            prev.map(
                (
                    group,
                    groupIndex
                ) => {
                    if (
                        groupIndex !==
                        activeGroupIndex
                    ) {
                        return group;
                    }

                    return {
                        ...group,
                        operations:
                            group.operations
                                .filter(
                                    (
                                        _,
                                        index
                                    ) =>
                                        index !==
                                        operationIndex
                                )
                                .map(
                                    (
                                        operation,
                                        index
                                    ) => ({
                                        ...operation,
                                        line_no:
                                            index +
                                            1,
                                    })
                                ),
                    };
                }
            )
        );
    };

    const handleChangeLineBalanceNo = (
        operationIndex: number,
        value: string
    ) => {
        if (viewAllGroups) {
            return;
        }

        setGroups((prev) =>
            prev.map(
                (
                    group,
                    groupIndex
                ) => {
                    if (
                        groupIndex !==
                        activeGroupIndex
                    ) {
                        return group;
                    }

                    return {
                        ...group,
                        operations:
                            group.operations.map(
                                (
                                    operation,
                                    index
                                ) =>
                                    index ===
                                    operationIndex
                                        ? {
                                              ...operation,
                                              line_balance_no:
                                                  value
                                                      ? Number(
                                                            value
                                                        )
                                                      : null,
                                          }
                                        : operation
                            ),
                    };
                }
            )
        );
    };

    const handleChangeManpower = (
        operationIndex: number,
        value: string
    ) => {
        if (viewAllGroups) {
            return;
        }

        setGroups((prev) =>
            prev.map(
                (
                    group,
                    groupIndex
                ) => {
                    if (
                        groupIndex !==
                        activeGroupIndex
                    ) {
                        return group;
                    }

                    return {
                        ...group,
                        operations:
                            group.operations.map(
                                (
                                    operation,
                                    index
                                ) =>
                                    index ===
                                    operationIndex
                                        ? {
                                              ...operation,
                                              manpower:
                                                  value
                                                      ? Number(
                                                            value
                                                        )
                                                      : null,
                                          }
                                        : operation
                            ),
                    };
                }
            )
        );
    };

    const handleChangeOperationEfficiency = (
        operationIndex: number,
        value: string
    ) => {
        if (viewAllGroups) {
            return;
        }

        const nextValue =
            normalizeDecimalInput(
                value
            );

        if (nextValue === null) {
            return;
        }

        setGroups((prev) =>
            prev.map(
                (
                    group,
                    groupIndex
                ) => {
                    if (
                        groupIndex !==
                        activeGroupIndex
                    ) {
                        return group;
                    }

                    return {
                        ...group,
                        operations:
                            group.operations.map(
                                (
                                    operation,
                                    index
                                ) =>
                                    index ===
                                    operationIndex
                                        ? {
                                              ...operation,
                                              required_efficiency:
                                                  nextValue,
                                          }
                                        : operation
                            ),
                    };
                }
            )
        );
    };

    return {
        isCreateModalOpen,
        formMode,
        editingId,

        form,
        groups,
        activeGroupIndex,
        viewAllGroups,

        requiredEfficiency,
        enrichedGroups,
        visibleOperations,
        dashboard,

        groupContextMenu,
        isGroupOverviewOpen,

        isGsdPopupOpen,
        gsdSearch,
        checkedGsdIds,
        gsdActionsMap,
        loadingActionIds,
        filteredGsdOptions,
        checkedGsds,

        coefficientPopup,
        coefficientSearch,

        handleOpenCreateModal,
        handleCancelEditor,
        closeEditorAfterSave,
        openEditFromDetail,
        openCopyFromDetail,

        handleDocumentCodeChange,
        handleWorkIdChange,
        handleProductCategoryIdChange,
        handleProductCategoryGroupIdChange,
        handleChangeHeaderEfficiency,
        handleStatusChange,
        handlePriceMethodChange,
        handleNoteChange,

        handleAddGroup,
        handleSelectGroup,
        handleOpenGroupContextMenu,
        handleCloseGroupContextMenu,
        handleInsertGroupBelow,
        handleDeleteGroup,
        handleChangeGroupName,

        handleOpenGroupOverview,
        handleCloseGroupOverview,

        setGsdSearch,
        handleOpenGsdPopup,
        handleCloseGsdPopup,
        handleToggleGsd,
        handleConfirmSelectGsd,

        setCoefficientSearch,
        handleOpenCoefficientPopup,
        handleSelectSalaryCoefficient,
        handleCloseCoefficientPopup,

        handleRemoveOperation,
        handleChangeLineBalanceNo,
        handleChangeManpower,
        handleChangeOperationEfficiency,
    };
}

export type OperationClusterEditorController = ReturnType<
    typeof useOperationClusterEditor
>;