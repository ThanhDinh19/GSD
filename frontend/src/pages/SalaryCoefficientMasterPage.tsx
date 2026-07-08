import { useState } from 'react';
import { SalaryCoefficient, SalaryCoefficientPayload } from '../types';
import { useSalaryCoefficients } from '../hooks/useSalaryCoefficient';
import SalaryCoefficientTable from '../components/salaryCoefficient/salaryCoefficientTable';
import SalaryCoefficientFormModal from '../components/salaryCoefficient/salaryCoefficientFormModal';

export default function SalaryCoefficientMasterPage() {
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            Danh mục hệ số tính lương
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Quản lý hệ số tính lương. Click vào một dòng để cập nhật.
                        </p>
                    </div>

                    <button
                        onClick={openCreateForm}
                        className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
                    >
                        + Thêm mới
                    </button>
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