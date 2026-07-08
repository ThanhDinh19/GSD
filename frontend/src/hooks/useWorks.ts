import { useEffect, useState } from 'react';
import { Work, WorkPayload, MasterStatus } from '../types';
import { workService } from '../services/work.service';
import { statusService } from '../services/status.service';

export function useWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStatuses = async () => {
    const data = await statusService.getStatuses();
    setStatuses(data);
  };

  const loadWorks = async () => {
    setLoading(true);

    try {
      const data = await workService.getWorks();
      setWorks(data);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([
      loadStatuses(),
      loadWorks(),
    ]);
  };

  const createWork = async (payload: WorkPayload) => {
    await workService.createWork(payload);
    await loadWorks();
  };

  const updateWork = async (id: number, payload: WorkPayload) => {
    await workService.updateWork(id, payload);
    await loadWorks();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    works,
    statuses,
    loading,
    refresh,
    createWork,
    updateWork,
  };
}