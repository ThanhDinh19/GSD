import { GsdAnalysisDetail } from '../../types';

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
  return (
    <div className="fixed inset-0 bg-black/30 z-[120] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-800 uppercase">
              Chi tiết phân tích công đoạn
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {analysis.analysisNo} - {analysis.operationName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <InfoCard label="Tên công đoạn" value={analysis.operationName} />
            <InfoCard label="Mã phân tích" value={analysis.analysisNo} />
            <InfoCard label="Ngày tạo" value={formatDateTime(analysis.createdAt || analysis.analysisDate)} />
            <InfoCard label="Bậc tay nghề" value={analysis.skillGrade ?? '-'} />

            <InfoCard label="Source" value={analysis.sourceCode || '-'} />
            <InfoCard label="Loại máy / MMTB" value={analysis.machineName || '-'} />
            <InfoCard label="Code MMTB" value={analysis.codeMMTB || '-'} />
            <InfoCard label="Mức độ phức tạp" value={`${formatNumber(analysis.difficultyPercent, 0)}%`} />

            <InfoCard label="Đường may" value={formatNumber(analysis.seamLength, 2)} />
            <InfoCard label="Thao tác kèm theo" value={formatNumber(analysis.attachedActionTime, 2)} />
            <InfoCard label="Hệ số nhân SP" value={formatNumber(analysis.productMultiplier, 2)} />
            <InfoCard label="Ghi chú" value={analysis.note || '-'} />

            <InfoCard label="Số mũi chỉ" value={formatNumber(analysis.stitchCount, 2)} />
            <InfoCard label="Tốc độ máy" value={formatNumber(analysis.machineSpeed, 0)} />
            <InfoCard label="Vận tốc máy" value={formatNumber(analysis.machineVelocity, 4)} />
            <InfoCard label="Hao phí" value={formatNumber(analysis.allowance, 2)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-xs">
            <MetricCard label="Tổng thao tác" value={analysis.details.length} />
            <MetricCard label="Tổng TMU" value={formatNumber(analysis.totalTmu, 2)} />
            <MetricCard label="Giây thao tác" value={formatNumber(analysis.totalManualSeconds, 4)} />
            <MetricCard label="Thời gian MMTB" value={formatNumber(analysis.machineSeconds, 4)} />
            <MetricCard label="Thời gian mức độ" value={formatNumber(analysis.difficultySeconds, 4)} />
            <MetricCard label="Tổng SMV" value={analysis.totalSmvBeforeDifficulty} highlight />
            <MetricCard label="SMV cuối" value={formatNumber(analysis.finalSmv, 0)} highlight />
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="min-w-full text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 border border-slate-200 text-left">STT</th>
                  <th className="px-4 py-3 border border-slate-200 text-left">Bước</th>
                  <th className="px-4 py-3 border border-slate-200 text-left">Code</th>
                  <th className="px-4 py-3 border border-slate-200 text-left">Thao tác</th>
                  <th className="px-4 py-3 border border-slate-200 text-right">TMU</th>
                  <th className="px-4 py-3 border border-slate-200 text-right">Tần suất</th>
                  <th className="px-4 py-3 border border-slate-200 text-right">Giây</th>
                  <th className="px-4 py-3 border border-slate-200 text-left">Ghi chú</th>
                </tr>
              </thead>

              <tbody>
                {analysis.details.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 border border-slate-200 text-center text-slate-400"
                    >
                      Không có chi tiết thao tác.
                    </td>
                  </tr>
                )}

                {analysis.details.map((item, index) => (
                  <tr key={item.id} className="hover:bg-blue-50">
                    <td className="px-4 py-3 border border-slate-200 font-mono text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 font-bold text-blue-700">
                      {item.stepNo}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-slate-700">
                      {item.gsdCode}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-slate-700">
                      {item.actionName}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-right font-bold">
                      {formatNumber(item.tmu, 2)}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-right">
                      {formatNumber(item.frequency, 2)}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-right">
                      {formatNumber(item.seconds, 4)}
                    </td>

                    <td className="px-4 py-3 border border-slate-200 text-slate-500">
                      {item.note || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div className="text-slate-500">{label}</div>
      <div className="font-bold text-slate-800 mt-1">{value}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className={`border rounded-lg p-3 ${highlight
        ? 'bg-green-50 border-green-100 text-green-800'
        : 'bg-blue-50 border-blue-100 text-blue-800'
      }`}>
      <div className="font-semibold">{label}</div>
      <div className="text-lg mt-1">{value}</div>
    </div>
  );
}