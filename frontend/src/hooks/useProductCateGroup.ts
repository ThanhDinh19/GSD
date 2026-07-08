import { useEffect, useState } from 'react';
import { ProductCateGroup, ProductCateGroupPayload, MasterStatus } from '../types';
import { productCateGroupService } from '../services/productCateGroup.service';
import { statusService } from '../services/status.service';

export function useProductCateGroups() {
  const [productCateGroups, setProductCateGroups] = useState<ProductCateGroup[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStatuses = async () => {
    const data = await statusService.getStatuses();
    setStatuses(data);
  };

  const loadProductCateGroups = async () => {
    setLoading(true);

    try {
      const data = await productCateGroupService.getProductCateGroups();
      setProductCateGroups(data);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([
      loadStatuses(),
      loadProductCateGroups(),
    ]);
  };

  const createProductCateGroup = async (payload: ProductCateGroupPayload) => {
    await productCateGroupService.createProductCateGroup(payload);
    await loadProductCateGroups();
  };

  const updateProductCateGroup = async (id: number, payload: ProductCateGroupPayload) => {
    await productCateGroupService.updateProductCateGroup(id, payload);
    await loadProductCateGroups();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    productCateGroups,
    statuses,
    loading,
    refresh,
    createProductCateGroup,
    updateProductCateGroup,
  };
}