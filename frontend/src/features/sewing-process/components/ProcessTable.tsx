import type {
  SewingProcessLine,
} from '../types/sewingProcess.types';

import type {
  MachineEquipment_test,
} from '../../../types';

import {
  formatNumber,
  formatSummaryMoney,
  numberInputValue,
  toNumberOrNull,
} from '../utils/sewingProcess.formatters';

import {
  getGsdAnalysisImageUrl,
} from '../utils/sewingProcessImage';

type ProcessTableProps = {
  lines: SewingProcessLine[];
  machines: MachineEquipment_test[];

  readOnly: boolean;
  hasResult: boolean;

  onUpdateLine: <
    K extends keyof SewingProcessLine
  >(
    index: number,
    key: K,
    value: SewingProcessLine[K]
  ) => void;

  onRemoveLine: (
    index: number
  ) => void;

  onMachineChange: (
    index: number,
    value: string
  ) => void;

  onOpenActions: (
    line: SewingProcessLine
  ) => void;

  onPreviewImage: (
    url: string
  ) => void;
};

export function ProcessTable({
  lines,
  machines,
  readOnly,
  hasResult,
  onUpdateLine,
  onRemoveLine,
  onMachineChange,
  onOpenActions,
  onPreviewImage,
}: ProcessTableProps) {
  const columnCount = readOnly
    ? 19
    : 20;

  return (
    <div className="max-h-[460px] overflow-auto rounded-sm border border-slate-300">
      <table className="w-full min-w-[2600px] border-collapse text-xs">
        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
          <tr>
            <th className="border border-slate-300 px-2 py-2">
              STT
            </th>

            <th className="border border-slate-300 px-2 py-2">
              STT xếp chuyền
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Tên cụm
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Tên công đoạn
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Hình ảnh
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Bậc thợ
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Nhân sự
            </th>

            <th className="border border-slate-300 px-2 py-2">
              MMTB
            </th>

            <th className="border border-slate-300 px-2 py-2">
              MMTB Code
            </th>

            <th className="border border-slate-300 px-2 py-2">
              SMV gốc GSD
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Hệ số bậc thợ
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Đơn giá chuẩn
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Hiệu suất yêu cầu
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Hiệu suất sử dụng
            </th>

            <th className="border border-slate-300 px-2 py-2">
              SMV điều chỉnh
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Nhân sự may CĐ
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Thời gian CBC
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Ghi chú
            </th>

            <th className="border border-slate-300 px-2 py-2">
              Tổng thao tác
            </th>

            {!readOnly && (
              <th className="border border-slate-300 px-2 py-2">
                Xóa
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {lines.length === 0 && (
            <tr>
              <td
                colSpan={columnCount}
                className="border border-slate-300 px-4 py-6 text-center text-slate-400"
              >
                Chưa có công đoạn. Bấm “Chọn công đoạn” để lấy từ kho cụm.
              </td>
            </tr>
          )}

          {lines.map((line, index) => {
            const imageFileName =
              line.imageFileName ||
              line.imageUrl ||
              '';

            const imageSrc =
              getGsdAnalysisImageUrl(
                imageFileName
              );

            return (
              <tr
                key={`${line.id || 'new'}-${index}`}
              >
                <td className="border border-slate-300 px-2 py-2 text-center">
                  {index + 1}
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    disabled={readOnly}
                    type="number"
                    value={numberInputValue(
                      line.lineOrder
                    )}
                    onChange={(event) =>
                      onUpdateLine(
                        index,
                        'lineOrder',
                        toNumberOrNull(
                          event.target.value
                        )
                      )
                    }
                    className="w-full text-right outline-none disabled:bg-slate-100"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    disabled={readOnly}
                    value={
                      line.clusterName || ''
                    }
                    onChange={(event) =>
                      onUpdateLine(
                        index,
                        'clusterName',
                        event.target.value
                      )
                    }
                    className="w-full min-w-[140px] outline-none disabled:bg-slate-100"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenActions(line)
                    }
                    className="min-w-[220px] text-left font-semibold text-blue-700 hover:underline"
                    title="Xem thao tác công đoạn"
                  >
                    {line.operationName || '-'}
                  </button>
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <div className="flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-sm border border-dashed border-slate-300 bg-slate-50">
                    {imageSrc ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onPreviewImage(
                            imageSrc
                          );
                        }}
                        className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-blue-400"
                        title="Xem hình"
                      >
                        <img
                          src={imageSrc}
                          alt="Hình công đoạn"
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        -
                      </span>
                    )}
                  </div>
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    disabled={readOnly}
                    type="number"
                    value={numberInputValue(
                      line.skillGradeLevel
                    )}
                    onChange={(event) =>
                      onUpdateLine(
                        index,
                        'skillGradeLevel',
                        toNumberOrNull(
                          event.target.value
                        )
                      )
                    }
                    className="w-full text-right outline-none disabled:bg-slate-100"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2 text-right">
                  {hasResult
                    ? formatNumber(
                        line.laborCount,
                        2
                      )
                    : '-'}
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <select
                    disabled={readOnly}
                    value={line.machineId ?? ''}
                    onChange={(event) =>
                      onMachineChange(
                        index,
                        event.target.value
                      )
                    }
                    className="w-full min-w-[180px] bg-white outline-none disabled:bg-slate-100"
                  >
                    <option value="">
                      -- Chọn máy --
                    </option>

                    {machines.map(
                      (machine) => (
                        <option
                          key={machine.id}
                          value={machine.id}
                        >
                          {machine.machineName}
                        </option>
                      )
                    )}
                  </select>
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    readOnly
                    value={
                      line.machineCode || ''
                    }
                    className="w-full min-w-[120px] bg-slate-100 text-slate-700 outline-none"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    disabled={readOnly}
                    type="number"
                    step="0.0001"
                    value={line.samGsd}
                    onChange={(event) =>
                      onUpdateLine(
                        index,
                        'samGsd',
                        Number(
                          event.target.value ||
                            0
                        )
                      )
                    }
                    className="w-full text-right outline-none disabled:bg-slate-100"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    disabled={readOnly}
                    type="number"
                    step="0.0001"
                    value={
                      line.salaryCoefficient
                    }
                    onChange={(event) =>
                      onUpdateLine(
                        index,
                        'salaryCoefficient',
                        Number(
                          event.target.value ||
                            0
                        )
                      )
                    }
                    className="w-full text-right outline-none disabled:bg-slate-100"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2 text-right font-bold text-green-700">
                  {hasResult
                    ? formatSummaryMoney(
                        line.standardPrice,
                        0
                      )
                    : '-'}
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    disabled={readOnly}
                    type="number"
                    step="0.01"
                    value={numberInputValue(
                      line.requiredEfficiency
                    )}
                    onChange={(event) =>
                      onUpdateLine(
                        index,
                        'requiredEfficiency',
                        toNumberOrNull(
                          event.target.value
                        )
                      )
                    }
                    className="w-full text-right outline-none disabled:bg-slate-100"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2 text-right font-bold text-slate-700">
                  {hasResult
                    ? formatNumber(
                        line.usedEfficiency,
                        2
                      )
                    : '-'}
                </td>

                <td className="border border-slate-300 px-2 py-2 text-right font-bold text-blue-700">
                  {hasResult
                    ? formatNumber(
                        line.adjustedSam,
                        2
                      )
                    : '-'}
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    disabled={readOnly}
                    value={
                      line.sewingEmployee ||
                      ''
                    }
                    onChange={(event) =>
                      onUpdateLine(
                        index,
                        'sewingEmployee',
                        event.target.value
                      )
                    }
                    className="w-full min-w-[120px] outline-none disabled:bg-slate-100"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    disabled={readOnly}
                    type="number"
                    step="0.0001"
                    value={numberInputValue(
                      line.cbcTime
                    )}
                    onChange={(event) =>
                      onUpdateLine(
                        index,
                        'cbcTime',
                        toNumberOrNull(
                          event.target.value
                        )
                      )
                    }
                    className="w-full text-right outline-none disabled:bg-slate-100"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2">
                  <input
                    disabled={readOnly}
                    value={line.note || ''}
                    onChange={(event) =>
                      onUpdateLine(
                        index,
                        'note',
                        event.target.value
                      )
                    }
                    className="w-full min-w-[140px] outline-none disabled:bg-slate-100"
                  />
                </td>

                <td className="border border-slate-300 px-2 py-2 text-right">
                  {line.totalActions || 0}
                </td>

                {!readOnly && (
                  <td className="border border-slate-300 px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        onRemoveLine(index)
                      }
                      className="font-bold text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}