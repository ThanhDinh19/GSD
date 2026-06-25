
import { useEffect, useState } from 'react';
import { MasterStatus, SourceMaster, SourceMasterPayload } from '../types';
import { sourceService } from '../services/source.service';
import { statusService } from '../services/status.service';

export function useSources() {
  const [sources, setSources] = useState<SourceMaster[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSources = async () => {
    setLoading(true);

    try {
      const data = await sourceService.getSources();
      setSources(data);
    } finally {
      setLoading(false);
    }
  };

  const loadStatuses = async () => {
    const data = await statusService.getStatuses();
    setStatuses(data);
  };

  const refresh = async () => {
    await Promise.all([
      loadSources(),
      loadStatuses(),
    ]);
  };

  const createSource = async (payload: SourceMasterPayload) => {
    await sourceService.createSource(payload);
    await loadSources();
  };

  const updateSource = async (id: number, payload: SourceMasterPayload) => {
    await sourceService.updateSource(id, payload);
    await loadSources();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    sources,
    statuses,
    loading,
    loadSources,
    refresh,
    createSource,
    updateSource,
  };
}