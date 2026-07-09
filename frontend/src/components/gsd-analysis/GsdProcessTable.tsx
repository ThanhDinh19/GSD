import { GsdAnalysisSummary } from '../../types';

interface GsdProcessTableProps {
    analyses: GsdAnalysisSummary[];
    loading?: boolean;
    onRefresh?: () => void;
    onRowClick?: (analysisId: number) => void;
    showRefreshButton?: boolean;
}

function formatDateTime(value?: string) {
    if (!value) return '';

    const normalized = value.replace(' ', 'T');

    const [datePart, timePart = ''] = normalized.split('T');

    const [year, month, day] = datePart.split('-');
    const [hour = '00', minute = '00', secondRaw = '00'] = timePart.split(':');

    const second = secondRaw.split('.')[0];

    if (!year || !month || !day) return value;

    return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
}

export default function GsdProcessTable({
    analyses,
    loading = false,
    onRefresh,
    onRowClick,
    showRefreshButton = true,
}: GsdProcessTableProps) {
    return (
        <div className="bg-white rounded-xl border-slate-200 p-5">.
            <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                        Quy trình công đoạn
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Tổng hợp các công đoạn đã phân tích theo sheet Quy trình.
                    </p>
                </div>

                {showRefreshButton && (
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="px-4 py-2 border border-blue-200 text-blue-700 rounded-sm text-xs font-bold hover:bg-blue-50 disabled:opacity-50"
                    >
                        {loading ? 'Đang tải...' : 'Tải lại'}
                    </button>
                )}
            </div>

            <div className="h-[500px] overflow-auto border border-slate-200 rounded-lg">
                <table className="min-w-[1100px] w-full text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 border border-slate-200 text-left">STT</th>
                            <th className="px-4 py-3 border border-slate-200 text-left">Bước công việc</th>
                            <th className="px-4 py-3 border border-slate-200 text-right">Bậc thợ</th>
                            <th className="px-4 py-3 border border-slate-200 text-left">Nhu cầu CC+DC, MMTB</th>
                            <th className="px-4 py-3 border border-slate-200 text-left">Code MMTB</th>
                            <th className="px-4 py-3 border border-slate-200 text-right">Thời gian chuẩn</th>
                            <th className="px-4 py-3 border border-slate-200 text-left">Mã phân tích</th>
                            <th className="px-4 py-3 border border-slate-200 text-left">Ngày tạo</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-6 border border-slate-200 text-center text-slate-400"
                                >
                                    Đang tải quy trình công đoạn...
                                </td>
                            </tr>
                        )}

                        {!loading && analyses.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-6 border border-slate-200 text-center text-slate-400"
                                >
                                    Chưa có công đoạn nào được phân tích.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            analyses.map((item, index) => (
                                <tr
                                    key={item.id}
                                    onClick={() => onRowClick?.(item.id)}
                                    className="hover:bg-blue-50 cursor-pointer"
                                    title="Click để xem chi tiết phân tích"
                                >
                                    <td className="px-4 py-3 border border-slate-200 font-mono text-slate-500 text-sm">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                        {item.operationName}
                                    </td>

                                    <td className="px-4 py-3 border border-slate-200 text-right text-sm">
                                        {item.skillGrade ?? '-'}
                                    </td>

                                    <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                        {item.machineName || '-'}
                                    </td>

                                    <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                        {item.machineCode || '-'}
                                    </td>

                                    <td className="px-4 py-3 border border-slate-200 text-right text-green-700 text-sm">
                                        {Number(item.finalSmv || 0).toFixed(0)}
                                    </td>

                                    <td className="px-4 py-3 border border-slate-200 text-slate-500 text-sm">
                                        {item.analysisNo}
                                    </td>

                                    <td className="px-4 py-3 border border-slate-200 text-slate-500 text-sm">
                                        {formatDateTime(item.createdAt || item.analysisDate)}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}