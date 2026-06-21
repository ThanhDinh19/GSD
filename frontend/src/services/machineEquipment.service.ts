import { request } from './httpClient';
import { MachineEquipment, MachineEquipmentPayload } from '../types';

export const machineEquipmentService = {
  getMachineEquipments() {
    return request<MachineEquipment[]>('/api/machine-equipments');
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