import { GsdAnalysisDetail } from '../../types';
import { getGsdAnalysisImageUrl } from '../../services/gsdAnalysis.service';
import { Button } from '../../shared/components';
interface GsdAnalysisDetailModalProps {
  analysis: GsdAnalysisDetail;
  onClose: () => void;
}

function formatNumber(value: number | null | undefined, digits = 4) {
  return Number(value || 0).toFixed(digits);
}

function formatDateTime(value?: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('vi-VN');
}

export default function GsdAnalysisDetailModal({
  analysis,
  onClose,
}: GsdAnalysisDetailModalProps) {

  const imageFileName = analysis.imageFileName || analysis.imageUrl || '';
  const imageSrc = getGsdAnalysisImageUrl(imageFileName);
  const details = Array.isArray(
    analysis.details
  )
    ? analysis.details
    : [];
  return (
    <div
      className="
      fixed inset-0 z-[120]
      flex items-center justify-center
      bg-slate-950/45
      p-3 backdrop-blur-[2px]
      sm:p-5
    "
    >
      <div
        className="
        flex max-h-[92vh] w-full max-w-[1400px]
        flex-col overflow-hidden
        rounded-sm border border-slate-200
        bg-white shadow-sm
      "
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-black uppercase tracking-tight text-slate-800">
                Chi tiết phân tích công đoạn
              </h3>

              {analysis.analysisNo && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                  {analysis.analysisNo}
                </span>
              )}
            </div>

            <p className="mt-1 truncate text-xs text-slate-500">
              {analysis.operationName || 'Chưa có tên công đoạn'}
            </p>
          </div>
        </div>

        {/* Nội dung */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/40 p-4 sm:p-6">
          {/* Thông tin + hình ảnh */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            {/* Thông tin cơ bản */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h4 className="text-sm font-bold text-slate-800">
                  Thông tin phân tích
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  Thông tin công đoạn, máy móc và các thông số tính toán.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                <InfoCard
                  label="Tên công đoạn"
                  value={analysis.operationName || '-'}
                />

                <InfoCard
                  label="Mã phân tích"
                  value={analysis.analysisNo || '-'}
                />

                <InfoCard
                  label="Ngày tạo"
                  value={formatDateTime(
                    analysis.createdAt ||
                    analysis.analysisDate
                  )}
                />

                <InfoCard
                  label="Bậc tay nghề"
                  value={analysis.skillGrade ?? '-'}
                />

                <InfoCard
                  label="Source"
                  value={analysis.sourceName || '-'}
                />

                <InfoCard
                  label="Loại máy / MMTB"
                  value={analysis.machineName || '-'}
                />

                <InfoCard
                  label="Code MMTB"
                  value={analysis.codeMMTB || '-'}
                />

                <InfoCard
                  label="Mức độ phức tạp"
                  value={`${formatNumber(
                    analysis.difficultyPercent,
                    0
                  )}%`}
                />

                <InfoCard
                  label="Đường may"
                  value={`${formatNumber(analysis.seamLength, 2)} cm`}
                />

                <InfoCard
                  label="Thao tác kèm theo"
                  value={formatNumber(
                    analysis.attachedActionTime,
                    2
                  )}

                // value = {`${Number(analysis.attachedActionTime)}`}
                />

                <InfoCard
                  label="Hệ số nhân SP"
                  value={formatNumber(
                    analysis.productMultiplier,
                    2
                  )}
                />

                <InfoCard
                  label="Số mũi chỉ"
                  value={formatNumber(
                    analysis.stitchCount,
                    2
                  )}
                />

                <InfoCard
                  label="Tốc độ máy"
                  value={formatNumber(
                    analysis.machineSpeed,
                    0
                  )}
                />

                <InfoCard
                  label="Vận tốc máy"
                  subLabel="(Số mũi chỉ / tốc độ máy) × 60"
                  value={formatNumber(
                    analysis.machineVelocity,
                    2
                  )}
                />

                <InfoCard
                  label="Hao phí"
                  value={formatNumber(
                    analysis.allowance,
                    2
                  )}
                />

                <InfoCard
                  label="Ghi chú"
                  value={analysis.note || '-'}
                  className="sm:col-span-2 lg:col-span-3 2xl:col-span-1"
                />
              </div>
            </section>

            {/* Hình ảnh */}
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Hình ảnh công đoạn
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  Hình minh họa đã lưu cùng phân tích.
                </p>
              </div>

              <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Hình ảnh công đoạn"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                      🖼️
                    </div>

                    <div className="mt-3 text-xs font-bold text-slate-600">
                      Chưa có hình ảnh
                    </div>

                    <div className="mt-1 text-[11px] leading-4 text-slate-400">
                      Phân tích này chưa được lưu hình minh họa.
                    </div>
                  </div>
                )}
              </div>

              {imageFileName && (
                <div
                  className="mt-3 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500"
                  title={imageFileName}
                >
                  {imageFileName}
                </div>
              )}
            </section>
          </div>

          {/* Chỉ số */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-800">
                Kết quả phân tích
              </h4>

              <p className="mt-1 text-xs text-slate-500">
                Tổng hợp thời gian thao tác, MMTB và SMV.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
              <MetricCard
                label="Tổng thao tác"
                value={details.length}
              />

              <MetricCard
                label="Tổng TMU"
                value={formatNumber(
                  analysis.totalTmu,
                  2
                )}
              />

              <MetricCard
                label="Giây thao tác"
                value={formatNumber(
                  analysis.totalManualSeconds,
                  2
                )}
              />

              <MetricCard
                label="Thời gian MMTB"
                subLabel="(Vận tốc máy × đường may) + thao tác kèm theo + hao phí"
                value={formatNumber(
                  analysis.machineSeconds,
                  2
                )}
                tone="orange"
              />

              <MetricCard
                label="Thời gian mức độ"
                subLabel="Tổng SMV × mức độ phức tạp / 100"
                value={formatNumber(
                  analysis.difficultySeconds,
                  2
                )}
                tone="amber"
              />

              <MetricCard
                label="Tổng SMV"
                subLabel="(Giây thao tác + thời gian MMTB) × hệ số SP"
                value={formatNumber(
                  analysis.totalSmvBeforeDifficulty,
                  2
                )}
                tone="green"
              />

              <MetricCard
                label="SMV cuối"
                subLabel="Tổng SMV + thời gian mức độ"
                value={formatNumber(
                  analysis.finalSmv,
                  0
                )}
                tone="emerald"
                emphasis
              />
            </div>
          </section>

          {/* Bảng chi tiết */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Chi tiết thao tác
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  {details.length} thao tác trong phân tích
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full border-collapse text-xs">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="border-b border-r border-slate-200 px-4 py-3 text-left">
                      STT
                    </th>

                    <th className="border-b border-r border-slate-200 px-4 py-3 text-left">
                      Bước
                    </th>

                    <th className="border-b border-r border-slate-200 px-4 py-3 text-left">
                      Code
                    </th>

                    <th className="border-b border-r border-slate-200 px-4 py-3 text-left">
                      Thao tác
                    </th>

                    <th className="border-b border-r border-slate-200 px-4 py-3 text-right">
                      TMU
                    </th>

                    <th className="border-b border-r border-slate-200 px-4 py-3 text-right">
                      Tần suất
                    </th>

                    <th className="border-b border-r border-slate-200 px-4 py-3 text-right">
                      Giây
                    </th>

                    <th className="border-b border-slate-200 px-4 py-3 text-left">
                      Ghi chú
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {details.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        Không có chi tiết thao tác.
                      </td>
                    </tr>
                  )}

                  {details.map((item, index) => (
                    <tr
                      key={
                        item.id ??
                        `${item.stepNo}-${index}`
                      }
                      className="transition hover:bg-blue-50/60"
                    >
                      <td className="border-b border-r border-slate-200 px-4 py-3 font-mono text-slate-500">
                        {index + 1}
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-3">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-blue-50 px-2 py-1 font-bold text-blue-700">
                          {item.stepNo}
                        </span>
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-3 font-medium text-slate-700">
                        {item.gsdCode || '-'}
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-3 text-slate-700">
                        {item.actionName || '-'}
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-3 text-right font-bold text-slate-800">
                        {formatNumber(
                          item.tmu,
                          2
                        )}
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-3 text-right text-slate-700">
                        {formatNumber(
                          item.frequency,
                          2
                        )}
                      </td>

                      <td className="border-b border-r border-slate-200 px-4 py-3 text-right text-slate-700">
                        {formatNumber(
                          item.seconds,
                          2
                        )}
                      </td>

                      <td className="border-b border-slate-200 px-4 py-3 text-slate-500">
                        {item.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end border-t border-slate-200 bg-white px-5 py-3 sm:px-6">
          <Button
            variant='default'
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );

}

function InfoCard({
  label,
  subLabel = null,
  value,
  className = '',
}: {
  label: string;
  subLabel?: string | null;
  value: string | number;
  className?: string;
}) {
  return (
    <div
      className={`
        min-h-[70px] rounded-sm
        border border-slate-200
        bg-slate-50/70 p-3
        ${className}
      `}
    >
      <CardLabel
        label={label}
        subLabel={subLabel}
      />

      <div className="mt-1.5 break-words text-sm font-bold text-slate-800">
        {value}
      </div>
    </div>
  );
}

type MetricTone =
  | 'blue'
  | 'orange'
  | 'amber'
  | 'green'
  | 'emerald';

function MetricCard({
  label,
  subLabel = null,
  value,
  tone = 'blue',
  emphasis = false,
}: {
  label: string;
  subLabel?: string | null;
  value: string | number;
  tone?: MetricTone;
  emphasis?: boolean;
}) {
  const toneClasses: Record<
    MetricTone,
    {
      card: string;
      label: string;
      value: string;
    }
  > = {
    blue: {
      card:
        'bg-blue-50 border-blue-100',
      label:
        'text-blue-600',
      value:
        'text-blue-900',
    },

    orange: {
      card:
        'bg-orange-50 border-orange-100',
      label:
        'text-orange-600',
      value:
        'text-orange-900',
    },

    amber: {
      card:
        'bg-amber-50 border-amber-100',
      label:
        'text-amber-600',
      value:
        'text-amber-900',
    },

    green: {
      card:
        'bg-green-50 border-green-100',
      label:
        'text-green-600',
      value:
        'text-green-900',
    },

    emerald: {
      card:
        'bg-emerald-50 border-emerald-100',
      label:
        'text-emerald-600',
      value:
        'text-emerald-900',
    },
  };

  const classes =
    toneClasses[tone];

  return (
    <div
      className={`
        rounded-lg border p-3
        ${classes.card}
        ${emphasis
          ? 'ring-2 ring-emerald-100'
          : ''
        }
      `}
    >
      <div
        className={`
          flex items-center gap-2
          ${classes.label}
        `}
      >
        <span>
          {label}
        </span>

        {subLabel && (
          <div className="group relative">
            <button
              type="button"
              aria-label={subLabel}
              className="
                flex h-4 w-4
                items-center justify-center
                rounded-full
                border border-current
                text-[9px] font-bold
                opacity-60
                hover:opacity-100
              "
            >
              ?
            </button>

            <div
              className="
                invisible absolute
                bottom-full left-1/2
                z-50 mb-2
                w-max max-w-[250px]
                -translate-x-1/2
                rounded-lg bg-slate-900
                px-3 py-2
                text-[11px] font-normal
                leading-4 text-white
                opacity-0 shadow-lg
                transition
                group-hover:visible
                group-hover:opacity-100
                group-focus-within:visible
                group-focus-within:opacity-100
              "
            >
              {subLabel}

              <span
                className="
                  absolute left-1/2 top-full
                  -translate-x-1/2
                  border-4 border-transparent
                  border-t-slate-900
                "
              />
            </div>
          </div>
        )}
      </div>

      <div
        className={`
          mt-1 font-black
          ${classes.value}
          ${emphasis
            ? 'text-xl'
            : 'text-lg'
          }
        `}
      >
        {value}
      </div>
    </div>
  );
}


function CardLabel({
  label,
  subLabel,
}: {
  label: string;
  subLabel?: string | null;
}) {
  return (
    <div className="flex min-h-5 items-center gap-2">
      <span className="text-xs font-semibold opacity-75">
        {label}
      </span>

      {subLabel && (
        <div className="group relative">
          <button
            type="button"
            aria-label={subLabel}
            className="
              flex h-4 w-4 items-center justify-center
              rounded-full border border-current
              text-[9px] font-black opacity-60
              transition hover:opacity-100
              focus:outline-none
            "
          >
            ?
          </button>

          <div
            className="
              invisible absolute bottom-full left-1/2
              z-[150] mb-2 w-max max-w-[260px]
              -translate-x-1/2 rounded-lg
              bg-slate-900 px-3 py-2
              text-[11px] font-normal leading-4
              text-white opacity-0 shadow-xl
              transition
              group-hover:visible group-hover:opacity-100
              group-focus-within:visible
              group-focus-within:opacity-100
            "
          >
            {subLabel}

            <div
              className="
                absolute left-1/2 top-full
                -translate-x-1/2
                border-4 border-transparent
                border-t-slate-900
              "
            />
          </div>
        </div>
      )}
    </div>
  );
}