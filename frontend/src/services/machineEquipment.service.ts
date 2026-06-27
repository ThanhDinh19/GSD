import { request } from './httpClient';
import { MachineEquipment, MachineEquipment_test, MachineEquipmentPayload } from '../types';

export const machineEquipmentService = {
  getMachineEquipments() {
    return request<MachineEquipment[]>('/api/machine-equipments');
  },

  getMachineEquipments_test() {
    return request<MachineEquipment_test[]>('/api/machine-equipments/test');
  },

  createMachineEquipment(payload: MachineEquipmentPayload) {
    return request<{ message: string }>('/api/machine-equipments', {
      method: 'POST',
      body: payload,
    });
  },

  updateMachineEquipment(id: number, payload: MachineEquipmentPayload) {
    return request<{ message: string }>(`/api/machine-equipments/${id}`, {
      method: 'PUT',
      body: payload,
    });
  },
};