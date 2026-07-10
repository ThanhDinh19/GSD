import { ProductCate } from '../../types';
import StatusBadge from '../../components/cluster/StatusBadge';

interface ProductCateTableProps {
  productCates: ProductCate[];
  loading: boolean;
  onRowClick: (work: ProductCate) => void;
}

export default function ProductCateTable({
  productCates,
  loading,
  onRowClick,
}: ProductCateTableProps) {
  return (
    <div className="w-[600px] border border-slate-200 rounded-sm">
      <table className="w-[600px] border text-xs " >
        <thead className="bg-slate-50 text-slate-500 uppercase rounded-sm border border-slate-200 ">
          <tr>
            <th className="px-3 py-2 text-left text-base">STT</th>
            <th className="px-3 py-2 text-left text-base">Mã chủng loại</th>
            <th className="px-3 py-2 text-left text-base">Tên chủng loại</th>
            <th className="px-3 py-2 text-left text-base">Trạng thái</th>
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

          {!loading && productCates.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Chưa có dữ liệu.
              </td>
            </tr>
          )}

          {!loading && productCates.map((item, index) => (
            <tr
              key={item.id}
              onClick={() => onRowClick(item)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
              title="Click để cập nhật"
            >
              <td className="px-4 py-3 font-mono text-slate-500 text-base border border-slate-200 ">
                {index + 1}
              </td>

              <td className="px-4 py-3 font-bold text-slate-700 text-base border border-slate-200 ">
                {item.productCode}
              </td>

              <td className="px-4 py-3 text-slate-700 text-base border border-slate-200 ">
                {item.productName}
              </td>

              <td className="px-4 py-3 text-base border border-slate-200 ">
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