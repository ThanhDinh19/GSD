import { request } from './httpClient';
import { SalaryCoefficient, SalaryCoefficientPayload } from '../types';

export const salaryCoefficientService = {
  getSalaryCoefficients() {
    return request<SalaryCoefficient[]>('/api/salary-coefficient');
  },

  createSalaryCoefficient(payload: SalaryCoefficientPayload) {
    return request<{ message: string }>('/api/salary-coefficient', {
      method: 'POST',
      body: payload,
    });
  },

  updateSalaryCoefficient(id: number, payload: SalaryCoefficientPayload) {
    return request<{ message: string }>(`/api/salary-coefficient/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};