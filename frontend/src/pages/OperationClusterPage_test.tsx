import { useEffect, useMemo, useState } from 'react';
import {
    CreateOperationClusterPayload,
    GsdOption,
    OperationClusterGroupPayload,
    OperationClusterOperationPayload,
    GsdActionDetail,
} from '../types';
import { useOperationClusters } from '../hooks/useOperationClusters';
import { useWorks } from '../hooks/useWorks';
import { useProductCates } from '../hooks/useProductCate';
import { useProductCateGroups } from '../hooks/useProductCateGroup';
import { useSalaryCoefficients } from '../hooks/useSalaryCoefficient';


// form thông tin chứng từ
type FormState = {
    document_code: string;
    work_id: string;
    product_category_id: string;
    product_category_group_id: string;
    required_efficiency: string;
    price_method: 'GSD' | 'ADJUSTED';
    status_id: number;
    note: string;
};

function toNumber(value: unknown, defaultValue = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : defaultValue;
}

function calcAdjustedSam(samGsd: number, requiredEfficiency: number) {
    if (!requiredEfficiency || requiredEfficiency <= 0) return samGsd;
    return samGsd / requiredEfficiency;
}

function calcStandardPrice(
    samGsd: number,
    adjustedSam: number,
    salaryCoefficient: number,
    priceMethod: 'GSD' | 'ADJUSTED'
) {
    return priceMethod === 'ADJUSTED'
        ? adjustedSam * salaryCoefficient
        : samGsd * salaryCoefficient;
}


// -------------------------------- bản nháp ----------------------------------------
const OPERATION_CLUSTER_DRAFT_KEY = 'operation_cluster_draft_v1';

const DEFAULT_FORM: FormState = {
    document_code: '',
    work_id: '',
    product_category_id: '',
    product_category_group_id: '',
    required_efficiency: '0.8',
    price_method: 'GSD',
    status_id: 0,
    note: '',
};

type OperationClusterDraft = {
    form: FormState;
    groups: OperationClusterGroupPayload[];
    activeGroupIndex: number;
    viewAllGroups: boolean;
};

const readOperationClusterDraft = (): OperationClusterDraft | null => {
    try {
        const raw = localStorage.getItem(OPERATION_CLUSTER_DRAFT_KEY);

        if (!raw) return null;

        const parsed = JSON.parse(raw);

        return {
            form: {
                ...DEFAULT_FORM,
                ...(parsed.form || {}),
            },
            groups: Array.isArray(parsed.groups) ? parsed.groups : [],
            activeGroupIndex: Number(parsed.activeGroupIndex || 0),
            viewAllGroups: Boolean(parsed.viewAllGroups),
        };
    } catch {
        return null;
    }
};


// -------------------------------- bản nháp ----------------------------------------
export default function OperationClusterPage_test() {
    const initialDraft = useMemo(() => readOperationClusterDraft(), []);

    const {
        items,
        loading,
        gsdOptions,
        saving,
        createItem,
        copyItem,
        updateItem,
        loadItems,
        loadDetail,
        selectedDetail,
        setSelectedDetail,
        loadGsdActions,
    } = useOperationClusters();

    useEffect(() => {
        loadItems();
    }, []);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // load chi tiết thác tác của một công đoạn khi click vào tên công đoạn
    // ----------------------------------------------------------------------
    const [operationActionPopup, setOperationActionPopup] = useState<{
        operationName: string;
        operationCode?: string | null;
        gsdAnalysisId: number;
    } | null>(null);

    const [operationActions, setOperationActions] = useState<GsdActionDetail[]>([]);
    const [loadingOperationActions, setLoadingOperationActions] = useState(false);
    const [isSavedDetailOpen, setIsSavedDetailOpen] = useState(false);
    // ----------------------------------------------------------------------

    const { works, loading: worksLoading } = useWorks();
    const { productCates, loading: productCatesLoading } = useProductCates();
    const { productCateGroups, loading: productCateGroupsLoading } = useProductCateGroups();

    const [activeGroupIndex, setActiveGroupIndex] = useState(
        initialDraft?.activeGroupIndex || 0
    );

    const [viewAllGroups, setViewAllGroups] = useState(
        initialDraft?.viewAllGroups || false
    );
    const [selectedGsdId, setSelectedGsdId] = useState('');

    const [isGsdPopupOpen, setIsGsdPopupOpen] = useState(false);
    const [gsdSearch, setGsdSearch] = useState('');
    const [checkedGsdIds, setCheckedGsdIds] = useState<number[]>([]);
    const [gsdActionsMap, setGsdActionsMap] = useState<
        Record<number, GsdActionDetail[]>
    >({});

    const [loadingActionIds, setLoadingActionIds] = useState<number[]>([]);

    const [isGroupOverviewOpen, setIsGroupOverviewOpen] = useState(false);
    const [overviewGroupIndex, setOverviewGroupIndex] = useState(0);

    type FormMode = 'create' | 'edit' | 'copy';

    const [formMode, setFormMode] = useState<FormMode>('create');

    // edit
    const [selectedSavedId, setSelectedSavedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    const resetCreateData = () => {
        localStorage.removeItem(OPERATION_CLUSTER_DRAFT_KEY);

        setForm({ ...DEFAULT_FORM });
        setGroups([]);

        setActiveGroupIndex(0);
        setSelectedGsdId('');
        setViewAllGroups(false);

        setCheckedGsdIds([]);
        setGsdActionsMap({});
        setLoadingActionIds([]);

        setCoefficientPopup(null);
        setGroupContextMenu(null);

        setIsGroupOverviewOpen(false);
        setOverviewGroupIndex(0);

        setEditingId(null);
    };

    const handleOpenCreateModal = () => {
        resetCreateData();
        setEditingId(null);
        setFormMode('create');
        setIsCreateModalOpen(true);
    };

    // load chi tiết thác tác của một công đoạn khi click vào tên công đoạn
    // ----------------------------------------------------------------------
    const handleOpenOperationActions = async (operation: any) => {
        const gsdAnalysisId = Number(operation.gsd_analysis_id || 0);

        if (!gsdAnalysisId) {
            alert('Công đoạn này chưa có mã phân tích GSD để xem thao tác');
            return;
        }

        setOperationActionPopup({
            operationName: operation.operation_name,
            operationCode: operation.operation_code,
            gsdAnalysisId,
        });

        setOperationActions([]);
        setLoadingOperationActions(true);

        try {
            const actions = await loadGsdActions(gsdAnalysisId);
            setOperationActions(actions);
        } catch (error) {
            console.error('Load thao tác công đoạn lỗi:', error);
            alert(
                error instanceof Error
                    ? error.message
                    : 'Không lấy được danh sách thao tác'
            );
        } finally {
            setLoadingOperationActions(false);
        }
    };

    const handleOpenGroupOverview = () => {
        if (enrichedGroups.length === 0) {
            alert('Chưa có cụm để xem tổng quan');
            return;
        }

        setIsGroupOverviewOpen(true);
    };

    // ----------------------------------------------------------------------


    // các hàm xử lý pop up (danh sách công đoạn)
    // -------------------------------------------------------------------------------------------
    const handleOpenGsdPopup = () => {

        if (groups.length === 0) {
            alert('Vui lòng thêm cụm trước khi chọn công đoạn GSD');
            return;
        }

        const activeGroup = groups[activeGroupIndex];

        if (!groups[activeGroupIndex]) {
            alert('Vui lòng chọn một cụm trước khi chọn công đoạn GSD');
            return;
        }

        if (!activeGroup.cluster_name || !activeGroup.cluster_name.trim()) {
            alert('Vui lòng nhập tên cụm trước khi chọn công đoạn GSD');
            return;
        }

        if (viewAllGroups) {
            alert('Vui lòng tắt "Xem tất cả cụm" rồi chọn công đoạn cho cụm đang thao tác');
            return;
        }

        setIsGsdPopupOpen(true);
        setGsdSearch('');
        setCheckedGsdIds([]);
        setGsdActionsMap({});
        setLoadingActionIds([]);
    };

    const handleCloseGsdPopup = () => {
        setIsGsdPopupOpen(false);
        setGsdSearch('');
        setCheckedGsdIds([]);
        setGsdActionsMap({});
        setLoadingActionIds([]);
    };

    const handleToggleGsd = async (gsd: GsdOption) => {
        const id = gsd.gsd_analysis_id;
        const existed = checkedGsdIds.includes(id);

        if (existed) {
            setCheckedGsdIds((prev) => prev.filter((item) => item !== id));

            setGsdActionsMap((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });

            return;
        }

        setCheckedGsdIds((prev) => [...prev, id]);

        await loadActionsForGsd(gsd);
    };



    const handleConfirmSelectGsd = () => {
        if (checkedGsdIds.length === 0) {
            alert('Vui lòng chọn ít nhất một công đoạn GSD');
            return;
        }

        const selectedGsds = gsdOptions.filter((item) =>
            checkedGsdIds.includes(item.gsd_analysis_id)
        );

        setGroups((prev) =>
            prev.map((group, groupIndex) => {
                if (groupIndex !== activeGroupIndex) return group;

                const newOperations: OperationClusterOperationPayload[] = selectedGsds.map(
                    (gsd, index) => ({
                        line_no: group.operations.length + index + 1,
                        line_balance_no: null,

                        gsd_analysis_id: gsd.gsd_analysis_id,
                        operation_code: gsd.operation_code,
                        operation_name: gsd.operation_name,

                        skill_grade_id: gsd.skill_grade_id,  // bậc thợ trong danh mục
                        skill_level: gsd.skill_level,

                        machine_equipment_id: gsd.machine_equipment_id,
                        machine_name: gsd.machine_name,
                        machine_code: gsd.machine_code,
                        code_mmtb: gsd.code_mmtb,

                        sam_gsd: toNumber(gsd.sam_gsd, 0),
                        salary_coefficient: 0,
                        manpower: 1,
                        required_efficiency: requiredEfficiency,

                        total_action_seconds: toNumber(gsd.total_action_seconds, 0),
                        total_actions: toNumber(gsd.total_actions, 0),
                        status_id: 0,
                    })
                );

                return {
                    ...group,
                    operations: [...group.operations, ...newOperations],
                };
            })
        );

        handleCloseGsdPopup();
    };

    const filteredGsdOptions = useMemo(() => {
        const keyword = gsdSearch.trim().toLowerCase();

        if (!keyword) return gsdOptions;

        return gsdOptions.filter((item) => {
            return (
                String(item.operation_code || '').toLowerCase().includes(keyword) ||
                String(item.operation_name || '').toLowerCase().includes(keyword) ||
                String(item.machine_name || '').toLowerCase().includes(keyword) ||
                String(item.machine_code || '').toLowerCase().includes(keyword)
            );
        });
    }, [gsdOptions, gsdSearch]);


    const checkedGsds = useMemo(() => {
        return gsdOptions.filter((item) =>
            checkedGsdIds.includes(item.gsd_analysis_id)
        );
    }, [gsdOptions, checkedGsdIds]);

    const loadActionsForGsd = async (gsd: GsdOption) => {
        const id = gsd.gsd_analysis_id;

        if (gsdActionsMap[id]) return;

        setLoadingActionIds((prev) =>
            prev.includes(id) ? prev : [...prev, id]
        );

        try {
            const actions = await loadGsdActions(id);

            setGsdActionsMap((prev) => ({
                ...prev,
                [id]: actions,
            }));
        } finally {
            setLoadingActionIds((prev) => prev.filter((item) => item !== id));
        }
    };
    //---------------------------------------------------------------------------------------------

    // const [form, setForm] = useState<FormState>({
    //     document_code: '',
    //     work_id: '',
    //     product_category_id: '',
    //     product_category_group_id: '',
    //     required_efficiency: '0.8',
    //     price_method: 'GSD',
    //     status_id: 0,
    //     note: '',
    // });

    const [form, setForm] = useState<FormState>(
        initialDraft?.form || DEFAULT_FORM
    );

    const [groups, setGroups] = useState<OperationClusterGroupPayload[]>(
        initialDraft?.groups || []
    );

    useEffect(() => {
        const draft: OperationClusterDraft = {
            form,
            groups,
            activeGroupIndex,
            viewAllGroups,
        };

        localStorage.setItem(
            OPERATION_CLUSTER_DRAFT_KEY,
            JSON.stringify(draft)
        );
    }, [form, groups, activeGroupIndex, viewAllGroups]);

    type GroupContextMenuState = {
        x: number;
        y: number;
        groupIndex: number;
    } | null;

    const [groupContextMenu, setGroupContextMenu] =
        useState<GroupContextMenuState>(null);

    const createEmptyGroup = (): OperationClusterGroupPayload => ({
        line_no: 0,
        cluster_name: '',
        operations: [],
    });

    const renumberGroups = (items: OperationClusterGroupPayload[]) => {
        return items.map((group, index) => ({
            ...group,
            line_no: index + 1,
        }));
    };

    // ------------------------------------------- hệ số lương -----------------------
    const {
        salaryCoefficients,
        skillGrades,
        loading: salaryCoefficientLoading,
    } = useSalaryCoefficients();

    type CoefficientPopupState = {
        x: number;
        y: number;
        groupIndex: number;
        operationIndex: number;
    } | null;

    const [coefficientPopup, setCoefficientPopup] =
        useState<CoefficientPopupState>(null);

    const [coefficientSearch, setCoefficientSearch] = useState('');

    const getSkillLevelText = (levelId: number | null | undefined) => {
        const skill = skillGrades.find((item) => item.id === levelId);
        return skill ? skill.level : levelId || '-';
    };

    const handleOpenCoefficientPopup = (
        event: React.MouseEvent,
        operationIndex: number
    ) => {
        event.stopPropagation();

        if (viewAllGroups) {
            alert('Vui lòng tắt "Xem tất cả cụm" rồi chọn hệ số trong cụm đang thao tác');
            return;
        }

        setCoefficientPopup({
            x: event.clientX,
            y: event.clientY,
            groupIndex: activeGroupIndex,
            operationIndex,
        });

        setCoefficientSearch('');
    };


    const handleSelectSalaryCoefficient = (coefficient: number, skill_grade_id: number) => {
        if (!coefficientPopup) return;

        setGroups((prev) =>
            prev.map((group, groupIndex) => {
                if (groupIndex !== coefficientPopup.groupIndex) return group;

                return {
                    ...group,
                    operations: group.operations.map((op, operationIndex) => {
                        if (operationIndex !== coefficientPopup.operationIndex) return op;

                        return {
                            ...op,
                            salary_coefficient: coefficient,
                            skill_grade_id: skill_grade_id,
                        };
                    }),
                };
            })
        );

        setCoefficientPopup(null);
    };

    // ------------------------------------------- hệ số lương -----------------------

    const requiredEfficiency = toNumber(form.required_efficiency, 0);

    const enrichedGroups = useMemo(() => {
        return groups.map((group) => {
            const operations = group.operations.map((op) => {
                const samGsd = toNumber(op.sam_gsd, 0);
                const salaryCoefficient = toNumber(op.salary_coefficient, 0);

                // HS yêu cầu riêng theo từng công đoạn.
                // Nếu dòng chưa có thì dùng HS yêu cầu chung trên form.

                const rawEfficiency =
                    op.required_efficiency !== null &&
                        op.required_efficiency !== undefined &&
                        String(op.required_efficiency).trim() !== '' &&
                        String(op.required_efficiency).trim() !== '.'
                        ? op.required_efficiency
                        : form.required_efficiency;

                const operationEfficiency = toNumber(rawEfficiency, requiredEfficiency);

                const adjustedSam = calcAdjustedSam(samGsd, operationEfficiency);
                const utilizationRate = samGsd > 0 ? adjustedSam / samGsd : 0;

                const standardPrice = calcStandardPrice(
                    samGsd,
                    adjustedSam,
                    salaryCoefficient,
                    form.price_method
                );

                return {
                    ...op,
                    required_efficiency_preview: operationEfficiency,
                    adjusted_sam_preview: adjustedSam,
                    utilization_rate_preview: utilizationRate,
                    standard_price_preview: standardPrice,
                };
            });

            const tgcn = operations.reduce(
                (sum, op) => sum + toNumber(op.adjusted_sam_preview, 0),
                0
            );

            return {
                ...group,
                operations,
                tgcn,
            };
        });
    }, [groups, requiredEfficiency, form.price_method]);

    const visibleOperations = useMemo(() => {
        if (viewAllGroups) {
            return enrichedGroups.flatMap((group) =>
                group.operations.map((op) => ({
                    ...op,
                    cluster_name: group.cluster_name,
                    group_line_no_preview: group.line_no,
                }))
            );
        }

        const activeGroup = enrichedGroups[activeGroupIndex];

        if (!activeGroup) return [];

        return activeGroup.operations.map((op) => ({
            ...op,
            cluster_name: activeGroup.cluster_name,
            group_line_no_preview: activeGroup.line_no,
        }));
    }, [enrichedGroups, viewAllGroups, activeGroupIndex]);

    const dashboard = useMemo(() => {
        const allOperations = enrichedGroups.flatMap((group) => group.operations);

        const totalSamGsd = allOperations.reduce(
            (sum, op) => sum + toNumber(op.sam_gsd, 0),
            0
        );

        const totalAdjustedSam = allOperations.reduce(
            (sum, op) => sum + toNumber(op.adjusted_sam_preview, 0),
            0
        );

        const totalActions = allOperations.reduce(
            (sum, op) => sum + toNumber(op.total_actions, 0),
            0
        );

        const totalActionSeconds = allOperations.reduce(
            (sum, op) => sum + toNumber(op.total_action_seconds, 0),
            0
        );

        const totalManpower = allOperations.reduce(
            (sum, op) => sum + toNumber(op.manpower, 0),
            0
        );

        const activeGroups = enrichedGroups.filter((group) => group.operations.length > 0);
        const avgTgcn =
            activeGroups.length > 0
                ? activeGroups.reduce((sum, group) => sum + group.tgcn, 0) / activeGroups.length
                : 0;

        return {
            totalSamGsd,
            totalAdjustedSam,
            totalActions,
            totalActionSeconds,
            totalManpower,
            avgTgcn,
        };
    }, [enrichedGroups]);

    const handleAddGroup = () => {
        setGroups((prev) => {
            const insertIndex = prev.length === 0 ? 0 : activeGroupIndex + 1;

            const next = [...prev];
            next.splice(insertIndex, 0, createEmptyGroup());

            setActiveGroupIndex(insertIndex);
            setViewAllGroups(false);

            return renumberGroups(next);
        });
    };

    const handleOpenGroupContextMenu = (
        event: React.MouseEvent,
        groupIndex: number
    ) => {
        event.preventDefault();

        setActiveGroupIndex(groupIndex);
        setViewAllGroups(false);

        setGroupContextMenu({
            x: event.clientX,
            y: event.clientY,
            groupIndex,
        });
    };

    const handleInsertGroupBelow = (groupIndex: number) => {
        setGroups((prev) => {
            const next = [...prev];

            next.splice(groupIndex + 1, 0, createEmptyGroup());

            setActiveGroupIndex(groupIndex + 1);
            setViewAllGroups(false);

            return renumberGroups(next);
        });

        setGroupContextMenu(null);
    };

    const handleDeleteGroup = (groupIndex: number) => {
        const group = groups[groupIndex];

        if (!group) return;

        if (group.operations.length > 0) {
            const ok = window.confirm(
                `Cụm này đang có ${group.operations.length} công đoạn. Bạn có chắc muốn xóa không?`
            );

            if (!ok) return;
        }

        const next = renumberGroups(groups.filter((_, index) => index !== groupIndex));

        setGroups(next);

        if (next.length === 0) {
            setActiveGroupIndex(0);
        } else if (activeGroupIndex >= next.length) {
            setActiveGroupIndex(next.length - 1);
        } else if (activeGroupIndex > groupIndex) {
            setActiveGroupIndex(activeGroupIndex - 1);
        } else {
            setActiveGroupIndex(Math.max(0, activeGroupIndex));
        }

        setGroupContextMenu(null);
    };

    const handleChangeGroupName = (groupIndex: number, value: string) => {
        setGroups((prev) =>
            prev.map((group, index) =>
                index === groupIndex
                    ? {
                        ...group,
                        cluster_name: value,
                    }
                    : group
            )
        );
    };

    const handleAddSelectedGsd = () => {
        if (!selectedGsdId) {
            alert('Vui lòng chọn công đoạn từ GSD');
            return;
        }

        const gsd = gsdOptions.find(
            (item) => item.gsd_analysis_id === Number(selectedGsdId)
        );

        if (!gsd) {
            alert('Không tìm thấy công đoạn GSD');
            return;
        }

        setGroups((prev) =>
            prev.map((group, index) => {
                if (index !== activeGroupIndex) return group;

                const newOperation: OperationClusterOperationPayload = {
                    line_no: group.operations.length + 1,
                    line_balance_no: null,

                    gsd_analysis_id: gsd.gsd_analysis_id,
                    operation_code: gsd.operation_code,
                    operation_name: gsd.operation_name,

                    skill_level: gsd.skill_level,

                    machine_equipment_id: gsd.machine_equipment_id,
                    machine_name: gsd.machine_name,
                    machine_code: gsd.machine_code,
                    code_mmtb: gsd.code_mmtb,

                    sam_gsd: toNumber(gsd.sam_gsd, 0),
                    salary_coefficient: 0,
                    manpower: 1,
                    required_efficiency: requiredEfficiency,

                    total_action_seconds: toNumber(gsd.total_action_seconds, 0),
                    total_actions: toNumber(gsd.total_actions, 0),
                    status_id: 0,
                };

                return {
                    ...group,
                    operations: [...group.operations, newOperation],
                };
            })
        );

        setSelectedGsdId('');
    };

    const handleRemoveOperation = (operationIndex: number) => {
        if (viewAllGroups) {
            alert('Vui lòng tắt View ALL Cụm rồi xóa trong cụm đang chọn');
            return;
        }

        setGroups((prev) =>
            prev.map((group, groupIndex) => {
                if (groupIndex !== activeGroupIndex) return group;

                return {
                    ...group,
                    operations: group.operations
                        .filter((_, index) => index !== operationIndex)
                        .map((op, index) => ({
                            ...op,
                            line_no: index + 1,
                        })),
                };
            })
        );
    };

    const handleChangeLineBalanceNo = (operationIndex: number, value: string) => {
        if (viewAllGroups) return;

        setGroups((prev) =>
            prev.map((group, groupIndex) => {
                if (groupIndex !== activeGroupIndex) return group;

                return {
                    ...group,
                    operations: group.operations.map((op, index) =>
                        index === operationIndex
                            ? {
                                ...op,
                                line_balance_no: value ? Number(value) : null,
                            }
                            : op
                    ),
                };
            })
        );
    };

    const handleChangeManpower = (operationIndex: number, value: string) => {
        if (viewAllGroups) return;

        setGroups((prev) =>
            prev.map((group, groupIndex) => {
                if (groupIndex !== activeGroupIndex) return group;

                return {
                    ...group,
                    operations: group.operations.map((op, index) =>
                        index === operationIndex
                            ? {
                                ...op,
                                manpower: value ? Number(value) : null,
                            }
                            : op
                    ),
                };
            })
        );
    };

    const normalizeDecimalInput = (value: string) => {
        const nextValue = value.replace(',', '.');

        // Cho phép nhập: "", ".", "0.", "0.8", "1", "1.25"
        if (!/^\d*\.?\d*$/.test(nextValue)) {
            return null;
        }

        return nextValue;
    };

    /**
 * Sửa HS yêu cầu riêng cho từng công đoạn.
 * Ví dụ nhập 0.8 nghĩa là 80%.
 */
    /**
 * Sửa HS yêu cầu riêng cho từng công đoạn.
 * Lưu dạng string khi nhập để user gõ được số thập phân như 0.8, 0.75.
 */
    /**
 * Sửa HS yêu cầu riêng cho từng dòng công đoạn.
 * Chỉ ảnh hưởng đến dòng đang sửa, không đổi các dòng khác.
 */
    const handleChangeOperationEfficiency = (
        operationIndex: number,
        value: string
    ) => {
        if (viewAllGroups) return;

        const nextValue = normalizeDecimalInput(value);

        if (nextValue === null) return;

        setGroups((prev) =>
            prev.map((group, groupIndex) => {
                if (groupIndex !== activeGroupIndex) return group;

                return {
                    ...group,
                    operations: group.operations.map((op, index) =>
                        index === operationIndex
                            ? {
                                ...op,
                                required_efficiency: nextValue,
                            }
                            : op
                    ),
                };
            })
        );
    };

    /**
 * Sửa HS yêu cầu dùng chung ở phần Thông tin chứng từ.
 * Khi thay đổi giá trị này, toàn bộ công đoạn trong table cũng được cập nhật theo.
 */
    const handleChangeHeaderEfficiency = (value: string) => {
        const nextValue = normalizeDecimalInput(value);

        if (nextValue === null) return;

        setForm((prev) => ({
            ...prev,
            required_efficiency: nextValue,
        }));

        setGroups((prev) =>
            prev.map((group) => ({
                ...group,
                operations: group.operations.map((op) => ({
                    ...op,
                    required_efficiency: nextValue,
                })),
            }))
        );
    };

    const handleExportExcel = () => {
        alert('Do you have a boyfriend ?');
    }

    /**
 * Mở popup sửa chứng từ đã lưu.
 * User phải click chọn 1 dòng trước, sau đó bấm Sửa.
 */
    const handleEdit = async () => {
        if (!selectedSavedId) {
            alert('Vui lòng chọn một chứng từ cần sửa');
            return;
        }

        try {
            const detail = await loadDetail(selectedSavedId);

            if (!detail || !detail.header) {
                alert('Không lấy được dữ liệu chứng từ cần sửa');
                return;
            }

            fillEditFormFromDetail(detail);

            setEditingId(selectedSavedId);
            setFormMode('edit');
            setIsCreateModalOpen(true);
        } catch (error) {
            console.error('Load chứng từ để sửa lỗi:', error);

            alert(
                error instanceof Error
                    ? error.message
                    : 'Không mở được chứng từ để sửa'
            );
        }
    };

    const handleSave = async () => {
        try {
            if (!form.document_code.trim()) {
                alert('Vui lòng nhập mã chứng từ');
                return;
            }

            if (!form.work_id) {
                alert('Vui lòng chọn nhóm công việc');
                return;
            }

            if (!form.product_category_id) {
                alert('Vui lòng chọn chủng loại');
                return;
            }

            if (!form.product_category_group_id) {
                alert('Vui lòng chọn nhóm chủng loại');
                return;
            }

            const validGroups = groups
                .filter((group) => group.cluster_name.trim())
                .map((group, groupIndex) => ({
                    ...group,
                    line_no: groupIndex + 1,
                    operations: group.operations.map((op, opIndex) => ({
                        ...op,
                        line_no: opIndex + 1,
                        required_efficiency:
                            toNumber(op.required_efficiency, requiredEfficiency) || null,
                    })),
                }));

            const hasOperation = validGroups.some(
                (group) => group.operations.length > 0
            );

            if (!hasOperation) {
                alert('Vui lòng chọn ít nhất một công đoạn GSD');
                return;
            }

            const payload: CreateOperationClusterPayload = {
                document_code: form.document_code.trim(),
                work_id: Number(form.work_id),
                product_category_id: Number(form.product_category_id),
                product_category_group_id: Number(form.product_category_group_id),
                required_efficiency: requiredEfficiency || null,
                price_method: form.price_method,
                note: form.note || null,
                status_id: form.status_id,
                groups: validGroups,
            };

            // if (editingId) {
            //     await updateItem(editingId, payload);
            // } else {
            //     await createItem(payload);
            // }

            const currentMode = formMode;

            if (currentMode === 'edit') {
                if (!editingId) {
                    alert('Không xác định được chứng từ cần cập nhật');
                    return;
                }

                await updateItem(editingId, payload);
            } else if (currentMode === 'copy') {
                await copyItem(payload);
            } else {
                await createItem(payload);
            }

            await loadItems();

            resetCreateData();
            setIsCreateModalOpen(false);
            setSelectedSavedId(null);

            setIsSavedDetailOpen(false);
            setSelectedDetail(null);

            alert(editingId ? 'Cập nhật chứng từ thành công' : 'Lưu chứng từ thành công');
        } catch (error) {
            console.error('Lưu kho cụm lỗi:', error);

            alert(
                error instanceof Error
                    ? error.message
                    : 'Không lưu được chứng từ'
            );
        }
    };


    /**
 * Mở popup sao chép chứng từ.
 * Load detail chứng từ đang chọn, đổ vào form, nhưng không giữ editingId.
 */
    const handleCopy = async () => {
        if (!selectedSavedId) {
            alert('Vui lòng chọn một chứng từ cần sao chép');
            return;
        }

        try {
            const detail = await loadDetail(selectedSavedId);

            if (!detail || !detail.header) {
                alert('Không lấy được dữ liệu chứng từ cần sao chép');
                return;
            }

            fillEditFormFromDetail(detail);

            const oldDocumentCode = detail.header.document_code || '';

            // Gợi ý mã mới. User có thể sửa lại trước khi lưu.
            setForm((prev) => ({
                ...prev,
                document_code: `${oldDocumentCode}_COPY`,
                note: prev.note || `Sao chép từ ${oldDocumentCode}`,
            }));

            setEditingId(null);
            setFormMode('copy');
            setIsCreateModalOpen(true);
        } catch (error) {
            console.error('Load chứng từ để sao chép lỗi:', error);

            alert(
                error instanceof Error
                    ? error.message
                    : 'Không mở được chứng từ để sao chép'
            );
        }
    };

    const handleViewSavedDocument = async (id: number) => {
        try {
            setSelectedDetail(null);

            const detail = await loadDetail(id);

            console.log('Chi tiết chứng từ đã load:', detail);

            if (!detail || !detail.header) {
                alert('Không lấy được chi tiết chứng từ');
                return;
            }

            setSelectedDetail(detail);
            setIsSavedDetailOpen(true);
        } catch (error) {
            console.error('Không xem được chi tiết:', error);

            alert(
                error instanceof Error
                    ? error.message
                    : 'Không xem được chi tiết chứng từ'
            );
        }
    };

    const handleCancel = () => {
        const ok = window.confirm('Bạn có chắc muốn hủy dữ liệu đang nhập không?');
        if (!ok) return;

        resetCreateData();
        setIsCreateModalOpen(false);
    };


    /**
 * Đổ dữ liệu chi tiết chứng từ đã lưu vào form khai báo.
 * Dùng khi bấm nút Sửa.
 */
    const fillEditFormFromDetail = (detail: any) => {
        const header = detail.header;

        setForm({
            document_code: header.document_code || '',
            work_id: header.work_id ? String(header.work_id) : '',
            product_category_id: header.product_category_id
                ? String(header.product_category_id)
                : '',
            product_category_group_id: header.product_category_group_id
                ? String(header.product_category_group_id)
                : '',
            required_efficiency:
                header.required_efficiency !== null &&
                    header.required_efficiency !== undefined
                    ? String(header.required_efficiency)
                    : '0.8',
            price_method: header.price_method === 'ADJUSTED' ? 'ADJUSTED' : 'GSD',
            status_id: Number(header.status_id ?? 0),
            note: header.note || '',
        });

        const detailGroups = detail.groups || [];
        const detailOperations = detail.operations || [];

        const mappedGroups: OperationClusterGroupPayload[] = detailGroups.map(
            (group: any, groupIndex: number) => {
                const operations = detailOperations
                    .filter((op: any) => Number(op.group_id) === Number(group.id))
                    .sort((a: any, b: any) => {
                        const aLine = Number(a.line_no || 0);
                        const bLine = Number(b.line_no || 0);
                        return aLine - bLine;
                    })
                    .map((op: any, opIndex: number) => ({
                        line_no: opIndex + 1,
                        line_balance_no: op.line_balance_no ?? null,

                        gsd_analysis_id: op.gsd_analysis_id ?? null,
                        operation_code: op.operation_code || op.analysis_no || null,
                        operation_name: op.operation_name || op.gsd_operation_name || '',

                        skill_grade_id: op.skill_grade_id ?? null,
                        skill_level: op.skill_level ?? op.skill_level_master ?? null,

                        machine_equipment_id: op.machine_equipment_id ?? null,
                        machine_name: op.machine_name || op.machine_name_master || null,
                        machine_code: op.machine_code || op.machine_code_master || null,

                        sam_gsd: Number(op.sam_gsd || 0),
                        salary_coefficient: Number(op.salary_coefficient || 0),
                        manpower:
                            op.manpower !== null && op.manpower !== undefined
                                ? Number(op.manpower)
                                : 1,

                        standard_price: Number(op.standard_price || 0),
                        required_efficiency:
                            op.required_efficiency !== null &&
                                op.required_efficiency !== undefined
                                ? String(op.required_efficiency)
                                : null,

                        adjusted_sam: Number(op.adjusted_sam || 0),
                        utilization_rate:
                            op.utilization_rate !== null && op.utilization_rate !== undefined
                                ? Number(op.utilization_rate)
                                : null,

                        total_action_seconds: Number(op.total_action_seconds || 0),
                        total_actions: Number(op.total_actions || 0),

                        status_id: Number(op.status_id ?? 0),
                    }));

                return {
                    line_no: group.line_no || groupIndex + 1,
                    cluster_name: group.cluster_name || '',
                    operations,
                };
            }
        );

        setGroups(mappedGroups);
        setActiveGroupIndex(0);
        setViewAllGroups(false);
        setCheckedGsdIds([]);
        setGsdActionsMap({});
        setLoadingActionIds([]);
    };

    return (
        <div className="h-full min-h-0 bg-slate-50 p-4 overflow-auto">
            <div className="max-w-[1720px] mx-auto space-y-4">
                {/* màn hình chính  */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            {/* <h2 className="text-base font-bold text-slate-800">
                                    Chứng từ đã lưu
                                </h2> */}
                            <p className="text-xs text-slate-500 mt-0.5">
                                Danh sách mã chứng từ kho cụm công đoạn đã được lưu.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={loadItems}
                                className="px-4 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                            >
                                Tải lại
                            </button>

                            <button
                                type="button"
                                onClick={handleExportExcel}
                                className="px-4 py-2 rounded-sm border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Xuất Excel
                            </button>


                            <button
                                type="button"
                                onClick={handleCopy}
                                className="px-4 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                            >
                                Sao chép
                            </button>

                            <button
                                type="button"
                                onClick={handleEdit}
                                className="px-4 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                            >
                                Sửa
                            </button>

                            <button
                                type="button"
                                onClick={handleOpenCreateModal}
                                className="px-5 py-2 rounded-sm bg-blue-600 text-white text-sm hover:bg-blue-700"
                            >
                                + Khai báo cụm công đoạn
                            </button>


                        </div>
                    </div>

                    <div className="h-[630px] overflow-auto border border-slate-200 rounded-sm">
                        <table className="w-full text-sm min-w-[1100px] border-collapse">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr className="text-xs text-slate-500 uppercase">
                                    <th className="p-3 border border-slate-200 text-left w-[20px]">
                                        STT
                                    </th>
                                    <th className="p-3 border border-slate-200 text-left w-[115px]">
                                        Mã chứng từ
                                    </th>
                                    <th className="p-3 border border-slate-200 text-left">
                                        Nhóm công việc
                                    </th>
                                    <th className="p-3 border border-slate-200 text-left">
                                        Chủng loại
                                    </th>
                                    <th className="p-3 border border-slate-200 text-left">
                                        Nhóm chủng loại
                                    </th>
                                    <th className="p-3 border border-slate-200 text-right w-[100px]">
                                        SMV
                                    </th>
                                    <th className="p-3 border border-slate-200 text-right w-[100px]">
                                        SMV ĐC
                                    </th>
                                    <th className="p-3 border border-slate-200 text-center w-[140px]">
                                        Trạng thái
                                    </th>
                                    {/* <th className="p-3 border border-slate-200 text-center w-[100px]">
                                        Thao tác
                                    </th> */}
                                </tr>
                            </thead>

                            <tbody>
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="p-8 border border-slate-200 text-center text-slate-400"
                                        >
                                            Đang tải danh sách chứng từ...
                                        </td>
                                    </tr>
                                )}

                                {!loading && items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="p-8 border border-slate-200 text-center text-slate-400"
                                        >
                                            Chưa có chứng từ nào được lưu.
                                        </td>
                                    </tr>
                                )}

                                {!loading &&
                                    items.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedSavedId(item.id)}
                                            className={`cursor-pointer hover:bg-blue-100 ${selectedSavedId === item.id ? 'bg-blue-100' : ''
                                                }`}
                                        >
                                            <td className="p-3 border border-slate-200 text-slate-500">
                                                {index + 1}
                                            </td>

                                            <td className="p-3 border border-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setSelectedSavedId(item.id)
                                                        handleViewSavedDocument(item.id);
                                                    }}
                                                    className=" text-blue-700 hover:underline"
                                                >
                                                    {item.document_code}
                                                </button>
                                            </td>

                                            <td className="p-3 border border-slate-200">
                                                {item.work_code && item.work_name
                                                    ? `${item.work_name}`
                                                    : item.work_id}
                                            </td>

                                            <td className="p-3 border border-slate-200">
                                                {item.product_code && item.product_name
                                                    ? `${item.product_code} - ${item.product_name}`
                                                    : item.product_name || item.product_category_id}
                                            </td>

                                            <td className="p-3 border border-slate-200">
                                                {item.category_group_code && item.category_group_name
                                                    ? `${item.category_group_code} - ${item.category_group_name}`
                                                    : item.category_group_name || item.product_category_group_id}
                                            </td>

                                            <td className="p-3 border border-slate-200 text-right font-bold">
                                                {Number(item.total_sam_gsd || 0).toFixed(2)}
                                            </td>

                                            <td className="p-3 border border-slate-200 text-right text-blue-700">
                                                {Number(item.total_adjusted_sam || 0).toFixed(2)}
                                            </td>

                                            <td className="p-3 border border-slate-200 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${item.status_id === 0
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                        }`}
                                                >
                                                    {item.status_id === 0 ? 'Đang sử dụng' : 'Không sử dụng'}
                                                </span>
                                            </td>

                                            {/* <td className="p-3 border border-slate-200 text-center">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleViewSavedDocument(item.id)
                                                    }}
                                                    className="px-3 py-1.5 rounded-sm border border-slate-300 bg-white text-xs hover:bg-slate-50"
                                                >
                                                    Xem
                                                </button>
                                            </td> */}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>



                    {/* {selectedDetail && (
                            <div className="mt-5 border border-slate-200 rounded-sm overflow-hidden">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">
                                            Chi tiết chứng từ: {selectedDetail.header?.document_code || '-'}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            Danh sách cụm và công đoạn đã lưu.
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedDetail(null)}
                                        className="text-sm text-slate-500 hover:text-rose-600"
                                    >
                                        Đóng
                                    </button>
                                </div>

                                <div className="overflow-auto">
                                    <table className="w-full text-sm min-w-[1300px]">
                                        <thead className="bg-white">
                                            <tr className="text-xs text-slate-500 uppercase">
                                                <th className="p-3 border-b border-slate-200 text-left w-[70px]">STT</th>
                                                <th className="p-3 border-b border-slate-200 text-left w-[120px]">Cụm</th>
                                                <th className="p-3 border-b border-slate-200 text-left w-[140px]">Mã GSD</th>
                                                <th className="p-3 border-b border-slate-200 text-left">Công đoạn</th>
                                                <th className="p-3 border-b border-slate-200 text-left w-[180px]">MMTB</th>
                                                <th className="p-3 border-b border-slate-200 text-right w-[100px]">SAM GSD</th>
                                                <th className="p-3 border-b border-slate-200 text-right w-[100px]">Hệ số</th>
                                                <th className="p-3 border-b border-slate-200 text-right w-[120px]">Đơn giá</th>
                                                <th className="p-3 border-b border-slate-200 text-right w-[120px]">SAM ĐC</th>
                                                <th className="p-3 border-b border-slate-200 text-center w-[100px]">Bước</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {(!selectedDetail.operations || selectedDetail.operations.length === 0) && (
                                                <tr>
                                                    <td colSpan={10} className="p-8 text-center text-slate-400">
                                                        Chứng từ này chưa có công đoạn hoặc API chưa trả operations.
                                                    </td>
                                                </tr>
                                            )}

                                            {(selectedDetail.operations || []).map((op: any, index: number) => (
                                                <tr
                                                    key={op.id || index}
                                                    className="border-b border-slate-100 hover:bg-slate-50"
                                                >
                                                    <td className="p-3 text-slate-500">
                                                        {index + 1}
                                                    </td>

                                                    <td className="p-3">
                                                        {op.cluster_name || `Cụm ${op.group_line_no || ''}`}
                                                    </td>

                                                    <td className="p-3 font-bold text-blue-700">
                                                        {op.operation_code || '-'}
                                                    </td>

                                                    <td className="p-3 font-bold text-slate-800">
                                                        {op.operation_name || '-'}
                                                    </td>

                                                    <td className="p-3">
                                                        {op.machine_name || '-'}
                                                    </td>

                                                    <td className="p-3 text-right">
                                                        {Number(op.sam_gsd || 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 text-right">
                                                        {Number(op.salary_coefficient || 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 text-right font-bold">
                                                        {Number(op.standard_price || 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 text-right font-bold text-blue-700">
                                                        {Number(op.adjusted_sam || 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 text-center">
                                                        {op.total_actions || 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )} */}
                </div>

                {/* khai báo cụm công đoạn */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[80] bg-slate-900/40 flex items-center justify-center p-3">
                        <div className="w-[98vw] h-[94vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                            {/* Header popup */}
                            <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        {editingId ? 'Sửa cụm công đoạn' : 'Khai báo cụm công đoạn'}
                                    </h2>

                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Nhập thông tin chứng từ, tạo cụm và chọn công đoạn GSD.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 rounded-sm border border-rose-200 bg-rose-50 text-sm text-rose-700 hover:bg-rose-100"
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-5 py-2 rounded-sm bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving
                                            ? 'Đang lưu...'
                                            : editingId
                                                ? 'Cập nhật chứng từ' 
                                                : 'Lưu chứng từ'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Body popup */}
                            <div className="flex-1 min-h-0 bg-slate-50 p-3 overflow-hidden">
                                <div className="max-w-[1760px] mx-auto h-full min-h-0 flex flex-col gap-3">

                                    {/* Dashboard nằm ngang ở trên */}
                                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-3 shrink-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-sm font-bold text-slate-800">
                                                Thông tin tổng quan
                                            </h2>

                                            <div className="text-[11px] text-slate-400">
                                                Tính realtime từ danh sách công đoạn đã chọn
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-6 gap-2">
                                            <div className="rounded-sm border border-blue-100 bg-blue-50 px-3 py-2">
                                                <div className="text-[11px] font-bold text-blue-500 uppercase">
                                                    Tổng SMV điều chỉnh
                                                </div>
                                                <div className="text-xl text-blue-700 mt-1">
                                                    {dashboard.totalAdjustedSam.toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="rounded-sm border border-emerald-100 bg-emerald-50 px-3 py-2">
                                                <div className="text-[11px] font-bold text-emerald-500 uppercase">
                                                    Tổng SMV
                                                </div>
                                                <div className="text-xl text-emerald-700 mt-1">
                                                    {dashboard.totalSamGsd.toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="rounded-sm border border-orange-100 bg-orange-50 px-3 py-2">
                                                <div className="text-[11px] font-bold text-orange-500 uppercase">
                                                    Tổng bước GSD
                                                </div>
                                                <div className="text-xl text-orange-700 mt-1">
                                                    {dashboard.totalActions}
                                                </div>
                                            </div>

                                            <div className="rounded-sm border border-amber-100 bg-amber-50 px-3 py-2">
                                                <div className="text-[11px] font-bold text-amber-500 uppercase">
                                                    Tổng giây GSD
                                                </div>
                                                <div className="text-xl text-amber-700 mt-1">
                                                    {dashboard.totalActionSeconds.toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="rounded-sm border border-violet-100 bg-violet-50 px-3 py-2">
                                                <div className="text-[11px] font-bold text-violet-500 uppercase">
                                                    Định mức lao động
                                                </div>
                                                <div className="text-xl text-violet-700 mt-1">
                                                    {dashboard.totalManpower.toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2">
                                                <div className="text-[11px] font-bold text-slate-500 uppercase">
                                                    TB TGCN / Cụm
                                                </div>
                                                <div className="text-xl text-slate-700 mt-1">
                                                    {dashboard.avgTgcn.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin chứng từ compact */}
                                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-3 shrink-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-sm font-bold text-slate-800">
                                                Thông tin chứng từ
                                            </h2>

                                            <div
                                                className={`px-3 py-1 rounded-full text-[11px] ${form.status_id === 0
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                    }`}
                                            >
                                                {form.status_id === 0 ? 'Đang sử dụng' : 'Không sử dụng'}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-6 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    Mã chứng từ <span className="text-rose-500">*</span>
                                                </label>

                                                <input
                                                    value={form.document_code}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            document_code: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-yellow-50"
                                                    placeholder="VD: KCCD0001"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    Nhóm công việc <span className="text-rose-500">*</span>
                                                </label>

                                                <select
                                                    value={form.work_id}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            work_id: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                >
                                                    <option value="">
                                                        {worksLoading ? 'Đang tải...' : '-- Chọn --'}
                                                    </option>

                                                    {works
                                                        .filter((item) => item.statusId === 0)
                                                        .map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.workCode} - {item.workName}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    Chủng loại hàng <span className="text-rose-500">*</span>
                                                </label>

                                                <select
                                                    value={form.product_category_id}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            product_category_id: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                >
                                                    <option value="">
                                                        {productCatesLoading ? 'Đang tải...' : '-- Chọn --'}
                                                    </option>

                                                    {productCates
                                                        .filter((item) => item.statusId === 0)
                                                        .map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.productCode} - {item.productName}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    Nhóm chủng loại <span className="text-rose-500">*</span>
                                                </label>

                                                <select
                                                    value={form.product_category_group_id}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            product_category_group_id: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                >
                                                    <option value="">
                                                        {productCateGroupsLoading ? 'Đang tải...' : '-- Chọn --'}
                                                    </option>

                                                    {productCateGroups
                                                        .filter((item) => item.statusId === 0)
                                                        .map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.cateGroupCode} - {item.cateGroupName}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    HS yêu cầu
                                                </label>

                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={form.required_efficiency}
                                                    onChange={(e) => handleChangeHeaderEfficiency(e.target.value)}
                                                    className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-right"
                                                    placeholder="0.8"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    Trạng thái
                                                </label>

                                                <select
                                                    value={form.status_id}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            status_id: Number(e.target.value),
                                                        }))
                                                    }
                                                    className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                >
                                                    <option value={0}>Đang sử dụng</option>
                                                    <option value={1}>Không sử dụng</option>
                                                </select>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    Phương pháp tính đơn giá
                                                </label>

                                                <div className="h-8 flex items-center gap-4 text-xs text-slate-700">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            checked={form.price_method === 'GSD'}
                                                            onChange={() =>
                                                                setForm((prev) => ({
                                                                    ...prev,
                                                                    price_method: 'GSD',
                                                                }))
                                                            }
                                                        />
                                                        Theo SMV gốc GSD
                                                    </label>

                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            checked={form.price_method === 'ADJUSTED'}
                                                            onChange={() =>
                                                                setForm((prev) => ({
                                                                    ...prev,
                                                                    price_method: 'ADJUSTED',
                                                                }))
                                                            }
                                                        />
                                                        Theo SMV điều chỉnh
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="col-span-4">
                                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                                    Ghi chú
                                                </label>

                                                <input
                                                    value={form.note}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            note: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                    placeholder="Nhập ghi chú nếu có"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vùng khai báo cụm + công đoạn */}
                                    <div className="grid grid-cols-[400px_minmax(0,1fr)] gap-3 flex-1 min-h-0">
                                        {/* Cụm */}
                                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-3 flex flex-col min-h-0">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h2 className="text-base font-bold text-slate-800">
                                                        Danh sách cụm công đoạn
                                                    </h2>
                                                    {/* <p className="text-xs text-slate-500">
                                                    Thêm cụm, chọn cụm để thao tác công đoạn.
                                                </p> */}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleAddGroup}
                                                    className="px-3 py-2 rounded-sm bg-blue-600 text-white text-sm hover:bg-blue-700"
                                                >
                                                    + Cụm
                                                </button>
                                            </div>

                                            {/* <label className="flex items-center gap-2 text-sm text-slate-700 mb-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={viewAllGroups}
                                                        onChange={(e) => setViewAllGroups(e.target.checked)}
                                                        disabled={groups.length === 0}
                                                    />
                                                    Xem tất cả cụm
                                                </label> */}

                                            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar-y border border-slate-200 rounded-sm">
                                                <table className="w-full table-fixed text-sm border-collapse">
                                                    <thead className="bg-slate-50 sticky top-0 z-10">
                                                        <tr className="text-xs text-slate-500 uppercase">
                                                            <th className="p-3 border border-slate-200 text-center w-[40px]">
                                                                STT
                                                            </th>
                                                            <th className="p-3 border border-slate-200 text-left">
                                                                Tên cụm
                                                            </th>
                                                            <th className="p-3 border border-slate-200 text-right w-[40px]">
                                                                Số CĐ
                                                            </th>
                                                            <th className="p-3 border border-slate-200 text-right w-[80px]">
                                                                SMV
                                                            </th>
                                                            <th className="p-3 border border-slate-200 text-right w-[80px]">
                                                                TGCN
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {enrichedGroups.length === 0 && (
                                                            <tr>
                                                                <td
                                                                    colSpan={5}
                                                                    className="p-8 border border-slate-200 text-center text-slate-400"
                                                                >
                                                                    Chưa có cụm. Bấm “+ Cụm” để thêm dòng mới.
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {enrichedGroups.map((group, index) => {
                                                            const isActive = activeGroupIndex === index && !viewAllGroups;

                                                            const totalSamGsd = group.operations.reduce(
                                                                (sum, op) => sum + toNumber(op.sam_gsd, 0),
                                                                0
                                                            );

                                                            return (
                                                                <tr
                                                                    key={index}
                                                                    onClick={() => {
                                                                        setActiveGroupIndex(index);
                                                                        setViewAllGroups(false);
                                                                    }}
                                                                    onContextMenu={(event) =>
                                                                        handleOpenGroupContextMenu(event, index)
                                                                    }
                                                                    className={`cursor-pointer ${isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                                                                        }`}
                                                                >
                                                                    <td className="p-3 border border-slate-200 text-center text-slate-500">
                                                                        {index + 1}
                                                                    </td>

                                                                    <td className="p-2 border border-slate-200">
                                                                        <input
                                                                            value={group.cluster_name}
                                                                            onChange={(e) =>
                                                                                handleChangeGroupName(index, e.target.value)
                                                                            }
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="w-full border border-transparent rounded-lg px-2 py-1 outline-none bg-transparent text-slate-400 focus:bg-white focus:border-blue-300"
                                                                            placeholder="Nhập tên cụm"
                                                                        />
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-right text-slate-700">
                                                                        {group.operations.length}
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-right text-slate-700">
                                                                        {totalSamGsd.toFixed(2)}
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-right text-blue-700">
                                                                        {group.tgcn.toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {groupContextMenu && (
                                                <div
                                                    className="fixed inset-0 z-50"
                                                    onClick={() => setGroupContextMenu(null)}
                                                >
                                                    <div
                                                        className="absolute w-[220px] bg-white border border-slate-200 rounded-sm shadow-xl overflow-hidden"
                                                        style={{
                                                            top: groupContextMenu.y,
                                                            left: groupContextMenu.x,
                                                        }}
                                                        onClick={(event) => event.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleInsertGroupBelow(groupContextMenu.groupIndex)
                                                            }
                                                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50"
                                                        >
                                                            - Chèn dòng bên dưới
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteGroup(groupContextMenu.groupIndex)
                                                            }
                                                            className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50"
                                                        >
                                                            - Xóa dòng này
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Công đoạn */}
                                        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-3 flex flex-col min-w-0 min-h-0">
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div>
                                                    <h2 className="text-base font-bold text-slate-800">
                                                        Khai báo công đoạn cho chủng loại hàng
                                                    </h2>

                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {viewAllGroups
                                                            ? 'Đang xem tất cả công đoạn của mọi cụm.'
                                                            : `Đang thao tác trên cụm: ${enrichedGroups[activeGroupIndex]?.cluster_name || '-'
                                                            }`}
                                                    </p>
                                                </div>



                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleOpenGroupOverview}
                                                        className="px-4 py-2 rounded-sm border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Xem tất cả cụm
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={handleOpenGsdPopup}
                                                        disabled={viewAllGroups}
                                                        className="px-5 py-2 rounded-sm bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        + Chọn công đoạn từ GSD
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="border border-slate-200 rounded-sm overflow-x-auto">
                                                <div className="h-full min-w-[1500px] overflow-y-auto overflow-x-hidden no-scrollbar-y">
                                                    <table className="w-full text-sm border-collapse">
                                                        <thead className="bg-slate-50 sticky top-0 z-10">
                                                            <tr className="text-xs text-slate-500 uppercase">
                                                                <th className="p-3 border border-slate-200 text-left w-[40px]">STT</th>
                                                                <th className="p-3 border border-slate-200 text-left w-[110px]">Xếp chuyền</th>
                                                                <th className="p-3 border border-slate-200 text-left w-[260px]">Công đoạn</th>
                                                                <th className="p-3 border border-slate-200 text-center w-[30px]">Bậc</th>
                                                                <th className="p-3 border border-slate-200 text-left w-[220px]">MMTB</th>
                                                                <th className="p-3 border border-slate-200 text-left w-[100px]">MMTB Code</th>
                                                                <th className="p-3 border border-slate-200 text-right w-[100px]">SMV</th>
                                                                <th className="p-3 border border-slate-200 text-right w-[100px]">Hệ số</th>
                                                                <th className="p-3 border border-slate-200 text-center w-[90px]">Nhân sự</th>
                                                                <th className="p-3 border border-slate-200 text-right w-[120px]">Đơn giá</th>
                                                                <th className="p-3 border border-slate-200 text-center w-[90px]">HS YC</th>
                                                                <th className="p-3 border border-slate-200 text-right w-[100px]">SMV ĐC</th>
                                                                <th className="p-3 border border-slate-200 text-center w-[100px]">Hiệu suất</th>
                                                                <th className="p-3 border border-slate-200 text-center w-[100px]">Bước GSD</th>
                                                                <th className="p-3 border border-slate-200 text-center w-[50px]">Xóa</th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {visibleOperations.length === 0 && (
                                                                <tr>
                                                                    <td
                                                                        colSpan={16}
                                                                        className="p-10 text-center text-slate-400"
                                                                    >
                                                                        Chưa có công đoạn. Chọn công đoạn GSD rồi bấm “+ Thêm”.
                                                                    </td>
                                                                </tr>
                                                            )}

                                                            {visibleOperations.map((op, index) => (
                                                                <tr
                                                                    key={`${op.gsd_analysis_id}-${index}`}
                                                                    className="border-b border-slate-100 hover:bg-slate-50"
                                                                >
                                                                    <td className="p-3 text-slate-500 border border-slate-200 text-center">
                                                                        {index + 1}
                                                                    </td>

                                                                    <td className="p-2 p-3 border border-slate-200 text-center">
                                                                        <input
                                                                            value={op.line_balance_no || ''}
                                                                            onChange={(e) =>
                                                                                handleChangeLineBalanceNo(index, e.target.value)
                                                                            }
                                                                            disabled={viewAllGroups}
                                                                            className="w-full border border-slate-200 rounded-lg px-2 py-1 text-center outline-none disabled:bg-slate-100"
                                                                        />
                                                                    </td>
                                                                    {/* 
                                                        <td className="p-3 font-semibold text-blue-700">
                                                            {op.operation_code || '-'}
                                                        </td> */}

                                                                    <td className="p-3 border border-slate-200 text-left">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOpenOperationActions(op)}
                                                                            className="text-slate-800 hover:text-blue-700 hover:underline text-left"
                                                                            title="Click để xem danh sách thao tác"
                                                                        >
                                                                            {op.operation_name}
                                                                        </button>

                                                                        {viewAllGroups && (
                                                                            <div className="text-xs text-slate-400 mt-0.5">
                                                                                Cụm: {op.cluster_name}
                                                                            </div>
                                                                        )}
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-center">
                                                                        {op.skill_level || '-'}
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-left">
                                                                        {op.machine_name || '-'}
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-left">
                                                                        {op.code_mmtb || '-'}
                                                                    </td>

                                                                    <td className="p-3 font-semibold border border-slate-200 text-center">
                                                                        {toNumber(op.sam_gsd).toFixed(2)}
                                                                    </td>

                                                                    <td className="p-2 border border-slate-200 text-center ">
                                                                        <button
                                                                            type="button"
                                                                            onClick={(event) => handleOpenCoefficientPopup(event, index)}
                                                                            disabled={viewAllGroups}
                                                                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-right text-blue-700 hover:border-blue-400 hover:bg-blue-50 disabled:bg-slate-100 disabled:text-slate-400"
                                                                            title="Click để chọn hệ số lương"
                                                                        >
                                                                            {toNumber(op.salary_coefficient).toFixed(2)}
                                                                        </button>
                                                                    </td>

                                                                    <td className="p-2 border border-slate-200 text-center">
                                                                        <input
                                                                            value={op.manpower ?? ''}
                                                                            onChange={(e) =>
                                                                                handleChangeManpower(index, e.target.value)
                                                                            }
                                                                            disabled={viewAllGroups}
                                                                            className="w-full border border-slate-200 rounded-lg px-2 py-1 text-center outline-none disabled:bg-slate-100"
                                                                        />
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-right">
                                                                        {toNumber(op.standard_price_preview).toFixed(2)}
                                                                    </td>

                                                                    <td className="p-2 border border-slate-200 text-center">
                                                                        <input
                                                                            type="text"
                                                                            inputMode="decimal"
                                                                            value={
                                                                                op.required_efficiency !== null &&
                                                                                    op.required_efficiency !== undefined
                                                                                    ? String(op.required_efficiency)
                                                                                    : String(form.required_efficiency || '')
                                                                            }
                                                                            onChange={(e) =>
                                                                                handleChangeOperationEfficiency(index, e.target.value)
                                                                            }
                                                                            disabled={viewAllGroups}
                                                                            className="w-full border border-slate-200 rounded-lg px-2 py-1 text-center outline-none disabled:bg-slate-100"
                                                                            placeholder="0.8"
                                                                        />

                                                                        <div className="text-[10px] text-slate-400 mt-1">
                                                                            {(() => {
                                                                                const rawValue =
                                                                                    op.required_efficiency !== null &&
                                                                                        op.required_efficiency !== undefined
                                                                                        ? String(op.required_efficiency)
                                                                                        : String(form.required_efficiency || '');

                                                                                if (!rawValue || rawValue === '.') return '-';

                                                                                const value = toNumber(rawValue, 0);

                                                                                return value > 0 ? `${(value * 100).toFixed(0)}%` : '-';
                                                                            })()}
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3 border border-slate-200 text-right">
                                                                        {toNumber(op.adjusted_sam_preview).toFixed(2)}
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-center">
                                                                        {(toNumber(op.utilization_rate_preview) * 100).toFixed(0)}%
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-center">
                                                                        {op.total_actions || 0}
                                                                    </td>

                                                                    <td className="p-3 border border-slate-200 text-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveOperation(index)}
                                                                            disabled={viewAllGroups}
                                                                            className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                                                                        >
                                                                            Xóa
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* pop up show chi tiết mã chứng từ */}
            {isSavedDetailOpen && selectedDetail && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-6">
                    <div className="w-[1350px] max-w-[96vw] max-h-[95vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Chi tiết chứng từ
                                    </h2>

                                    <div className="text-sm text-slate-500 mt-1">
                                        Mã chứng từ:{" "}
                                        <span className="font-bold text-blue-700">
                                            {selectedDetail.header?.document_code || "-"}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="px-4 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                                >
                                    Sửa
                                </button>
                            </div>



                            <button
                                type="button"
                                onClick={() => {
                                    setIsSavedDetailOpen(false);
                                    setSelectedDetail(null);
                                    setSelectedSavedId(null);
                                }}
                                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
                            >
                                ✕
                            </button>

                        </div>

                        <div className="p-5 flex-1 min-h-0 overflow-hidden flex flex-col gap-4">
                            {/* Thông tin chung */}
                            <div className="grid grid-cols-4 gap-3">
                                <div className="border border-slate-200 rounded-sm p-3 bg-slate-50">
                                    <div className="text-xs text-slate-500 font-bold uppercase">
                                        Nhóm công việc
                                    </div>
                                    <div className="text-sm text-slate-800 mt-1">
                                        {selectedDetail.header?.work_code || ''} - {selectedDetail.header?.work_name || ''}
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-sm p-3 bg-slate-50">
                                    <div className="text-xs text-slate-500 font-bold uppercase">
                                        Chủng loại
                                    </div>
                                    <div className="text-sm text-slate-800 mt-1">
                                        {selectedDetail.header?.product_code || ''} - {selectedDetail.header?.product_name || ''}
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-sm p-3 bg-slate-50">
                                    <div className="text-xs text-slate-500 font-bold uppercase">
                                        Nhóm chủng loại
                                    </div>
                                    <div className="text-sm text-slate-800 mt-1">
                                        {selectedDetail.header?.category_group_code || ''} - {selectedDetail.header?.category_group_name || ''}
                                    </div>
                                </div>

                                <div className="border border-slate-200 rounded-sm p-3 bg-slate-50">
                                    <div className="text-xs text-slate-500 font-bold uppercase">
                                        Phương pháp tính
                                    </div>
                                    <div className="text-sm text-slate-800 mt-1">
                                        {selectedDetail.header?.price_method === 'ADJUSTED'
                                            ? 'Theo SMV điều chỉnh'
                                            : 'Theo SMV gốc GSD'}
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard */}
                            <div className="grid grid-cols-6 gap-3">
                                <div className="border border-blue-100 bg-blue-50 rounded-sm p-3">
                                    <div className="text-xs font-bold text-blue-600 uppercase">
                                        SMV điều chỉnh
                                    </div>
                                    <div className="text-xl text-blue-700 mt-1">
                                        {Number(selectedDetail.dashboard?.total_adjusted_sam || 0).toFixed(2)}
                                    </div>
                                </div>

                                <div className="border border-emerald-100 bg-emerald-50 rounded-sm p-3">
                                    <div className="text-xs font-bold text-emerald-600 uppercase">
                                        SMV
                                    </div>
                                    <div className="text-xl text-emerald-700 mt-1">
                                        {Number(selectedDetail.dashboard?.total_sam_gsd || 0).toFixed(2)}
                                    </div>
                                </div>

                                <div className="border border-orange-100 bg-orange-50 rounded-sm p-3">
                                    <div className="text-xs font-bold text-orange-600 uppercase">
                                        Tổng bước
                                    </div>
                                    <div className="text-xl text-orange-700 mt-1">
                                        {Number(selectedDetail.dashboard?.total_actions || 0)}
                                    </div>
                                </div>

                                <div className="border border-amber-100 bg-amber-50 rounded-sm p-3">
                                    <div className="text-xs font-bold text-amber-600 uppercase">
                                        Tổng giây
                                    </div>
                                    <div className="text-xl text-amber-700 mt-1">
                                        {Number(selectedDetail.dashboard?.total_action_seconds || 0).toFixed(2)}
                                    </div>
                                </div>

                                <div className="border border-violet-100 bg-violet-50 rounded-sm p-3">
                                    <div className="text-xs font-bold text-violet-600 uppercase">
                                        Định mức LĐ
                                    </div>
                                    <div className="text-xl text-violet-700 mt-1">
                                        {Number(selectedDetail.dashboard?.total_manpower || 0).toFixed(2)}
                                    </div>
                                </div>

                                <div className="border border-slate-200 bg-slate-50 rounded-sm p-3">
                                    <div className="text-xs font-bold text-slate-600 uppercase">
                                        Tổng đơn giá
                                    </div>
                                    <div className="text-xl text-slate-700 mt-1">
                                        {Number(selectedDetail.dashboard?.total_standard_price || 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>


                            {/* Danh sách công đoạn */}
                            <div className="border border-slate-200 rounded-sm overflow-hidden flex flex-col flex-1 min-h-0">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                    <div className="text-sm font-bold text-slate-800">
                                        Danh sách công đoạn
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 overflow-auto">
                                    <table className="w-max min-w-[1300px] text-sm border-collapse">
                                        <thead className="bg-white sticky top-0 z-10">
                                            <tr className="text-xs text-slate-500 uppercase">
                                                <th className="p-3 border border-slate-200 text-left w-[70px]">
                                                    STT
                                                </th>
                                                <th className="p-3 border border-slate-200 text-center w-[100px]">
                                                    Xếp chuyền
                                                </th>
                                                <th className="p-3 border border-slate-200 text-left w-[120px]">
                                                    Cụm
                                                </th>
                                                {/* <th className="p-3 border border-slate-200 text-left w-[140px]">
                                                Mã GSD
                                            </th> */}
                                                <th className="p-3 border border-slate-200 text-left w-[340px]">
                                                    Công đoạn
                                                </th>
                                                <th className="p-3 border border-slate-200 text-left">
                                                    Bậc
                                                </th>
                                                <th className="p-3 border border-slate-200 text-left w-[180px]">
                                                    MMTB code
                                                </th>
                                                <th className="p-3 border border-slate-200 text-left w-[180px]">
                                                    MMTB
                                                </th>
                                                <th className="p-3 border border-slate-200 text-right w-[100px]">
                                                    SMV
                                                </th>
                                                <th className="p-3 border border-slate-200 text-right w-[100px]">
                                                    Hệ số lương
                                                </th>
                                                <th className="p-3 border border-slate-200 text-right w-[100px]">
                                                    Hệ số yêu cầu
                                                </th>
                                                <th className="p-3 border border-slate-200 text-right w-[120px]">
                                                    Đơn giá
                                                </th>
                                                <th className="p-3 border border-slate-200 text-right w-[120px]">
                                                    SMV ĐC
                                                </th>
                                                <th className="p-3 border border-slate-200 text-right w-[120px]">
                                                    Hiệu suất sử dụng
                                                </th>
                                                <th className="p-3 border border-slate-200 text-center w-[100px]">
                                                    Bước
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {(!selectedDetail.operations ||
                                                selectedDetail.operations.length === 0) && (
                                                    <tr>
                                                        <td
                                                            colSpan={13}
                                                            className="p-8 border border-slate-200 text-center text-slate-400"
                                                        >
                                                            Chứng từ này chưa có công đoạn.
                                                        </td>
                                                    </tr>
                                                )}

                                            {(selectedDetail.operations || []).map((op: any, index: number) => (
                                                <tr
                                                    key={op.id || index}
                                                    className="hover:bg-slate-50"
                                                >
                                                    <td className="p-3 border border-slate-200 text-slate-500">
                                                        {index + 1}
                                                    </td>

                                                    <td className="p-3 border border-slate-200 text-center">
                                                        {op.line_balance_no || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-200">
                                                        {op.cluster_name || `Cụm ${op.group_line_no || ''}`}
                                                    </td>

                                                    {/* <td className="p-3 border border-slate-200 text-blue-700">
                                                    {op.operation_code || '-'}
                                                </td> */}

                                                    <td className="p-3 border border-slate-200 text-slate-800">
                                                        {op.operation_name || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-200">
                                                        {op.skill_level || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-200">
                                                        {op.code_mmtb || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-200">
                                                        {op.machine_name || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-200 text-right">
                                                        {Number(op.sam_gsd || 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 border border-slate-200 text-right">
                                                        {Number(op.salary_coefficient || 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 border border-slate-200 text-right">
                                                        {Number(op.required_efficiency || 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 border border-slate-200 text-right">
                                                        {Number(op.standard_price || 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 border border-slate-200 text-right text-blue-700">
                                                        {Number(op.adjusted_sam || 0).toFixed(2)}
                                                    </td>


                                                    <td className="p-3 border border-slate-200 text-right text-blue-700">
                                                        {(toNumber(op.utilization_rate, 0) * 100).toFixed(0)}%
                                                    </td>

                                                    <td className="p-3 border border-slate-200 text-center">
                                                        {op.total_actions || 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSavedDetailOpen(false);
                                setSelectedDetail(null);
                            }}
                            className="px-5 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                        >
                            Đóng
                        </button>
                    </div> */}
                    </div>
                </div>
            )}
            {/* chọn công đoạn từ gsd */}
            {isGsdPopupOpen && (
                <div className="fixed inset-0 z-800 bg-slate-900/40 flex items-center justify-center p-4">
                    <div className="w-[96vw] h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Chọn công đoạn từ GSD
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Tích chọn công đoạn bên trái. Các thao tác của công đoạn đã chọn sẽ hiển thị bên phải.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseGsdPopup}
                                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 grid grid-cols-[0.95fr_1.05fr] gap-4 flex-1 min-h-0">
                            {/* Bên trái: Danh sách công đoạn */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col min-h-0">
                                <div className="p-3 border-b border-slate-200 bg-slate-50">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm">
                                                Danh sách công đoạn
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                Đã chọn: {checkedGsdIds.length} công đoạn
                                            </div>
                                        </div>

                                        <input
                                            value={gsdSearch}
                                            onChange={(e) => setGsdSearch(e.target.value)}
                                            className="w-[320px] border border-slate-300 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                                            placeholder="Tìm mã, tên công đoạn, máy..."
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto">
                                    <table className="w-full table-fixed text-[15px]">
                                        <thead className="bg-white sticky top-0 z-10">
                                            <tr className="text-[11px] uppercase text-slate-500">
                                                <th className="p-2 border-b border-slate-200 text-center w-[52px]">
                                                    Chọn
                                                </th>
                                                {/* <th className="p-2 border-b border-slate-200 text-left w-[150px]">
                                                    Mã
                                                </th> */}
                                                <th className="p-2 border-b border-slate-200 text-left">
                                                    Công đoạn
                                                </th>
                                                <th className="p-2 border-b border-slate-200 text-right">
                                                    MMTB
                                                </th>
                                                <th className="p-2 border-b border-slate-200 text-right">
                                                    MMTB code
                                                </th>
                                                <th className="p-2 border-b border-slate-200 text-right">
                                                    Bậc tay nghề
                                                </th>
                                                <th className="p-2 border-b border-slate-200 text-right">
                                                    TMU
                                                </th>
                                                <th className="p-2 border-b border-slate-200 text-right w-[75px]">
                                                    SMV
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filteredGsdOptions.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-slate-400">
                                                        Không có công đoạn GSD phù hợp.
                                                    </td>
                                                </tr>
                                            )}

                                            {filteredGsdOptions.map((item) => {
                                                const checked = checkedGsdIds.includes(item.gsd_analysis_id);

                                                return (
                                                    <tr
                                                        key={item.gsd_analysis_id}
                                                        className={`border-b border-slate-100 ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <td className="p-2 text-center align-top">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => handleToggleGsd(item)}
                                                                className="w-4 h-4"
                                                            />
                                                        </td>
                                                        {/* 
                                                        <td className="p-2 align-top">
                                                            <div className="font-bold text-blue-700 truncate">
                                                                {item.operation_code}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 truncate">
                                                                Bậc {item.skill_level || '-'} • HS{' '}
                                                                {toNumber(item.salary_coefficient).toFixed(2)}
                                                            </div>
                                                        </td> */}

                                                        <td className="p-2 align-top">
                                                            <div className=" text-slate-800 line-clamp-2">
                                                                {item.operation_name}
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-right align-top text-slate-800">
                                                            {item.machine_name}
                                                        </td>

                                                        <td className="p-2 text-right align-top text-slate-800">
                                                            {item.code_mmtb}
                                                        </td>

                                                        <td className="p-2 text-right align-top text-slate-800">
                                                            {item.skill_level}
                                                        </td>

                                                        <td className="p-2 text-right align-top text-slate-800">
                                                            {item.total_tmu}
                                                        </td>

                                                        <td className="p-2 text-right align-top text-slate-800">
                                                            {toNumber(item.sam_gsd).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bên phải: Danh sách thao tác theo các công đoạn đã chọn */}
                            <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col min-h-0">
                                <div className="p-3 border-b border-slate-200 bg-slate-50">
                                    <div className="font-bold text-slate-800 text-[15px]">
                                        Danh sách thao tác
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        Hiển thị thao tác của tất cả công đoạn đã tích chọn.
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto">
                                    {checkedGsds.length === 0 && (
                                        <div className="p-10 text-center text-slate-400 text-sm">
                                            Chưa chọn công đoạn. Tích chọn công đoạn bên trái để xem thao tác.
                                        </div>
                                    )}

                                    {checkedGsds.map((gsd, gsdIndex) => {
                                        const actions = gsdActionsMap[gsd.gsd_analysis_id] || [];
                                        const isLoading = loadingActionIds.includes(gsd.gsd_analysis_id);

                                        return (
                                            <div
                                                key={gsd.gsd_analysis_id}
                                                className="border-b border-slate-200"
                                            >
                                                {/* Header công đoạn */}
                                                <div className="bg-blue-50 px-3 py-2 border-b border-blue-100 ">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="text-[15px] font-bold text-blue-700">
                                                                Công đoạn {gsdIndex + 1}: {gsd.operation_name}
                                                            </div>

                                                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                                MMTB: {gsd.machine_name || '-'}
                                                                {gsd.machine_code ? ` • ${gsd.code_mmtb}` : ''}
                                                            </div>
                                                        </div>

                                                        <div className="shrink-0 text-right">
                                                            <div className="text-[15px] text-slate-500">
                                                                SMV
                                                            </div>
                                                            <div className="text-sm text-blue-700">
                                                                {toNumber(gsd.sam_gsd).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Table thao tác */}
                                                {isLoading ? (
                                                    <div className="p-5 text-center text-slate-400 text-sm">
                                                        Đang tải thao tác...
                                                    </div>
                                                ) : actions.length === 0 ? (
                                                    <div className="p-5 text-center text-slate-400 text-sm">
                                                        Công đoạn này chưa có thao tác.
                                                    </div>
                                                ) : (
                                                    <table className="w-full table-fixed text-[12px]">
                                                        <thead className="bg-white">
                                                            <tr className="text-[11px] uppercase text-slate-500">
                                                                <th className="p-2 border-b border-slate-100 text-center w-[55px]">
                                                                    Bước
                                                                </th>
                                                                <th className="p-2 border-b border-slate-100 text-left w-[75px]">
                                                                    Code
                                                                </th>
                                                                <th className="p-2 border-b border-slate-100 text-left">
                                                                    Thao tác
                                                                </th>
                                                                <th className="p-2 border-b border-slate-100 text-right w-[65px]">
                                                                    TMU
                                                                </th>
                                                                <th className="p-2 border-b border-slate-100 text-right w-[65px]">
                                                                    TS
                                                                </th>
                                                                <th className="p-2 border-b border-slate-100 text-right w-[70px]">
                                                                    Giây
                                                                </th>
                                                            </tr>
                                                        </thead>

                                                        <tbody>
                                                            {actions.map((action) => (
                                                                <tr
                                                                    key={action.id}
                                                                    className="border-b border-slate-50 hover:bg-slate-50"
                                                                >
                                                                    <td className="p-2 text-center font-bold text-slate-600 text-[15px]">
                                                                        {action.step_no ?? action.line_no}
                                                                    </td>

                                                                    <td className="p-2 font-semibold text-blue-700 truncate text-[15px]">
                                                                        {action.gsd_code || '-'}
                                                                    </td>

                                                                    <td className="p-2">
                                                                        <div className="line-clamp-2 text-slate-700 text-[15px]">
                                                                            {action.action_name}
                                                                        </div>
                                                                    </td>

                                                                    <td className="p-2 text-right text-[15px]">
                                                                        {toNumber(action.tmu).toFixed(2)}
                                                                    </td>

                                                                    <td className="p-2 text-right text-[15px]">
                                                                        {toNumber(action.frequency).toFixed(2)}
                                                                    </td>

                                                                    <td className="p-2 text-right font-bold text-[15px]">
                                                                        {toNumber(action.seconds).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div className="text-sm text-slate-500">
                                Đã chọn{' '}
                                <span className="font-black text-blue-700">
                                    {checkedGsdIds.length}
                                </span>{' '}
                                công đoạn.
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseGsdPopup}
                                    className="px-5 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="button"
                                    onClick={handleConfirmSelectGsd}
                                    className="px-6 py-2 rounded-sm bg-blue-600 text-white text-sm hover:bg-blue-700"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* chọn hệ số lương */}
            {coefficientPopup && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-900/20 flex items-center justify-center p-4"
                    onClick={() => setCoefficientPopup(null)}
                >
                    <div
                        className="w-[420px] max-w-[92vw] bg-white border border-slate-200 rounded-sm shadow-2xl overflow-hidden"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="p-4 border-b border-slate-100">
                            <div className="font-bold text-slate-800">
                                Chọn hệ số lương
                            </div>

                            <div className="text-xs text-slate-500 mt-1">
                                Chọn hệ số từ danh mục hệ số tính lương.
                            </div>

                            <input
                                value={coefficientSearch}
                                onChange={(e) => setCoefficientSearch(e.target.value)}
                                className="w-full mt-3 border border-slate-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                placeholder="Tìm theo level hoặc hệ số..."
                                autoFocus
                            />
                        </div>

                        <div className="max-h-[320px] overflow-auto p-2">
                            {salaryCoefficientLoading && (
                                <div className="p-4 text-sm text-slate-500">
                                    Đang tải danh mục hệ số...
                                </div>
                            )}

                            {!salaryCoefficientLoading &&
                                salaryCoefficients
                                    .filter((item) => item.statusId === 0)
                                    .filter((item) => {
                                        const keyword = coefficientSearch.trim().toLowerCase();

                                        if (!keyword) return true;

                                        const levelText = String(getSkillLevelText(item.levelId)).toLowerCase();
                                        const coefficientText = String(item.coefficient).toLowerCase();

                                        return (
                                            levelText.includes(keyword) ||
                                            coefficientText.includes(keyword)
                                        );
                                    })
                                    .map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() =>
                                                handleSelectSalaryCoefficient(Number(item.coefficient || 0), Number(item.levelId || 0))
                                            }
                                            className="w-full text-left p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-sm text-slate-800">
                                                        Bậc thợ: {getSkillLevelText(item.levelId)}
                                                    </div>

                                                    {/* <div className="text-xs text-slate-500 mt-0.5">
                                                        salary_coefficients.id = {item.id}
                                                    </div> */}
                                                </div>

                                                <div className="text-lg text-blue-700">
                                                    {Number(item.coefficient || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                            {!salaryCoefficientLoading &&
                                salaryCoefficients.filter((item) => item.statusId === 0).length === 0 && (
                                    <div className="p-4 text-sm text-slate-500">
                                        Chưa có hệ số lương đang sử dụng.
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}
            {/* danh sách các thao tác khi nhấn chọn vào tên công đoạn */}
            {operationActionPopup && (
                <div className="fixed inset-0 z-500 bg-slate-900/40 flex items-center justify-center p-6">
                    <div className="w-[1000px] max-w-[94vw] max-h-[88vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-lg text-slate-800">
                                    Danh sách thao tác công đoạn
                                </h2>

                                <div className="text-sm text-slate-500 mt-1">
                                    {operationActionPopup.operationCode || '-'} -{' '}
                                    <span className="text-slate-700">
                                        {operationActionPopup.operationName}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setOperationActionPopup(null);
                                    setOperationActions([]);
                                }}
                                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr className="text-xs text-slate-500 uppercase">
                                        <th className="p-3 border-b border-slate-200 text-center w-[80px]">
                                            Bước
                                        </th>
                                        <th className="p-3 border-b border-slate-200 text-left w-[120px]">
                                            Code
                                        </th>
                                        <th className="p-3 border-b border-slate-200 text-left">
                                            Thao tác
                                        </th>
                                        <th className="p-3 border-b border-slate-200 text-right w-[100px]">
                                            TMU
                                        </th>
                                        <th className="p-3 border-b border-slate-200 text-right w-[100px]">
                                            Tần suất
                                        </th>
                                        <th className="p-3 border-b border-slate-200 text-right w-[100px]">
                                            Giây
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loadingOperationActions && (
                                        <tr>
                                            <td colSpan={6} className="p-10 text-center text-slate-400">
                                                Đang tải danh sách thao tác...
                                            </td>
                                        </tr>
                                    )}

                                    {!loadingOperationActions && operationActions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-10 text-center text-slate-400">
                                                Công đoạn này chưa có thao tác.
                                            </td>
                                        </tr>
                                    )}

                                    {!loadingOperationActions &&
                                        operationActions.map((action) => (
                                            <tr
                                                key={action.id}
                                                className="border-b border-slate-100 hover:bg-slate-50"
                                            >
                                                <td className="p-3 text-center font-bold text-slate-600">
                                                    {action.step_no ?? action.line_no}
                                                </td>

                                                <td className="p-3 font-bold text-blue-700">
                                                    {action.gsd_code || '-'}
                                                </td>

                                                <td className="p-3 text-slate-700">
                                                    {action.action_name}
                                                </td>

                                                <td className="p-3 text-right">
                                                    {toNumber(action.tmu).toFixed(2)}
                                                </td>

                                                <td className="p-3 text-right">
                                                    {toNumber(action.frequency).toFixed(2)}
                                                </td>

                                                <td className="p-3 text-right font-bold text-slate-800">
                                                    {toNumber(action.seconds).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setOperationActionPopup(null);
                                    setOperationActions([]);
                                }}
                                className="px-5 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* view all cụm */}
            {isGroupOverviewOpen && (
                <div className="fixed inset-0 z-[95] bg-slate-900/40 flex items-center justify-center p-4">
                    <div className="w-[1450px] max-w-[96vw] h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Tổng quan cụm công đoạn
                                </h2>

                                <p className="text-xs text-slate-500 mt-0.5">
                                    Xem toàn bộ cụm và công đoạn trước khi lưu chứng từ.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsGroupOverviewOpen(false)}
                                className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Tổng quan nhanh */}
                        {/* <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
                            <div className="grid grid-cols-6 gap-3">
                                <div className="border border-blue-100 bg-blue-50 rounded-sm px-3 py-2">
                                    <div className="text-[11px] font-bold text-blue-600 uppercase">
                                        SAM điều chỉnh
                                    </div>
                                    <div className="text-xl text-blue-700 mt-1">
                                        {dashboard.totalAdjustedSam.toFixed(2)}
                                    </div>
                                </div>

                                <div className="border border-emerald-100 bg-emerald-50 rounded-sm px-3 py-2">
                                    <div className="text-[11px] font-bold text-emerald-600 uppercase">
                                        SAM GSD
                                    </div>
                                    <div className="text-xl text-emerald-700 mt-1">
                                        {dashboard.totalSamGsd.toFixed(2)}
                                    </div>
                                </div>

                                <div className="border border-orange-100 bg-orange-50 rounded-sm px-3 py-2">
                                    <div className="text-[11px] font-bold text-orange-600 uppercase">
                                        Tổng bước
                                    </div>
                                    <div className="text-xl text-orange-700 mt-1">
                                        {dashboard.totalActions}
                                    </div>
                                </div>

                                <div className="border border-amber-100 bg-amber-50 rounded-sm px-3 py-2">
                                    <div className="text-[11px] font-bold text-amber-600 uppercase">
                                        Tổng giây
                                    </div>
                                    <div className="text-xl text-amber-700 mt-1">
                                        {dashboard.totalActionSeconds.toFixed(2)}
                                    </div>
                                </div>

                                <div className="border border-violet-100 bg-violet-50 rounded-sm px-3 py-2">
                                    <div className="text-[11px] font-bold text-violet-600 uppercase">
                                        Định mức LĐ
                                    </div>
                                    <div className="text-xl text-violet-700 mt-1">
                                        {dashboard.totalManpower.toFixed(2)}
                                    </div>
                                </div>

                                <div className="border border-slate-200 bg-white rounded-sm px-3 py-2">
                                    <div className="text-[11px] font-bold text-slate-600 uppercase">
                                        Số cụm
                                    </div>
                                    <div className="text-xl text-slate-700 mt-1">
                                        {enrichedGroups.length}
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* Body */}
                        <div className="flex-1 min-h-0 overflow-auto bg-white">
                            {enrichedGroups.length === 0 && (
                                <div className="p-10 text-center text-slate-400">
                                    Chưa có cụm để hiển thị.
                                </div>
                            )}

                            {enrichedGroups.map((group, groupIndex) => {
                                const totalSamGsd = group.operations.reduce(
                                    (sum, op) => sum + toNumber(op.sam_gsd, 0),
                                    0
                                );

                                const totalAdjustedSam = group.operations.reduce(
                                    (sum, op) => sum + toNumber(op.adjusted_sam_preview, 0),
                                    0
                                );

                                const totalActions = group.operations.reduce(
                                    (sum, op) => sum + toNumber(op.total_actions, 0),
                                    0
                                );

                                const totalManpower = group.operations.reduce(
                                    (sum, op) => sum + toNumber(op.manpower, 0),
                                    0
                                );

                                return (
                                    <div
                                        key={groupIndex}
                                        className="border-b border-slate-200"
                                    >
                                        {/* Header cụm */}
                                        <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-blue-700">
                                                        Cụm {groupIndex + 1}: {group.cluster_name || '-'}
                                                    </div>

                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {group.operations.length} công đoạn
                                                        {' '}• SMV: {totalSamGsd.toFixed(2)}
                                                        {' '}• SMV ĐC/TGCN: {totalAdjustedSam.toFixed(2)}
                                                        {' '}• Bước GSD: {totalActions}
                                                        {' '}• Nhân sự: {totalManpower.toFixed(2)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 gap-2 shrink-0 text-right">
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase">
                                                            Số CĐ
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-800">
                                                            {group.operations.length}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase">
                                                            SMV
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-800">
                                                            {totalSamGsd.toFixed(2)}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase">
                                                            TGCN
                                                        </div>
                                                        <div className="text-sm font-bold text-blue-700">
                                                            {totalAdjustedSam.toFixed(2)}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase">
                                                            Nhân sự
                                                        </div>
                                                        <div className="text-sm font-bold text-slate-800">
                                                            {totalManpower.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Table công đoạn của cụm */}
                                        <div className="overflow-auto">
                                            <table className="w-full text-sm min-w-[1450px] border-collapse">
                                                <thead className="bg-white">
                                                    <tr className="text-xs text-slate-500 uppercase">
                                                        <th className="p-3 border border-slate-100 text-center w-[60px]">
                                                            STT
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-left w-[110px]">
                                                            Xếp chuyền
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-left">
                                                            Công đoạn
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-center w-[70px]">
                                                            Bậc
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-left w-[180px]">
                                                            MMTB
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-left w-[110px]">
                                                            Code
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-right w-[100px]">
                                                            SMV
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-right w-[100px]">
                                                            Hệ số
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-center w-[90px]">
                                                            Nhân sự
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-right w-[110px]">
                                                            Đơn giá
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-center w-[90px]">
                                                            HS YC
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-right w-[110px]">
                                                            SMV ĐC
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-center w-[100px]">
                                                            Hiệu suất
                                                        </th>
                                                        <th className="p-3 border border-slate-100 text-center w-[100px]">
                                                            Bước GSD
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {group.operations.length === 0 && (
                                                        <tr>
                                                            <td
                                                                colSpan={14}
                                                                className="p-8 border border-slate-100 text-center text-slate-400"
                                                            >
                                                                Cụm này chưa có công đoạn.
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {group.operations.map((op, operationIndex) => (
                                                        <tr
                                                            key={`${groupIndex}-${op.gsd_analysis_id}-${operationIndex}`}
                                                            className="hover:bg-slate-50"
                                                        >
                                                            <td className="p-3 border border-slate-100 text-center text-slate-500">
                                                                {operationIndex + 1}
                                                            </td>

                                                            <td className="p-3 border border-slate-100">
                                                                {op.line_balance_no || '-'}
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-slate-800">
                                                                {op.operation_name || '-'}
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-center">
                                                                {op.skill_level || '-'}
                                                            </td>

                                                            <td className="p-3 border border-slate-100">
                                                                {op.machine_name || '-'}
                                                            </td>

                                                            <td className="p-3 border border-slate-100">
                                                                {op.machine_code || '-'}
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-right font-bold">
                                                                {toNumber(op.sam_gsd, 0).toFixed(2)}
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-right">
                                                                {toNumber(op.salary_coefficient, 0).toFixed(2) ?? 0}
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-center">
                                                                {op.manpower ?? '-'}
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-right">
                                                                {toNumber(op.standard_price_preview, 0).toFixed(2)}
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-center">
                                                                {requiredEfficiency
                                                                    ? `${(requiredEfficiency * 100).toFixed(0)}%`
                                                                    : '-'}
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-right text-blue-700 font-bold">
                                                                {toNumber(op.adjusted_sam_preview, 0).toFixed(2)}
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-center">
                                                                {(toNumber(op.utilization_rate_preview, 0) * 100).toFixed(0)}%
                                                            </td>

                                                            <td className="p-3 border border-slate-100 text-center">
                                                                {op.total_actions || 0}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsGroupOverviewOpen(false)}
                                className="px-5 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}