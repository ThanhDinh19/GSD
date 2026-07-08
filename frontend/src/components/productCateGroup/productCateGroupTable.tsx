import { ProductCateGroup } from '../../types';
import StatusBadge from '../../components/cluster/StatusBadge';

interface ProductCateGroupTableProps {
  productCateGroups: ProductCateGroup[];
  loading: boolean;
  onRowClick: (work: ProductCateGroup) => void;
}

export default function ProductCateTable({
  productCateGroups,
  loading,
  onRowClick,
}: ProductCateGroupTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50 text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">STT</th>
            <th className="px-4 py-3 text-left">Mã nhóm chủng loại</th>
            <th className="px-4 py-3 text-left">Tên nhóm chủng loại</th>
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

          {!loading && productCateGroups.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Chưa có dữ liệu.
              </td>
            </tr>
          )}

          {!loading && productCateGroups.map((item, index) => (
            <tr
              key={item.id}
              onClick={() => onRowClick(item)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
              title="Click để cập nhật"
            >
              <td className="px-4 py-3 font-mono text-slate-500">
                {index + 1}
              </td>

              <td className="px-4 py-3 font-bold text-slate-700">
                {item.cateGroupCode}
              </td>

              <td className="px-4 py-3 text-slate-700">
                {item.cateGroupName}
              </td>

              <td className="px-4 py-3">
                <StatusBadge
                  statusId={item.statusId}
                  statusName={item.statusName}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}