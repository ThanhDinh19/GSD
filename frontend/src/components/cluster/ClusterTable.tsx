import { Cluster } from '../../types';
import StatusBadge from './StatusBadge';

interface ClusterTableProps {
  clusters: Cluster[];
  loading: boolean;
  onRowClick: (cluster: Cluster) => void;
}

export default function ClusterTable({
  clusters,
  loading,
  onRowClick,
}: ClusterTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50 text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">STT</th>
            <th className="px-4 py-3 text-left">Mã cụm</th>
            <th className="px-4 py-3 text-left">Tên cụm</th>
            <th className="px-4 py-3 text-left">Trạng thái</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Đang tải dữ liệu...
              </td>
            </tr>
          )}

          {!loading && clusters.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Chưa có dữ liệu cụm.
              </td>
            </tr>
          )}

          {!loading && clusters.map((cluster, index) => (
            <tr
              key={cluster.id}
              onClick={() => onRowClick(cluster)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
              title="Click để cập nhật cụm"
            >
              <td className="px-4 py-3 font-mono text-slate-500">
                {index + 1}
              </td>

              <td className="px-4 py-3 font-bold text-slate-700">
                {cluster.clusterCode}
              </td>

              <td className="px-4 py-3 text-slate-700">
                {cluster.clusterName}
              </td>

              <td className="px-4 py-3">
                <StatusBadge
                  statusId={cluster.statusId}
                  statusName={cluster.statusName}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}