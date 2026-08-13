import { useState } from 'react';
import { Cluster, ClusterPayload } from '../types';
import { useClusters } from '../hooks/useClusters';
import ClusterTable from '../components/cluster/ClusterTable';
import ClusterFormModal from '../components/cluster/ClusterFormModal';
import {
  Button
} from '../shared/components';

import {
  usePermissions,
} from '../features/auth/hooks/usePermissions';
import {
  SCREEN,
} from '../features/auth/constants/permission.constants';

export default function ClusterMasterPage() {
  const permissions = usePermissions(SCREEN.MASTER_DATA);

  const {
    clusters,
    statuses,
    loading,
    createCluster,
    updateCluster,
  } = useClusters();

  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openCreateForm = () => {
    setSelectedCluster(null);
    setIsFormOpen(true);
  };

  const openEditForm = (cluster: Cluster) => {
    setSelectedCluster(cluster);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedCluster(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (payload: ClusterPayload) => {
    if (selectedCluster) {
      await updateCluster(selectedCluster.id, payload);
    } else {
      await createCluster(payload);
    }
    closeForm();
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Danh mục cụm
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý nhóm/cụm công đoạn theo tài liệu BA. Click vào một dòng để cập nhật.
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

        <ClusterTable
          clusters={clusters}
          loading={loading}
          onRowClick={openEditForm}
        />
      </div>

      {isFormOpen && (
        <ClusterFormModal
          cluster={selectedCluster}
          statuses={statuses}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}