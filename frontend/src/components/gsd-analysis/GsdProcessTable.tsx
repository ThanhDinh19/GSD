import { GsdAnalysisSummary } from '../../types';

interface GsdProcessTableProps {
    analyses: GsdAnalysisSummary[];
    loading?: boolean;
    onRefresh?: () => void;

    selectedId?: number | null;
    onRowClick?: (analysisId: number) => void;
    onDetailClick?: (analysisId: number) => void;

    showRefreshButton?: boolean;
}

function formatDateTime(value?: string) {
    if (!value) return '';

    const normalized = value.replace(' ', 'T');
    const [datePart, timePart = ''] = normalized.split('T');

    const [year, month, day] = datePart.split('-');
    const [hour = '00', minute = '00', secondRaw = '00'] =
        timePart.split(':');

    const second = secondRaw.split('.')[0];

    if (!year || !month || !day) return value;

    return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
}

export default function GsdProcessTable({
    analyses,
    loading = false,
    onRefresh,

    selectedId = null,
    onRowClick,
    onDetailClick,

    showRefreshButton = true,
}: GsdProcessTableProps) {
    const columnCount = onDetailClick ? 8 : 7;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                        Quy trình công đoạn
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                        Chọn một công đoạn rồi bấm Sửa để chỉnh sửa phân tích.
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
                            <th className="px-4 py-1.5 border border-slate-200 text-left">
                                STT
                            </th>

                            {onDetailClick && (
                                <th className="px-4 py-1.5 border border-slate-200 text-left">
                                    Bước công việc
                                </th>
                            )}

                            <th className="px-4 py-1.5 border border-slate-200 text-right">
                                Bậc thợ
                            </th>

                            <th className="px-4 py-1.5 border border-slate-200 text-left">
                                Nhu cầu CC+DC, MMTB
                            </th>

                            <th className="px-4 py-1.5 border border-slate-200 text-left">
                                MMTB Code
                            </th>

                            <th className="px-4 py-1.5 border border-slate-200 text-right">
                                Thời gian chuẩn
                            </th>

                            <th className="px-4 py-1.5 border border-slate-200 text-left  whitespace-nowrap">
                                Ngày tạo
                            </th>


                            {/* <th className="px-4 py-3 border border-slate-200 text-center">
                                Chi tiết
                            </th> */}

                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td
                                    colSpan={columnCount}
                                    className="px-4 py-6 border border-slate-200 text-center text-slate-400"
                                >
                                    Đang tải quy trình công đoạn...
                                </td>
                            </tr>
                        )}

                        {!loading && analyses.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columnCount}
                                    className="px-4 py-6 border border-slate-200 text-center text-slate-400"
                                >
                                    Chưa có công đoạn nào được phân tích.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            analyses.map((item, index) => {
                                const isSelected =
                                    selectedId === item.id;

                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() =>
                                            onRowClick?.(item.id)
                                        }
                                        className={`cursor-pointer ${isSelected
                                            ? 'bg-blue-100'
                                            : 'hover:bg-blue-50'
                                            }`}
                                        title="Chọn công đoạn"
                                    >


                                        <td className="px-4 py-3 border border-slate-200 font-mono text-slate-500 text-sm">
                                            {index + 1}
                                        </td>
                                        {/* 
                                        <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                            {item.operationName}
                                        </td> */}

                                        {onDetailClick && (
                                            <td className="px-4 py-3 border border-slate-200 text-left text-[15px]">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();

                                                        onDetailClick(
                                                            item.id
                                                        );
                                                    }}
                                                    className="text-blue-700 hover:underline"
                                                >
                                                    {item.operationName}
                                                </button>
                                            </td>
                                        )}

                                        <td className="px-4 py-3 border border-slate-200 text-right text-sm">
                                            {item.skillGrade ?? '-'}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                            {item.machineName || '-'}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                            {item.codeMMTB || '-'}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-right text-green-700 text-sm">
                                            {Number(
                                                item.finalSmv || 0
                                            ).toFixed(0)}
                                        </td>

                                        <td className="px-4 py-1.5 border border-slate-200 text-slate-500 text-sm whitespace-nowrap">
                                            {formatDateTime(item.createdAt || item.analysisDate)}
                                        </td>

                                        {/* {onDetailClick && (
                                            <td className="px-4 py-3 border border-slate-200 text-center">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();

                                                        onDetailClick(
                                                            item.id
                                                        );
                                                    }}
                                                    className="text-blue-700 font-bold hover:underline"
                                                >
                                                    Xem
                                                </button>
                                            </td>
                                        )} */}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}