import { useEffect, useMemo, useState } from 'react';
import {
    GsdAnalysisCalculateResult,
    GsdAnalysisPayload,
    GsdAnalysisRow,
    MachineEquipment,
    SourceMaster,
    GsdAnalysisSummary,
    MachineEquipment_test,
} from '../types';
import { sourceService } from '../services/source.service';
import { machineEquipmentService } from '../services/machineEquipment.service';
import { gsdAnalysisService } from '../services/gsdAnalysis.service';


type SourceActionMap = Record<number, GsdAnalysisRow[]>;

export function useGsdAnalysis() {
    const [sources, setSources] = useState<SourceMaster[]>([]);
    const [machines, setMachines] = useState<MachineEquipment[]>([]);
    const [machines_test, setMachines_test] = useState<MachineEquipment_test[]>([]);

    const [popupSourceId, setPopupSourceId] = useState<number | null>(null);
    const [sourceActionMap, setSourceActionMap] = useState<SourceActionMap>({});
    const [analysisRows, setAnalysisRows] = useState<GsdAnalysisRow[]>([]);

    const [loadingMasterData, setLoadingMasterData] = useState(false);
    const [loadingMachines_test, setLoadingMachines_test] = useState(false);
    const [loadingSourceActions, setLoadingSourceActions] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [saving, setSaving] = useState(false);

    const [result, setResult] = useState<GsdAnalysisCalculateResult | null>(null);

    const [analyses, setAnalyses] = useState<GsdAnalysisSummary[]>([]);
    const [loadingAnalyses, setLoadingAnalyses] = useState(false);

    const [loadingAnalysisDetail, setLoadingAnalysisDetail] =
        useState(false);

    const clearResult = () => {
        setResult(null);
    };

    const popupRows = useMemo(() => {
        if (!popupSourceId) return [];
        return sourceActionMap[popupSourceId] || [];
    }, [popupSourceId, sourceActionMap]);

    const selectedDraftRows = useMemo(() => {
        return Object.values(sourceActionMap)
            .flat()
            .filter((row) => {
                return row.stepNo !== null &&
                    row.stepNo !== undefined &&
                    String(row.stepNo).trim() !== '' &&
                    row.isSelected;
            })
            .map((row) => ({
                ...row,
                stepNo: Number(row.stepNo),
            }))
            .sort((a, b) => Number(a.stepNo) - Number(b.stepNo));
    }, [sourceActionMap]);


    const loadAnalyses = async () => {
        setLoadingAnalyses(true);

        try {
            const data = await gsdAnalysisService.getAnalyses();
            setAnalyses(data);
        } finally {
            setLoadingAnalyses(false);
        }
    };

    function normalizeStepNo(value: number | string | null | undefined) {
        if (value === null || value === undefined) return null;

        const raw = String(value).trim();

        if (raw === '') return null;

        const numberValue = Number(raw);

        if (!Number.isInteger(numberValue)) {
            return NaN;
        }

        return numberValue;
    }

    const validateDraftSteps = () => {
        const selectedRows = Object.values(sourceActionMap)
            .flat()
            .filter((row) => row.stepNo !== null && row.stepNo !== undefined && String(row.stepNo).trim() !== '');

        if (selectedRows.length === 0) {
            return {
                ok: false,
                message: 'Vui lòng tick chọn ít nhất một thao tác.',
            };
        }

        const usedSteps = new Set<number>();

        for (const row of selectedRows) {
            const stepNo = normalizeStepNo(row.stepNo);

            if (Number.isNaN(stepNo)) {
                return {
                    ok: false,
                    message: `Bước của thao tác "${row.actionName}" không hợp lệ. Vui lòng nhập số nguyên lớn hơn 0.`,
                };
            }

            if (stepNo === null || stepNo <= 0) {
                return {
                    ok: false,
                    message: `Bước của thao tác "${row.actionName}" phải lớn hơn 0.`,
                };
            }

            if (usedSteps.has(stepNo)) {
                return {
                    ok: false,
                    message: `Bước ${stepNo} đã được sử dụng. Vui lòng nhập bước khác.`,
                };
            }

            usedSteps.add(stepNo);
        }

        return {
            ok: true,
            message: '',
        };
    };

    const loadMasterData = async () => {
        setLoadingMasterData(true);

        try {
            const [sourceData, machineData] = await Promise.all([
                sourceService.getSources(),
                machineEquipmentService.getMachineEquipments(),
            ]);

            setSources(sourceData.filter((item) => item.statusId === 0));
            setMachines(machineData.filter((item) => item.statusId === 0));
        } finally {
            setLoadingMasterData(false);
        }
    };

    const loadMachines_test = async () => {
        setLoadingMachines_test(true);
        try {
            const data = await machineEquipmentService.getMachineEquipments_test();
            setMachines_test(data);
        } finally {
            setLoadingMachines_test(false);
        }
    }

    const isStepNoUsed = (
        stepNo: number,
        currentSourceId: number,
        currentRowIndex: number
    ) => {
        return Object.entries(sourceActionMap).some(([sourceIdText, rows]) => {
            const sourceId = Number(sourceIdText);

            return rows.some((row, rowIndex) => {
                if (sourceId === currentSourceId && rowIndex === currentRowIndex) {
                    return false;
                }

                return Number(row.stepNo) === Number(stepNo);
            });
        });
    };

    const selectPopupSource = async (sourceId: number) => {
        setPopupSourceId(sourceId);
        setResult(null);

        if (sourceActionMap[sourceId]) {
            return;
        }

        setLoadingSourceActions(true);

        try {
            const source = sources.find((item) => item.id === sourceId);
            const data = await gsdAnalysisService.getSourceActions(sourceId);

            setSourceActionMap((prev) => ({
                ...prev,
                [sourceId]: data.map((item) => ({
                    ...item,
                    sourceId,
                    sourceCode: source?.sourceCode || '',
                    sourceName: source?.sourceName || '',
                    stepNo: null,
                    frequency: item.frequency ?? 1,
                    isSelected: false,
                })),
            }));
        } finally {
            setLoadingSourceActions(false);
        }
    };

    const updatePopupStepNo = (
        sourceId: number,
        rowIndex: number,
        value: string
    ) => {
        setSourceActionMap((prev) => ({
            ...prev,
            [sourceId]: (prev[sourceId] || []).map((row, index) => {
                if (index !== rowIndex) return row;

                return {
                    ...row,
                    stepNo: value,
                    isSelected: value.trim() !== '',
                };
            }),
        }));

        setResult(null);
    };

    const uncheckPopupRow = (sourceId: number, rowIndex: number) => {
        setSourceActionMap((prev) => ({
            ...prev,
            [sourceId]: (prev[sourceId] || []).map((row, index) => {
                if (index !== rowIndex) return row;

                return {
                    ...row,
                    stepNo: '',
                    isSelected: false,
                };
            }),
        }));

        setResult(null);
    };

    const takeSelectedActionsToAnalysis = () => {
        const validation = validateDraftSteps();

        if (!validation.ok) {
            alert(validation.message);
            return 0;
        }

        setAnalysisRows(selectedDraftRows);
        setResult(null);

        return selectedDraftRows.length;
    };

    const clearAnalysisRows = () => {
        setAnalysisRows([]);
        setResult(null);
    };

    const buildPayload = (
        form: Omit<GsdAnalysisPayload, 'sourceId' | 'details'>
    ): GsdAnalysisPayload => {
        const sourceIds = Array.from(
            new Set(
                analysisRows
                    .map((row) => row.sourceId)
                    .filter((id): id is number => id !== null && id !== undefined)
            )
        );

        return {
            ...form,
            sourceId: sourceIds.length === 1 ? sourceIds[0] : null,
            details: analysisRows.map((row) => ({
                sourceActionDetailId: row.sourceActionDetailId,
                gsdCodeId: row.gsdCodeId,
                gsdCode: row.gsdCode,
                actionName: row.actionName,
                tmu: row.tmu,
                frequency: row.frequency,
                stepNo: Number(row.stepNo),
                note: row.note,
                isSelected: true,
            })),
        };
    };

    const loadAnalysisForEdit = async (
        id: number
    ) => {
        setLoadingAnalysisDetail(true);

        try {
            const detail =
                await gsdAnalysisService.getAnalysisById(id);

            return applyAnalysisDetailToState(
                detail
            );
        } finally {
            setLoadingAnalysisDetail(false);
        }
    };
    const calculate = async (form: Omit<GsdAnalysisPayload, 'sourceId' | 'details'>) => {
        const payload = buildPayload(form);

        // setResult(null);
        setCalculating(true);

        try {
            const data = await gsdAnalysisService.calculate(payload);
            setResult(data);
            return data;
        } finally {
            setCalculating(false);
        }
    };

    const save = async (
        form: Omit<
            GsdAnalysisPayload,
            'sourceId' | 'details'
        >,
        analysisId?: number | null
    ) => {
        const payload = buildPayload(form);

        setSaving(true);

        try {
            const response = analysisId
                ? await gsdAnalysisService.updateAnalysis(
                    analysisId,
                    payload
                )
                : await gsdAnalysisService.createAnalysis(
                    payload
                );

            setResult(
                response.data as unknown as
                GsdAnalysisCalculateResult
            );

            await loadAnalyses();

            return response;
        } finally {
            setSaving(false);
        }
    };

    const loadAnalysisForCopy = async (
        id: number
    ) => {
        setLoadingAnalysisDetail(true);

        try {
            const response =
                await gsdAnalysisService.getAnalysisCopyDraft(
                    id
                );

            const detail = response.data;

            // Backend đã thêm _COPY.
            // Fallback để tránh thiếu trong trường hợp backend chưa thêm.
            const currentName = String(
                detail.operationName || ''
            ).trim();

            const operationName =
                currentName
                    .toUpperCase()
                    .endsWith('_COPY')
                    ? currentName
                    : `${currentName || 'Công đoạn'}_COPY`;

            const copyDetail = {
                ...detail,
                operationName,
            };

            return applyAnalysisDetailToState(
                copyDetail
            );
        } finally {
            setLoadingAnalysisDetail(false);
        }
    };


    const getNextStepNo = (map: SourceActionMap) => {
        const selectedRows = Object.values(map)
            .flat()
            .filter((row) => row.isSelected);

        if (selectedRows.length === 0) return 1;

        const maxStep = selectedRows.reduce((max, row) => {
            const stepNo = Number(row.stepNo || 0);
            return stepNo > max ? stepNo : max;
        }, 0);

        return maxStep + 1;
    };

    const renumberSelectedRows = (map: SourceActionMap): SourceActionMap => {
        const selectedRows: Array<{
            sourceId: number;
            rowIndex: number;
            stepNo: number;
        }> = [];

        Object.entries(map).forEach(([sourceIdText, rows]) => {
            const sourceId = Number(sourceIdText);

            rows.forEach((row, rowIndex) => {
                if (row.isSelected) {
                    selectedRows.push({
                        sourceId,
                        rowIndex,
                        stepNo: Number(row.stepNo || 0),
                    });
                }
            });
        });

        selectedRows.sort((a, b) => a.stepNo - b.stepNo);

        const nextMap: SourceActionMap = {};

        Object.entries(map).forEach(([sourceIdText, rows]) => {
            const sourceId = Number(sourceIdText);
            nextMap[sourceId] = rows.map((row) => ({ ...row }));
        });

        selectedRows.forEach((item, index) => {
            nextMap[item.sourceId][item.rowIndex].stepNo = index + 1;
        });

        return nextMap;
    };

    const togglePopupActionRow = (
        sourceId: number,
        rowIndex: number,
        checked: boolean
    ) => {
        setSourceActionMap((prev) => {
            let nextMap: SourceActionMap = {
                ...prev,
                [sourceId]: (prev[sourceId] || []).map((row, index) => {
                    if (index !== rowIndex) return row;

                    if (checked) {
                        return {
                            ...row,
                            isSelected: true,
                            stepNo: getNextStepNo(prev),
                        };
                    }

                    return {
                        ...row,
                        isSelected: false,
                        stepNo: '',
                    };
                }),
            };

            if (!checked) {
                nextMap = renumberSelectedRows(nextMap);
            }

            return nextMap;
        });

        setResult(null);
    };

    const updatePopupFrequency = (
        sourceId: number,
        rowIndex: number,
        value: string
    ) => {
        const nextFrequency =
            value.trim() === '' ? 1 : Math.max(1, Number(value) || 1);

        setSourceActionMap((prev) => ({
            ...prev,
            [sourceId]: (prev[sourceId] || []).map((row, index) => {
                if (index !== rowIndex) return row;

                return {
                    ...row,
                    frequency: nextFrequency,
                };
            }),
        }));

        setResult(null);
    };

    const applyAnalysisDetailToState = (
        detail: any
    ) => {
        const rows: GsdAnalysisRow[] = (
            detail.details || []
        ).map((item: any, index: number) => ({
            lineNo: Number(
                item.lineNo ?? index + 1
            ),

            sourceId:
                item.sourceId ??
                detail.sourceId ??
                null,

            sourceCode:
                item.sourceCode ??
                detail.sourceCode ??
                '',

            sourceName:
                item.sourceName ??
                detail.sourceName ??
                '',

            sourceActionDetailId:
                item.sourceActionDetailId ??
                null,

            gsdCodeId:
                item.gsdCodeId ??
                null,

            gsdCode:
                item.gsdCode ??
                '',

            codeNew:
                item.codeNew ??
                null,

            actionName:
                item.actionName ??
                '',

            tmu: Number(
                item.tmu || 0
            ),

            frequency: Number(
                item.frequency ?? 1
            ),

            stepNo:
                item.stepNo === null ||
                    item.stepNo === undefined
                    ? null
                    : Number(item.stepNo),

            note:
                item.note ?? '',

            isSelected:
                item.isSelected !== false,
        }));

        setAnalysisRows(rows);

        const nextSourceMap: SourceActionMap = {};

        rows.forEach((row) => {
            const sourceId = Number(row.sourceId);

            if (!sourceId) return;

            if (!nextSourceMap[sourceId]) {
                nextSourceMap[sourceId] = [];
            }

            nextSourceMap[sourceId].push(row);
        });

        setSourceActionMap(nextSourceMap);

        setPopupSourceId(
            rows[0]?.sourceId
                ? Number(rows[0].sourceId)
                : null
        );

        const resultDetails:
            GsdAnalysisCalculateResult['details'] =
            rows.map((row, index) => {
                const tmu = Number(row.tmu || 0);
                const frequency = Number(
                    row.frequency ?? 1
                );

                return {
                    lineNo: Number(
                        row.lineNo ?? index + 1
                    ),

                    sourceActionDetailId:
                        row.sourceActionDetailId ??
                        null,

                    gsdCodeId:
                        row.gsdCodeId ??
                        null,

                    gsdCode:
                        row.gsdCode ??
                        null,

                    actionName:
                        row.actionName || '',

                    tmu,
                    frequency,

                    stepNo:
                        row.stepNo === null ||
                            row.stepNo === undefined ||
                            row.stepNo === ''
                            ? null
                            : Number(row.stepNo),

                    note:
                        row.note ?? null,

                    isSelected:
                        row.isSelected,

                    seconds:
                        (tmu * frequency) / 27.8,
                };
            });

        setResult({
            machine: null,

            stitchCount: Number(
                detail.stitchCount || 0
            ),

            machineSpeed: Number(
                detail.machineSpeed || 0
            ),

            machineVelocity: Number(
                detail.machineVelocity || 0
            ),

            allowance: Number(
                detail.allowance || 0
            ),

            totalTmu: Number(
                detail.totalTmu || 0
            ),

            totalManualSeconds: Number(
                detail.totalManualSeconds || 0
            ),

            machineSeconds: Number(
                detail.machineSeconds || 0
            ),

            totalSmvBeforeDifficulty: Number(
                detail.totalSmvBeforeDifficulty || 0
            ),

            difficultySeconds: Number(
                detail.difficultySeconds || 0
            ),

            finalSmv: Number(
                detail.finalSmv || 0
            ),

            skillGrade: Number(
                detail.skillGrade || 0
            ),

            details: resultDetails,
        });

        return detail;
    };

    useEffect(() => {
        loadMasterData();
        loadMachines_test();
        loadAnalyses();
    }, []);



    return {
        sources,
        machines,

        machines_test,

        popupSourceId,
        popupRows,
        sourceActionMap,
        selectedDraftRows,

        analysisRows,

        loadingMasterData,

        loadMachines_test,

        loadingMachines_test,

        loadingSourceActions,
        calculating,
        saving,
        result,

        selectPopupSource,
        updatePopupStepNo,
        uncheckPopupRow,
        takeSelectedActionsToAnalysis,
        clearAnalysisRows,
        clearResult,

        calculate,
        save,
        updatePopupFrequency,

        analyses,
        loadingAnalyses,
        loadAnalyses,
        togglePopupActionRow,
        loadingAnalysisDetail,
        loadAnalysisForEdit,
        loadAnalysisForCopy
    };
}