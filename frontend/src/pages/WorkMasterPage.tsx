import { useState } from 'react';
import { Work, WorkPayload } from '../types';
import { useWorks } from '../hooks/useWorks';
import WorkTable from '../components/work/workTable';
import WorkFormModal from '../components/work/WorkFormModal';
import {
    Button
} from '../shared/components';

import {
    usePermissions,
} from '../features/auth/hooks/usePermissions';
import {
    SCREEN,
} from '../features/auth/constants/permission.constants';

export default function WorkMasterPage() {
    const permissions = usePermissions(SCREEN.MASTER_DATA);
    const {
        works,
        statuses,
        loading,
        createWork,
        updateWork,
    } = useWorks();

    const [selectedWork, setSelectedWork] = useState<Work | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const openCreateForm = () => {
        setSelectedWork(null);
        setIsFormOpen(true);
    };

    const openEditForm = (work: Work) => {
        setSelectedWork(work);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setSelectedWork(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (payload: WorkPayload) => {
        if (selectedWork) {
            await updateWork(selectedWork.id, payload);
        } else {
            await createWork(payload);
        }

        closeForm();
    };

    return (
        <div className="space-y-5">
            <div className="bg-white border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            Danh mục công việc
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Quản lý công việc. Click vào một dòng để cập nhật.
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

                <WorkTable
                    works={works}
                    loading={loading}
                    onRowClick={openEditForm}
                />
            </div>

            {isFormOpen && (
                <WorkFormModal
                    work={selectedWork}
                    statuses={statuses}
                    onClose={closeForm}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}