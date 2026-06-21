import { useEffect, useState } from 'react';
import {
  Cluster,
  MachineEquipment,
  MachineEquipmentPayload,
  MasterStatus,
} from '../types';
import { machineEquipmentService } from '../services/machineEquipment.service';
import { statusService } from '../services/status.service';
import { clusterService } from '../services/cluster.service';

export function useMachineEquipments() {
  const [machineEquipments, setMachineEquipments] = useState<MachineEquipment[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMachineEquipments = async () => {
    setLoading(true);

    try {
      const data = await machineEquipmentService.getMachineEquipments();
      setMachineEquipments(data);
    } finally {
      setLoading(false);
    }
  };

  const loadMasterData = async () => {
    const [clusterData, statusData] = await Promise.all([
      clusterService.getClusters(),
      statusService.getStatuses(),
    ]);

    setClusters(clusterData);
    setStatuses(statusData);
  };

  const refresh = async () => {
    await Promise.all([
      loadMasterData(),
      loadMachineEquipments(),
    ]);
  };

  const createMachineEquipment = async (payload: MachineEquipmentPayload) => {
    await machineEquipmentService.createMachineEquipment(payload);
    await loadMachineEquipments();
  };

  const updateMachineEquipment = async (id: number, payload: MachineEquipmentPayload) => {
    await machineEquipmentService.updateMachineEquipment(id, payload);
    await loadMachineEquipments();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    machineEquipments,
    clusters,
    statuses,
    loading,
    refresh,
    createMachineEquipment,
    updateMachineEquipment,
  };
}