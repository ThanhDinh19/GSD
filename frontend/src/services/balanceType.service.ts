import { request } from './httpClient';
import { BalanceType, BalanceTypePayload } from '../types';

export const balanceTypeService = {
  getBalanceTypes() {
    return request<BalanceType[]>('/api/balance-types');
  },

  createBalanceType(payload: BalanceTypePayload) {
    return request<{ message: string }>('/api/balance-types', {
      method: 'POST',
      body: payload,
    });
  },

  updateBalanceType(id: number, payload: BalanceTypePayload) {
    return request<{ message: string }>(`/api/balance-types/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};
