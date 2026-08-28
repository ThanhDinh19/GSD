import type {
  SewingProcessMachineNeed,
} from '../types/sewingProcess.types';

import {
  formatNumber,
} from '../utils/sewingProcess.formatters';

type MachineNeedTableProps = {
  rows: SewingProcessMachineNeed[];

  taktTime?: number | null;

  totalSmvMachineHSLuong?:
  number | null;
};

export function MachineNeedTable({
  rows,
  taktTime,
  totalSmvMachineHSLuong,
}: MachineNeedTableProps) {
  return (
    <div className="max-h-[460px] overflow-auto rounded-sm border border-slate-300">
      <div className="mb-2 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-slate-600">
        <div>
          Nhịp sản xuất dùng tính MMTB:{' '}

          <span className="font-bold text-blue-700">
            {taktTime !== null &&
              taktTime !== undefined
              ? formatNumber(
                taktTime,
                4
              )
              : '-'}
          </span>
        </div>

        <div>
          Tổng SMV máy HS lương:{' '}

          <span className="font-bold text-emerald-700">
            {totalSmvMachineHSLuong !== null &&
              totalSmvMachineHSLuong !== undefined
              ? formatNumber(
                totalSmvMachineHSLuong,
                2
              )
              : '-'}
          </span>
        </div>
      </div>

      <table className="w-full min-w-[760px] border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
          <tr>
            <th className="w-[70px] border border-slate-300 px-3 py-2 text-left">
              Mã máy
            </th>

            <th className="w-[160px] border border-slate-300 px-3 py-2 text-left">
              Tên máy
            </th>

            <th className="w-[90px] border border-slate-300 px-3 py-2 text-right">
              Tổng SMV
            </th>

            <th className="w-[90px] border border-slate-300 px-3 py-2 text-center">
              Hệ số lương
            </th>

            <th className="w-[90px] border border-slate-300 px-3 py-2 text-right">
              Nhu cầu
            </th>

            <th className="w-[110px] border border-slate-300 px-3 py-2 text-right">
              Hiệu suất sử dụng
            </th>

            <th className="w-[100px] border border-slate-300 px-3 py-2 text-right">
              Số lượng MMTB
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="border border-slate-300 px-4 py-6 text-center text-slate-400"
              >
                Chưa có dữ liệu nhu cầu MMTB. Bấm “Tính” trước.
              </td>
            </tr>
          ) : (
            rows.map(
              (
                item,
                index
              ) => (
                <tr
                  key={`${item.machineId ?? item.machineCode ?? 'machine'}-${index}`}
                >
                  <td className="border border-slate-300 px-3 py-2">
                    {item.machineCode}
                  </td>

                  <td className="border border-slate-300 px-3 py-2">
                    {item.machineName}
                  </td>

                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {formatNumber(
                      item.sumSmv,
                      2
                    )}
                  </td>

                  <td className="border border-slate-300 px-3 py-2 text-center font-semibold">
                    {Number(
                      item.salaryCoefficient ??
                      0
                    ) === 1 ? (
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                        title="Có tính hệ số lương"
                      >
                        ✓
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        -
                      </span>
                    )}
                  </td>

                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {formatNumber(
                      item.machineNeed,
                      2
                    )}
                  </td>

                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {formatNumber(
                      item.usedEfficiency,
                      2
                    )}
                  </td>

                  <td className="border border-slate-300 px-3 py-2 text-right font-bold text-blue-700">
                    {formatNumber(
                      item.machineQuantity,
                      0
                    )}
                  </td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}