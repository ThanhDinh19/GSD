import { request } from './httpClient';
import { DepartmentType_test, DepartmentTypePayload_test } from '../types';

export const departmenTypeService = {
  getDepartmentType() {
    return request<DepartmentType_test[]>('/api/organization/department-types-test');
  },

  createDepartmentType(payload: DepartmentTypePayload_test) {
    return request<{ message: string }>('/api/organization/department-types-test', {
      method: 'POST',
      body: payload,
    });
  },

  updateDepartmentType(id: number, payload: DepartmentTypePayload_test) {
    return request<{ message: string }>(`/api/organization/department-types-test/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};