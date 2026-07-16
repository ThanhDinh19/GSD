import { Customer } from '../../types';
import StatusBadge from '../cluster/StatusBadge';

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onRowClick: (customer: Customer) => void;
}

export default function CustomerTable({
  customers,
  loading,
  onRowClick,
}: CustomerTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="min-w-full text-xs">
        <thead className="bg-slate-50 text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">STT</th>
            <th className="px-4 py-3 text-left">Mã khách hàng</th>
            <th className="px-4 py-3 text-left">Tên khách hàng</th>
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

          {!loading && customers.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                Chưa có dữ liệu khách hàng.
              </td>
            </tr>
          )}

          {!loading &&
            customers.map((customer, index) => (
              <tr
                key={customer.id}
                onClick={() => onRowClick(customer)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                title="Click để cập nhật khách hàng"
              >
                <td className="px-4 py-3 font-mono text-slate-500">
                  {index + 1}
                </td>

                <td className="px-4 py-3 font-bold text-slate-700">
                  {customer.cusCode}
                </td>

                <td className="px-4 py-3 text-slate-700">
                  {customer.cusName}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge
                    statusId={customer.statusId}
                    statusName={customer.statusName}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}