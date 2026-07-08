import { useEffect, useState } from 'react';
import { ProductCate, ProductCatePayload, MasterStatus } from '../types';
import { productCateService } from '../services/productCate.service';
import { statusService } from '../services/status.service';

export function useProductCates() {
  const [productCates, setProductCate] = useState<ProductCate[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStatuses = async () => {
    const data = await statusService.getStatuses();
    setStatuses(data);
  };

  const loadProductCates = async () => {
    setLoading(true);

    try {
      const data = await productCateService.getProductCates();
      setProductCate(data);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([
      loadStatuses(),
      loadProductCates(),
    ]);
  };

  const createProductCate = async (payload: ProductCatePayload) => {
    await productCateService.createProductCate(payload);
    await loadProductCates();
  };

  const updateProductCate = async (id: number, payload: ProductCatePayload) => {
    await productCateService.updateProductCate(id, payload);
    await loadProductCates();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    productCates,
    statuses,
    loading,
    refresh,
    createProductCate,
    updateProductCate,
  };
}