import { Work } from '../../types';
import StatusBadge from '../../components/cluster/StatusBadge';

interface WorkTableProps {
  works: Work[];
  loading: boolean;
  onRowClick: (work: Work) => void;
}

export default function WorkTable({
  works,
  loading,
  onRowClick,
}: WorkTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50 text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">STT</th>
            <th className="px-4 py-3 text-left">Mã công việc</th>
            <th className="px-4 py-3 text-left">Tên công việc</th>
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

          {!loading && works.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Chưa có dữ liệu cụm.
              </td>
            </tr>
          )}

          {!loading && works.map((work, index) => (
            <tr
              key={work.id}
              onClick={() => onRowClick(work)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
              title="Click để cập nhật cụm"
            >
              <td className="px-4 py-3 font-mono text-slate-500">
                {index + 1}
              </td>

              <td className="px-4 py-3 font-bold text-slate-700">
                {work.workCode}
              </td>

              <td className="px-4 py-3 text-slate-700">
                {work.workName}
              </td>

              <td className="px-4 py-3">
                <StatusBadge
                  statusId={work.statusId}
                  statusName={work.statusName}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}