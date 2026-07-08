import { request } from './httpClient';
import { ProductCate, ProductCatePayload } from '../types';

export const productCateService = {
  getProductCates() {
    return request<ProductCate[]>('/api/productCate');
  },

  createProductCate(payload: ProductCatePayload) {
    return request<{ message: string }>('/api/productCate', {
      method: 'POST',
      body: payload,
    });
  },

  updateProductCate(id: number, payload: ProductCatePayload) {
    return request<{ message: string }>(`/api/productCate/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};