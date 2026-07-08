import { SkillGrade } from '../../types';
import StatusBadge from '../../components/cluster/StatusBadge';

interface SkillGradeTableProps {
  items: SkillGrade[];
  loading: boolean;
  onRowClick: (work: SkillGrade) => void;
}

export default function SkillGradeTable({
  items,
  loading,
  onRowClick,
}: SkillGradeTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50 text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">STT</th>
            <th className="px-4 py-3 text-left">Level</th>
            <th className="px-4 py-3 text-left">Ghi chú</th>
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

          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Chưa có dữ liệu.
              </td>
            </tr>
          )}

          {!loading && items.map((item, index) => (
            <tr
              key={item.id}
              onClick={() => onRowClick(item)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
              title="Click để cập nhật cụm"
            >
              <td className="px-4 py-3 font-mono text-slate-500">
                {index + 1}
              </td>

              <td className="px-4 py-3 font-bold text-slate-700">
                {item.level}
              </td>

              <td className="px-4 py-3 text-slate-700">
                {item.note}
              </td>

              <td className="px-4 py-3">
                <StatusBadge
                  statusId={item.status_id}
                  statusName={item.status_name}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}