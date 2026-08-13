import { useState } from 'react';
import { SalaryCoefficient, SalaryCoefficientPayload } from '../types';
import { useSalaryCoefficients } from '../hooks/useSalaryCoefficient';
import SalaryCoefficientTable from '../components/salaryCoefficient/salaryCoefficientTable';
import SalaryCoefficientFormModal from '../components/salaryCoefficient/salaryCoefficientFormModal';

import {
    Button
} from '../shared/components';

import {
    usePermissions,
} from '../features/auth/hooks/usePermissions';
import {
    SCREEN,
} from '../features/auth/constants/permission.constants';

export default function SalaryCoefficientMasterPage() {
    const permissions = usePermissions(SCREEN.MASTER_DATA);

    const {
        salaryCoefficients,
        skillGrades,
        statuses,
        loading,
        createSalaryCoefficient,
        updateSalaryCoefficient,
    } = useSalaryCoefficients();

    const [selectedSalaryCoefficient, setSelectedSalaryCoefficient] = useState<SalaryCoefficient | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const openCreateForm = () => {
        setSelectedSalaryCoefficient(null);
        setIsFormOpen(true);
    };

    const openEditForm = (skillGrade: SalaryCoefficient) => {
        setSelectedSalaryCoefficient(skillGrade);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setSelectedSalaryCoefficient(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (payload: SalaryCoefficientPayload) => {
        if (selectedSalaryCoefficient) {
            await updateSalaryCoefficient(selectedSalaryCoefficient.id, payload);
        } else {
            await createSalaryCoefficient(payload);
        }

        closeForm();
    };

    return (
        <div className="space-y-5">
            <div className="bg-white border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            Danh mục hệ số tính lương
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Quản lý hệ số tính lương. Click vào một dòng để cập nhật.
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

                <SalaryCoefficientTable
                    items={salaryCoefficients}
                    loading={loading}
                    onRowClick={openEditForm}
                />
            </div>

            {isFormOpen && (
                <SalaryCoefficientFormModal
                    item={selectedSalaryCoefficient}
                    skillGrades={skillGrades}
                    statuses={statuses}
                    onClose={closeForm}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}