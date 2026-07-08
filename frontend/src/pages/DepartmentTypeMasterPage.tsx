import { useState } from 'react';
import { DepartmentType_test, DepartmentTypePayload_test } from '../types';
import { useDepartmentType } from '../hooks/useDepartmentType';
import DepartmentTypeFormModal from '../components/departmentType/departmentTypeFormModal'; 
import DepartmentTypeTable from '../components/departmentType/departmentTypeTable'; 


export default function DepartmentTypeMasterPage() {
    const {
        departmentTypes,
        statuses,
        loading,
        createDepartmentType,
        updateDepartmentType,
    } = useDepartmentType();

    const [selectedDepartmentType, setSelectedDepartmentType] = useState<DepartmentType_test | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const openCreateForm = () => {
        setSelectedDepartmentType(null);
        setIsFormOpen(true);
    };

    const openEditForm = (departmentType: DepartmentType_test) => {
        setSelectedDepartmentType(departmentType);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setSelectedDepartmentType(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (payload: DepartmentTypePayload_test) => {
        if (selectedDepartmentType) {
            await updateDepartmentType(selectedDepartmentType.id, payload);
    } else {
            await createDepartmentType(payload);
        }
        closeForm();
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            Danh mục loại phòng ban 
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Quản lý loại phòng ban. Click vào một dòng để cập nhật.
                        </p>
                    </div>

                    <button
                        onClick={openCreateForm}
                        className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
                    >
                        + Thêm mới
                    </button>
                </div>

                <DepartmentTypeTable
                    departmentTypes={departmentTypes}
                    loading={loading}
                    onRowClick={openEditForm}
                />
            </div>

            {isFormOpen && (
                <DepartmentTypeFormModal
                    departmentTypes={selectedDepartmentType}
                    statuses={statuses}
                    onClose={closeForm}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}