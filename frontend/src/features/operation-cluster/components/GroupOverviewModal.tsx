import type {
    OperationClusterGroupPayload,
    OperationClusterOperationPayload,
} from '../../../types';

type OverviewOperation = OperationClusterOperationPayload & {
    adjusted_sam_preview?: number;
    utilization_rate_preview?: number;
    standard_price_preview?: number;
    required_efficiency_preview?: number;
};

type OverviewGroup = Omit<OperationClusterGroupPayload, 'operations'> & {
    operations: OverviewOperation[];
    tgcn: number;
};

type GroupOverviewModalProps = {
    open: boolean;
    groups: OverviewGroup[];
    requiredEfficiency: number;
    onClose: () => void;
};

function toNumber(value: unknown, defaultValue = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : defaultValue;
}

export default function GroupOverviewModal({
    open,
    groups,
    requiredEfficiency,
    onClose,
}: GroupOverviewModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[95] bg-slate-900/40 flex items-center justify-center p-4">
            <div className="w-[1450px] max-w-[96vw] h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Tổng quan cụm công đoạn
                        </h2>

                        <p className="text-xs text-slate-500 mt-0.5">
                            Xem toàn bộ cụm và công đoạn trước khi lưu chứng từ.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 overflow-auto bg-white">
                    {groups.length === 0 && (
                        <div className="p-10 text-center text-slate-400">
                            Chưa có cụm để hiển thị.
                        </div>
                    )}

                    {groups.map((group, groupIndex) => {
                        const totalSamGsd = group.operations.reduce(
                            (sum, op) => sum + toNumber(op.sam_gsd, 0),
                            0
                        );

                        const totalAdjustedSam = group.operations.reduce(
                            (sum, op) => sum + toNumber(op.adjusted_sam_preview, 0),
                            0
                        );

                        const totalActions = group.operations.reduce(
                            (sum, op) => sum + toNumber(op.total_actions, 0),
                            0
                        );

                        const totalManpower = group.operations.reduce(
                            (sum, op) => sum + toNumber(op.manpower, 0),
                            0
                        );

                        return (
                            <div
                                key={groupIndex}
                                className="border-b border-slate-200"
                            >
                                {/* Header cụm */}
                                <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="text-sm font-bold text-blue-700">
                                                Cụm {groupIndex + 1}: {group.cluster_name || '-'}
                                            </div>

                                            <div className="text-xs text-slate-500 mt-1">
                                                {group.operations.length} công đoạn{' '}
                                                • SMV: {totalSamGsd.toFixed(2)}{' '}
                                                • SMV ĐC/TGCN: {totalAdjustedSam.toFixed(2)}{' '}
                                                • Bước GSD: {totalActions}{' '}
                                                • Nhân sự: {totalManpower.toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 shrink-0 text-right">
                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase">
                                                    Số CĐ
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {group.operations.length}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase">
                                                    SMV
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {totalSamGsd.toFixed(2)}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase">
                                                    TGCN
                                                </div>
                                                <div className="text-sm font-bold text-blue-700">
                                                    {totalAdjustedSam.toFixed(2)}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase">
                                                    Nhân sự
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {totalManpower.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Table công đoạn của cụm */}
                                <div className="overflow-auto">
                                    <table className="w-full text-sm min-w-[1450px] border-collapse">
                                        <thead className="bg-white">
                                            <tr className="text-xs text-slate-500 uppercase">
                                                <th className="p-3 border border-slate-100 text-center w-[60px]">
                                                    STT
                                                </th>
                                                <th className="p-3 border border-slate-100 text-left w-[110px]">
                                                    Xếp chuyền
                                                </th>
                                                <th className="p-3 border border-slate-100 text-left">
                                                    Công đoạn
                                                </th>
                                                <th className="p-3 border border-slate-100 text-center w-[70px]">
                                                    Bậc
                                                </th>
                                                <th className="p-3 border border-slate-100 text-left w-[180px]">
                                                    MMTB
                                                </th>
                                                <th className="p-3 border border-slate-100 text-left w-[110px]">
                                                    Code
                                                </th>
                                                <th className="p-3 border border-slate-100 text-right w-[100px]">
                                                    SMV
                                                </th>
                                                <th className="p-3 border border-slate-100 text-right w-[100px]">
                                                    Hệ số
                                                </th>
                                                <th className="p-3 border border-slate-100 text-center w-[90px]">
                                                    Nhân sự
                                                </th>
                                                <th className="p-3 border border-slate-100 text-right w-[110px]">
                                                    Đơn giá
                                                </th>
                                                <th className="p-3 border border-slate-100 text-center w-[90px]">
                                                    HS YC
                                                </th>
                                                <th className="p-3 border border-slate-100 text-right w-[110px]">
                                                    SMV ĐC
                                                </th>
                                                <th className="p-3 border border-slate-100 text-center w-[100px]">
                                                    Hiệu suất
                                                </th>
                                                <th className="p-3 border border-slate-100 text-center w-[100px]">
                                                    Bước GSD
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {group.operations.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={14}
                                                        className="p-8 border border-slate-100 text-center text-slate-400"
                                                    >
                                                        Cụm này chưa có công đoạn.
                                                    </td>
                                                </tr>
                                            )}

                                            {group.operations.map((op, operationIndex) => (
                                                <tr
                                                    key={`${groupIndex}-${op.gsd_analysis_id}-${operationIndex}`}
                                                    className="hover:bg-slate-50"
                                                >
                                                    <td className="p-3 border border-slate-100 text-center text-slate-500">
                                                        {operationIndex + 1}
                                                    </td>

                                                    <td className="p-3 border border-slate-100">
                                                        {op.line_balance_no || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-slate-800">
                                                        {op.operation_name || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-center">
                                                        {op.skill_level || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-100">
                                                        {op.machine_name || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-100">
                                                        {op.machine_code || '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-right font-bold">
                                                        {toNumber(op.sam_gsd, 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-right">
                                                        {toNumber(op.salary_coefficient, 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-center">
                                                        {op.manpower ?? '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-right">
                                                        {toNumber(op.standard_price_preview, 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-center">
                                                        {requiredEfficiency
                                                            ? `${(requiredEfficiency * 100).toFixed(0)}%`
                                                            : '-'}
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-right text-blue-700 font-bold">
                                                        {toNumber(op.adjusted_sam_preview, 0).toFixed(2)}
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-center">
                                                        {(toNumber(op.utilization_rate_preview, 0) * 100).toFixed(0)}%
                                                    </td>

                                                    <td className="p-3 border border-slate-100 text-center">
                                                        {op.total_actions || 0}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}