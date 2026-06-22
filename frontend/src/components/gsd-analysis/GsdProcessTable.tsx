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

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('vi-VN');
}

export default function GsdProcessTable({
    analyses,
    loading = false,
    onRefresh,
    onRowClick,
    showRefreshButton = true,
}: GsdProcessTableProps) {
    return (
        <div className="bg-white rounded-xl border-slate-200 p-5">
            <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
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
                        className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-50 disabled:opacity-50"
                    >
                        {loading ? 'Đang tải...' : 'Tải lại'}
                    </button>
                )}
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">STT</th>
                            <th className="px-4 py-3 text-left">Bước công việc</th>
                            <th className="px-4 py-3 text-right">Bậc thợ</th>
                            <th className="px-4 py-3 text-left">Nhu cầu CC+DC, MMTB</th>
                            <th className="px-4 py-3 text-left">Code MMTB</th>
                            <th className="px-4 py-3 text-right">Thời gian chuẩn</th>
                            <th className="px-4 py-3 text-left">Mã phân tích</th>
                            <th className="px-4 py-3 text-left">Ngày tạo</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {loading && (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                                    Đang tải quy trình công đoạn...
                                </td>
                            </tr>
                        )}

                        {!loading && analyses.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                                    Chưa có công đoạn nào được phân tích.
                                </td>
                            </tr>
                        )}

                        {!loading && analyses.map((item, index) => (
                            <tr
                                key={item.id}
                                onClick={() => onRowClick?.(item.id)}
                                className="hover:bg-blue-50 cursor-pointer"
                                title="Click để xem chi tiết phân tích"
                            >
                                <td className="px-4 py-3 font-mono text-slate-500">
                                    {index + 1}
                                </td>

                                <td className="px-4 py-3 font-bold text-slate-700">
                                    {item.operationName}
                                </td>

                                <td className="px-4 py-3 text-right font-bold">
                                    {item.skillGrade ?? '-'}
                                </td>

                                <td className="px-4 py-3 text-slate-700">
                                    {item.machineName || '-'}
                                </td>

                                <td className="px-4 py-3 text-slate-700">
                                    {item.machineCode || '-'}
                                </td>

                                <td className="px-4 py-3 text-right font-black text-green-700">
                                    {Number(item.finalSmv || 0).toFixed(0)}
                                </td>

                                <td className="px-4 py-3 text-slate-500">
                                    {item.analysisNo}
                                </td>

                                <td className="px-4 py-3 text-slate-500">
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