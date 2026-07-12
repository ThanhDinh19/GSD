import { useEffect, useState } from 'react';
import {
  CreateOperationClusterPayload,
  GsdOption,
  OperationClusterDetail,
  OperationClusterHeader,
  GsdActionDetail
} from '../types';

import { operationClusterService } from '../services/operationCluster.service';

export function useOperationClusters() {
  const [items, setItems] = useState<OperationClusterHeader[]>([]);
  const [gsdOptions, setGsdOptions] = useState<GsdOption[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<OperationClusterDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    setLoading(true);

    try {
      const data = await operationClusterService.getAll();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const loadGsdOptions = async () => {
    const data = await operationClusterService.getGsdOptions();
    setGsdOptions(data);
  };

  const loadGsdActions = async (id: number): Promise<GsdActionDetail[]> => {
    return operationClusterService.getGsdActions(id);
  };

  const loadDetail = async (id: number) => {
    setLoading(true);

    try {
      const data = await operationClusterService.getById(id);

      console.log('loadDetail data:', data);

      setSelectedDetail(data);

      return data;
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (payload: CreateOperationClusterPayload) => {
    setSaving(true);

    try {
      const data = await operationClusterService.create(payload);
      setSelectedDetail(data);
      await loadItems();
      return data;
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async (
    id: number,
    payload: CreateOperationClusterPayload
  ) => {
    setSaving(true);

    try {
      return await operationClusterService.update(id, payload);
    } finally {
      setSaving(false);
    }
  };

  const copyItem = async (payload: CreateOperationClusterPayload) => {
    setSaving(true);

    try {
      return await operationClusterService.copy(payload);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadItems();
    loadGsdOptions();
  }, []);

  return {
    items,
    gsdOptions,
    loadGsdActions,
    selectedDetail,
    setSelectedDetail,
    loading,
    saving,
    loadItems,
    loadGsdOptions,
    loadDetail,
    createItem,
    updateItem,
    copyItem,
  };
}