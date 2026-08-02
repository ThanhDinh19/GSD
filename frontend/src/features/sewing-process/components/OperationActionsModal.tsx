import type {
  SewingProcessActionDetail,
} from '../types/sewingProcess.types';

import {
  formatNumber,
} from '../utils/sewingProcess.formatters';

type OperationActionsModalProps = {
  title: string;
  loading: boolean;
  rows: SewingProcessActionDetail[];
  onClose: () => void;
};

export function OperationActionsModal({
  title,
  loading,
  rows,
  onClose,
}: OperationActionsModalProps) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-[90vw] max-w-[1100px] flex-col rounded-sm bg-white shadow-xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-bold uppercase text-slate-800">
              Chi tiết thao tác công đoạn
            </h3>

            <div className="mt-1 text-xs text-slate-500">
              {title}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-slate-300 px-3 py-1.5 text-xs font-bold hover:bg-slate-50"
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
                    Line no
                  </th>
                  <th className="border border-slate-300 px-2 py-2">
                    Step no
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
                      colSpan={8}
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

                    <td className="border border-slate-300 px-2 py-2 text-right">
                      {row.lineNo}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-right">
                      {row.stepNo ?? ''}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.gsdCode || ''}
                    </td>

                    <td className="border border-slate-300 px-2 py-2">
                      {row.actionName}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-right">
                      {formatNumber(
                        row.tmu,
                        2
                      )}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-right">
                      {formatNumber(
                        row.frequency,
                        2
                      )}
                    </td>

                    <td className="border border-slate-300 px-2 py-2 text-right">
                      {formatNumber(
                        row.seconds,
                        2
                      )}
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