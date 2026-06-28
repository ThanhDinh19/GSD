import { useEffect, useState } from 'react';
import {
  Cluster,
  MachineEquipment,
  MachineEquipment_test,
  MachineEquipmentPayload,
  MasterStatus,
} from '../types';
import { machineEquipmentService } from '../services/machineEquipment.service';
import { statusService } from '../services/status.service';
import { clusterService } from '../services/cluster.service';

export function useMachineEquipments() {
  const [machineEquipments, setMachineEquipments] = useState<MachineEquipment[]>([]);
  const [machineEquiments_test, setMachineEquipments_test] = useState<MachineEquipment_test[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [loading_test, setLoading_test] = useState(false);

  const loadMachineEquipments = async () => {
    setLoading(true);

    try {
      const data = await machineEquipmentService.getMachineEquipments();
      setMachineEquipments(data);
    } finally {
      setLoading(false);
    }
  };

  const loadMachineEquipments_test = async () => {
    setLoading_test(true);

    try{
      const data = await machineEquipmentService.getMachineEquipments_test();
      setMachineEquipments_test(data);
    } finally {
      setLoading(false);
    }
  }

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
      loadMachineEquipments_test(),
    ]);
  };

  const createMachineEquipment = async (payload: MachineEquipmentPayload) => {
    await machineEquipmentService.createMachineEquipment(payload);
    await loadMachineEquipments_test();
  };

  const updateMachineEquipment = async (id: number, payload: MachineEquipmentPayload) => {
    await machineEquipmentService.updateMachineEquipment(id, payload);
    await loadMachineEquipments_test();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    machineEquipments,
    machineEquiments_test,
    clusters,
    statuses,
    loading,
    loading_test,
    refresh,
    createMachineEquipment,
    updateMachineEquipment,
  };
}