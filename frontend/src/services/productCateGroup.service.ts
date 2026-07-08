import { request } from './httpClient';
import { ProductCateGroup, ProductCateGroupPayload } from '../types';

export const productCateGroupService = {
  getProductCateGroups() {
    return request<ProductCateGroup[]>('/api/productCateGroup');
  },

  createProductCateGroup(payload: ProductCateGroupPayload) {
    return request<{ message: string }>('/api/productCateGroup', {
      method: 'POST',
      body: payload,
    });
  },

  updateProductCateGroup(id: number, payload: ProductCateGroupPayload) {
    return request<{ message: string }>(`/api/productCateGroup/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};