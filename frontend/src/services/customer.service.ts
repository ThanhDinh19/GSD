import { request } from './httpClient';
import { Customer, CustomerPayload } from '../types';

export const customerService = {
  getCustomers() {
    return request<Customer[]>('/api/customers');
  },

  createCustomer(payload: CustomerPayload) {
    return request<{ message: string }>('/api/customers', {
      method: 'POST',
      body: payload,
    });
  },

  updateCustomer(id: number, payload: CustomerPayload) {
    return request<{ message: string }>(`/api/customers/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};