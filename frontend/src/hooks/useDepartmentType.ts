import { useEffect, useState } from 'react';
import { DepartmentType_test, DepartmentTypePayload_test, MasterStatus } from '../types';
import { departmenTypeService } from '../services/departmentType.service';
import { statusService } from '../services/status.service';

export function useDepartmentType() {
  const [departmentTypes, setDepartmentType] = useState<DepartmentType_test[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStatuses = async () => {
    const data = await statusService.getStatuses();
    setStatuses(data);
  };

  const loadDepartmentTypes = async () => {
    setLoading(true);

    try {
      const data = await departmenTypeService.getDepartmentType();
      setDepartmentType(data);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([
      loadStatuses(),
      loadDepartmentTypes(),
    ]);
  };

  const createDepartmentType = async (payload: DepartmentTypePayload_test) => {
    await departmenTypeService.createDepartmentType(payload);
    await loadDepartmentTypes();
  };

  const updateDepartmentType = async (id: number, payload: DepartmentTypePayload_test) => {
    await departmenTypeService.updateDepartmentType(id, payload);
    await loadDepartmentTypes();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    departmentTypes,
    statuses,
    loading,
    refresh,
    createDepartmentType,
    updateDepartmentType,
  };
}