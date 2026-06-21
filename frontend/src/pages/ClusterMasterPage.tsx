import { useState } from 'react';
import { Cluster, ClusterPayload } from '../types';
import { useClusters } from '../hooks/useClusters';
import ClusterTable from '../components/cluster/ClusterTable';
import ClusterFormModal from '../components/cluster/ClusterFormModal';

export default function ClusterMasterPage() {
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Danh mục cụm
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý nhóm/cụm công đoạn theo tài liệu BA. Click vào một dòng để cập nhật.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
          >
            + Thêm mới
          </button>
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