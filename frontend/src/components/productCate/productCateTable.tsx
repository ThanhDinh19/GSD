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
    <div className="  inline-block
  max-w-full
  max-h-[500px]
  overflow-auto
  rounded-sm
  border border-slate-200">
      <table className="w-auto table-auto border-collapse text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
          <tr>
            <th className="whitespace-nowrap border border-slate-200 px-3 py-2 text-center">
              STT
            </th>

            <th className="whitespace-nowrap border border-slate-200 px-3 py-2 text-left">
              Mã chủng loại
            </th>

            <th className="border border-slate-200 px-3 py-2 text-left">
              Tên chủng loại
            </th>

            <th className="whitespace-nowrap border border-slate-200 px-3 py-2 text-center">
              Trạng thái
            </th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={4}
                className="border border-slate-200 px-4 py-6 text-center text-slate-400"
              >
                Đang tải dữ liệu...
              </td>
            </tr>
          )}

          {!loading && productCates.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="border border-slate-200 px-4 py-6 text-center text-slate-400"
              >
                Chưa có dữ liệu.
              </td>
            </tr>
          )}

          {!loading &&
            productCates.map((item, index) => (
              <tr
                key={item.id}
                onClick={() => onRowClick(item)}
                className="
                  cursor-pointer
                  transition-colors
                  hover:bg-blue-50
                "
                title="Click để cập nhật"
              >
                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-center text-slate-500">
                  {index + 1}
                </td>

                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 font-medium text-slate-700">
                  {item.productCode}
                </td>

                <td className="border border-slate-200 px-3 py-2 text-slate-700">
                  {item.productName}
                </td>

                <td className="whitespace-nowrap border border-slate-200 px-3 py-2 text-center">
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