import { useState } from 'react';
import { BalanceType, BalanceTypePayload } from '../types';
import { useBalanceTypes } from '../hooks/useBalanceTypes';
import BalanceTypeFormModal from '../components/balanceType/balanceTypeFormModal';
import BalanceTypeTable from '../components/balanceType/balanceTypeTable';
import {
    Button
} from '../shared/components';

import {
    usePermissions,
} from '../features/auth/hooks/usePermissions';
import {
    SCREEN,
} from '../features/auth/constants/permission.constants';

export default function BalanceTypeMasterPage() {
    const permissions = usePermissions(SCREEN.MASTER_DATA);
    const {
        balanceTypes,
        statuses,
        loading,
        createBalanceType,
        updateBalanceType,
    } = useBalanceTypes();

    const [selectedBalanceType, setSelectedBalanceType] = useState<BalanceType | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const openCreateForm = () => {
        setSelectedBalanceType(null);
        setIsFormOpen(true);
    };

    const openEditForm = (balanceType: BalanceType) => {
        setSelectedBalanceType(balanceType);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setSelectedBalanceType(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (payload: BalanceTypePayload) => {
        if (selectedBalanceType) {
            await updateBalanceType(selectedBalanceType.id, payload);
        } else {
            await createBalanceType(payload);
        }
        closeForm();
    };

    return (
        <div className="h-full min-h-full bg-white p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
                {permissions.canCreate && (
                    <Button
                        variant="primary"
                        onClick={openCreateForm}
                    >
                        New
                    </Button>
                )}
            </div>

            <BalanceTypeTable
                balanceTypes={balanceTypes}
                loading={loading}
                onRowClick={openEditForm}
            />

            {isFormOpen && (
                <BalanceTypeFormModal
                    balanceType={selectedBalanceType}
                    statuses={statuses}
                    onClose={closeForm}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}
