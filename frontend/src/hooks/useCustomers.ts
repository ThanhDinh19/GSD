import { useEffect, useState } from 'react';
import { Customer, CustomerPayload, MasterStatus } from '../types';
import { customerService } from '../services/customer.service';
import { statusService } from '../services/status.service';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statuses, setStatuses] = useState<MasterStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStatuses = async () => {
    const data = await statusService.getStatuses();
    setStatuses(data);
  };

  const loadCustomers = async () => {
    setLoading(true);

    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([
      loadStatuses(),
      loadCustomers(),
    ]);
  };

  const createCustomer = async (payload: CustomerPayload) => {
    await customerService.createCustomer(payload);
    await loadCustomers();
  };

  const updateCustomer = async (id: number, payload: CustomerPayload) => {
    await customerService.updateCustomer(id, payload);
    await loadCustomers();
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    customers,
    statuses,
    loading,
    refresh,
    createCustomer,
    updateCustomer,
  };
}