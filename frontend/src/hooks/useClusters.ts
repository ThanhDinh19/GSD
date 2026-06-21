import { useEffect, useState } from 'react';
import { Cluster, ClusterPayload, MasterStatus } from '../types';
import { clusterService } from '../services/cluster.service';
import { statusService } from '../services/status.service';

export function useClusters() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStatuses = async () => {
    const data = await statusService.getStatuses();
    setStatuses(data);
  };

  const loadClusters = async () => {
    setLoading(true);

    try {
      const data = await clusterService.getClusters();
      setClusters(data);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([
      loadStatuses(),
      loadClusters(),
    ]);
  };

  const createCluster = async (payload: ClusterPayload) => {
    await clusterService.createCluster(payload);
    await loadClusters();
  };

  const updateCluster = async (id: number, payload: ClusterPayload) => {
    await clusterService.updateCluster(id, payload);
    await loadClusters();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    clusters,
    statuses,
    loading,
    refresh,
    createCluster,
    updateCluster,
  };
}