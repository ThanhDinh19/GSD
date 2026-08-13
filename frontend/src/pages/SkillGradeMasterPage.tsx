import { useState } from 'react';
import { SkillGrade, SkillGradePayload } from '../types';
import { useSkillGrades } from '../hooks/useSkillGrade';
import SkillGradeTable from '../components/skillGrade/skillGradeTable';
import SkillGradeFormModal from '../components/skillGrade/skillGradeFormModal';

import {
    Button
} from '../shared/components';

import {
    usePermissions,
} from '../features/auth/hooks/usePermissions';
import {
    SCREEN,
} from '../features/auth/constants/permission.constants';

export default function SkillGradeMasterPage() {
    const permissions = usePermissions(SCREEN.MASTER_DATA);
    const {
        skillGrades,
        statuses,
        loading,
        createSkillGrade,
        updateSkillGrade,
    } = useSkillGrades();

    const [selectedSkillGrade, setSelectedSkillGrade] = useState<SkillGrade | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const openCreateForm = () => {
        setSelectedSkillGrade(null);
        setIsFormOpen(true);
    };

    const openEditForm = (skillGrade: SkillGrade) => {
        setSelectedSkillGrade(skillGrade);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setSelectedSkillGrade(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (payload: SkillGradePayload) => {
        if (selectedSkillGrade) {
            await updateSkillGrade(selectedSkillGrade.id, payload);
        } else {
            await createSkillGrade(payload);
        }

        closeForm();
    };

    return (
        <div className="space-y-5">
            <div className="bg-white border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            Danh mục bậc thợ
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Quản lý bậc thợ. Click vào một dòng để cập nhật.
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

                <SkillGradeTable
                    items={skillGrades}
                    loading={loading}
                    onRowClick={openEditForm}
                />
            </div>

            {isFormOpen && (
                <SkillGradeFormModal
                    item={selectedSkillGrade}
                    statuses={statuses}
                    onClose={closeForm}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}