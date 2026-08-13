import { useState } from 'react';
import { Customer, CustomerPayload } from '../types';
import { useCustomers } from '../hooks/useCustomers';
import CustomerTable from '../components/customer/customerTable';
import CustomerFormModal from '../components/customer/CustomerFormModal';
import {
  Button
} from '../shared/components';

import {
  usePermissions,
} from '../features/auth/hooks/usePermissions';
import {
  SCREEN,
} from '../features/auth/constants/permission.constants';

export default function CustomerMasterPage() {
  const permissions = usePermissions(SCREEN.MASTER_DATA);
  const {
    customers,
    statuses,
    loading,
    createCustomer,
    updateCustomer,
  } = useCustomers();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openCreateForm = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const openEditForm = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedCustomer(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (payload: CustomerPayload) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, payload);
    } else {
      await createCustomer(payload);
    }

    closeForm();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Danh mục khách hàng
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý khách hàng. Click vào một dòng để cập nhật.
            </p>
          </div>

          {permissions.canCreate && (
            <Button
              variant='primary'
              onClick={openCreateForm}
            >
              New
            </Button>
          )}
        </div>

        <CustomerTable
          customers={customers}
          loading={loading}
          onRowClick={openEditForm}
        />
      </div>

      {isFormOpen && (
        <CustomerFormModal
          customer={selectedCustomer}
          statuses={statuses}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}