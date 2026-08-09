import type {
  GsdActionDetail,
} from '../types/operationCluster.types';

type OperationActionDetailsModalProps = {
  open: boolean;
  title: string;
  loading: boolean;
  rows: GsdActionDetail[];
  onClose: () => void;
};

function formatNumber(
  value: number | null | undefined
) {
  return Number(value || 0).toFixed(2);
}

export default function OperationActionDetailsModal({
  open,
  title,
  loading,
  rows,
  onClose,
}: OperationActionDetailsModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/35 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-[90vw] max-w-[1100px] flex-col overflow-hidden rounded-sm bg-white shadow-xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">
              Chi tiết thao tác công đoạn
            </div>

            <div className="mt-1 truncate text-xs text-slate-500">
              {title}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-sm border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Đang tải thao tác...
            </div>
          ) : (
            <table className="w-full min-w-[900px] border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
                <tr>
                  <th className="border border-slate-300 px-2 py-2">
                    STT
                  </th>
                  <th className="border border-slate-300 px-2 py-2">
                    Mã GSD
                  </th>
                  <th className="border border-slate-300 px-2 py-2">
                    Tên thao tác
                  </th>
                  <th className="border border-slate-300 px-2 py-2">
                    TMU
                  </th>
                  <th className="border border-slate-300 px-2 py-2">
                    Tần suất
                  </th>
                  <th className="border border-slate-300 px-2 py-2">
                    Giây
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-slate-300 px-4 py-8 text-center text-slate-400"
                    >
                      Công đoạn này chưa có thao tác.
                    </td>
                  </tr>
                )}

                {rows.map((row, index) => (
                  <tr
                    key={`${row.id}-${index}`}
                  >
                    <td className="border border-slate-300 px-2 py-2 text-center">
                      {index + 1}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.gsd_code || ''}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.action_name}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-right">
                      {formatNumber(row.tmu)}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-right">
                      {formatNumber(row.frequency)}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-right">
                      {formatNumber(row.seconds)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}