import { useEffect, useMemo, useState } from 'react';
import {
    GsdAnalysisCalculateResult,
    GsdAnalysisPayload,
    GsdAnalysisRow,
    MachineEquipment,
    SourceMaster,
} from '../types';
import { sourceService } from '../services/source.service';
import { machineEquipmentService } from '../services/machineEquipment.service';
import { gsdAnalysisService } from '../services/gsdAnalysis.service';

type SourceActionMap = Record<number, GsdAnalysisRow[]>;

export function useGsdAnalysis() {
    const [sources, setSources] = useState<SourceMaster[]>([]);
    const [machines, setMachines] = useState<MachineEquipment[]>([]);

    const [popupSourceId, setPopupSourceId] = useState<number | null>(null);
    const [sourceActionMap, setSourceActionMap] = useState<SourceActionMap>({});
    const [analysisRows, setAnalysisRows] = useState<GsdAnalysisRow[]>([]);

    const [loadingMasterData, setLoadingMasterData] = useState(false);
    const [loadingSourceActions, setLoadingSourceActions] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [saving, setSaving] = useState(false);

    const [result, setResult] = useState<GsdAnalysisCalculateResult | null>(null);

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
                message: 'Vui lòng nhập Bước cho ít nhất một thao tác.',
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

    const calculate = async (
        form: Omit<GsdAnalysisPayload, 'sourceId' | 'details'>
    ) => {
        const payload = buildPayload(form);

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
        form: Omit<GsdAnalysisPayload, 'sourceId' | 'details'>
    ) => {
        const payload = buildPayload(form);

        setSaving(true);

        try {
            const response = await gsdAnalysisService.createAnalysis(payload);
            setResult(response.data);
            return response;
        } finally {
            setSaving(false);
        }
    };


    const updatePopupFrequency = (
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
                    frequency: value === '' ? 0 : Number(value),
                };
            }),
        }));

        setResult(null);
    };

    useEffect(() => {
        loadMasterData();
    }, []);

    return {
        sources,
        machines,

        popupSourceId,
        popupRows,
        sourceActionMap,
        selectedDraftRows,

        analysisRows,

        loadingMasterData,
        loadingSourceActions,
        calculating,
        saving,
        result,

        selectPopupSource,
        updatePopupStepNo,
        uncheckPopupRow,
        takeSelectedActionsToAnalysis,
        clearAnalysisRows,

        calculate,
        save,
        updatePopupFrequency
    };
}