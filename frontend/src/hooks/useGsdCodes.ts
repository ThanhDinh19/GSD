import { useEffect, useState } from 'react';
import { GsdCode, GsdCodePayload, MasterStatus } from '../types';
import { gsdCodeService } from '../services/gsdCode.service';
import { statusService } from '../services/status.service';

export function useGsdCodes() {
    const [gsdCodes, setGsdCodes] = useState<GsdCode[]>([]);
    const [statuses, setStatuses] = useState<MasterStatus[]>([]);
    const [loading, setLoading] = useState(false);

    const loadStatuses = async () => {
        const data = await statusService.getStatuses();
        setStatuses(data);
    };

    const loadGsdCodes = async () => {
        setLoading(true);

        try {
            const data = await gsdCodeService.getGsdCodes();
            setGsdCodes(data);
        } finally {
            setLoading(false);
        }
    };

    const refresh = async () => {
        await Promise.all([
            loadStatuses(),
            loadGsdCodes(),
        ]);
    };

    const createGsdCode = async (payload: GsdCodePayload) => {
        await gsdCodeService.createGsdCode(payload);
        await loadGsdCodes();
    };

    const updateGsdCode = async (id: number, payload: GsdCodePayload) => {
        await gsdCodeService.updateGsdCode(id, payload);
        await loadGsdCodes();
    };

    const importGsdCodesFromExcel = async (file: File) => {
        const result = await gsdCodeService.importGsdCodesExcel(file);
        await loadGsdCodes();
        return result;
    };

    useEffect(() => {
        refresh();
    }, []);

    return {
        gsdCodes,
        statuses,
        loading,
        loadGsdCodes,
        refresh,
        createGsdCode,
        updateGsdCode,
        importGsdCodesFromExcel,
    };
}