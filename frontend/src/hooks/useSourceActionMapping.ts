import { useEffect, useState } from 'react';
import {
  GsdCode,
  SourceActionDetail,
  SourceMaster,
} from '../types';
import { sourceService } from '../services/source.service';
import { gsdCodeService } from '../services/gsdCode.service';
import { sourceActionMappingService } from '../services/sourceActionMapping.service';

export function useSourceActionMapping() {
  const [sources, setSources] = useState<SourceMaster[]>([]);
  const [gsdCodes, setGsdCodes] = useState<GsdCode[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [details, setDetails] = useState<SourceActionDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const totalActions = details.length;
  const totalTmu = details.reduce((sum, item) => sum + Number(item.tmu || 0), 0);

  const loadMasterData = async () => {
    const [sourceData, gsdCodeData] = await Promise.all([
      sourceService.getSources(),
      gsdCodeService.getActiveGsdCodes(),
    ]);

    setSources(sourceData);
    setGsdCodes(gsdCodeData);
  };

  const loadMapping = async (sourceId: number) => {
    setLoading(true);

    try {
      const data = await sourceActionMappingService.getMappingBySourceId(sourceId);
      setDetails(
        data.details.map((item, index) => ({
          ...item,
          lineNo: index + 1,
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const selectSource = async (sourceId: number) => {
    setSelectedSourceId(sourceId);
    await loadMapping(sourceId);
  };

  const addGsdCodesToDetails = (selectedGsdCodes: GsdCode[]) => {
    const newDetails: SourceActionDetail[] = selectedGsdCodes.map((item, index) => ({
      lineNo: details.length + index + 1,
      gsdCodeId: item.id,
      actionName: item.actionName,
      gsdCode: item.gsdCode || '',
      codeNew: item.codeNew || '',
      frequency: item.frequency ?? 1,
      tmu: item.tmu || 0,
      note: item.note || '',
    }));

    setDetails([...details, ...newDetails]);
  };

  const removeDetail = (index: number) => {
    const nextDetails = details
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...item,
        lineNo: i + 1,
      }));

    setDetails(nextDetails);
  };

  const clearDetails = () => {
    setDetails([]);
  };

  const saveMapping = async () => {
    if (!selectedSourceId) {
      throw new Error('Vui lòng chọn source.');
    }

    await sourceActionMappingService.saveMapping(selectedSourceId, {
      details: details.map((item, index) => ({
        ...item,
        lineNo: index + 1,
      })),
    });

    await loadMapping(selectedSourceId);
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  return {
    sources,
    gsdCodes,
    selectedSourceId,
    details,
    loading,
    totalActions,
    totalTmu,
    selectSource,
    addGsdCodesToDetails,
    removeDetail,
    clearDetails,
    saveMapping,
  };
}