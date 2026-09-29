import { useEffect, useState } from 'react';
import { BalanceType, BalanceTypePayload, MasterStatus } from '../types';
import { balanceTypeService } from '../services/balanceType.service';
import { statusService } from '../services/status.service';

export function useBalanceTypes() {
  const [balanceTypes, setBalanceTypes] = useState<BalanceType[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStatuses = async () => {
    const data = await statusService.getStatuses();
    setStatuses(data);
  };

  const loadBalanceTypes = async () => {
    setLoading(true);

    try {
      const data = await balanceTypeService.getBalanceTypes();
      setBalanceTypes(data);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([
      loadStatuses(),
      loadBalanceTypes(),
    ]);
  };

  const createBalanceType = async (payload: BalanceTypePayload) => {
    await balanceTypeService.createBalanceType(payload);
    await loadBalanceTypes();
  };

  const updateBalanceType = async (id: number, payload: BalanceTypePayload) => {
    await balanceTypeService.updateBalanceType(id, payload);
    await loadBalanceTypes();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    balanceTypes,
    statuses,
    loading,
    refresh,
    createBalanceType,
    updateBalanceType,
  };
}
