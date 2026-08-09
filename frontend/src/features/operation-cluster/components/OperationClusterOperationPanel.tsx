import type {
    MouseEvent,
} from 'react';

import type {
    OperationClusterOperationPayload,
} from '../../../types';

type OperationClusterOperationView =
    OperationClusterOperationPayload & {
        cluster_name?: string;
        group_line_no_preview?: number;
        required_efficiency_preview?: number;
        adjusted_sam_preview?: number;
        utilization_rate_preview?: number;
        standard_price_preview?: number;
    };

type OperationClusterOperationPanelProps = {
    operations: OperationClusterOperationView[];
    viewAllGroups: boolean;
    activeGroupName: string;
    formRequiredEfficiency: string;

    onOpenOverview: () => void;
    onOpenGsd: () => void;

    onOpenOperationActions: (
        operation: OperationClusterOperationView
    ) => void;

    onOpenCoefficientPopup: (
        event: MouseEvent<HTMLButtonElement>,
        operationIndex: number
    ) => void;

    onChangeLineBalanceNo: (
        operationIndex: number,
        value: string
    ) => void;

    onChangeManpower: (
        operationIndex: number,
        value: string
    ) => void;

    onChangeEfficiency: (
        operationIndex: number,
        value: string
    ) => void;

    onRemoveOperation: (
        operationIndex: number
    ) => void;
};

function toNumber(
    value: unknown,
    defaultValue = 0
) {
    const numberValue = Number(value);

    return Number.isFinite(numberValue)
        ? numberValue
        : defaultValue;
}

export default function OperationClusterOperationPanel({
    operations,
    viewAllGroups,
    activeGroupName,
    formRequiredEfficiency,
    onOpenOverview,
    onOpenGsd,
    onOpenOperationActions,
    onOpenCoefficientPopup,
    onChangeLineBalanceNo,
    onChangeManpower,
    onChangeEfficiency,
    onRemoveOperation,
}: OperationClusterOperationPanelProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-3 flex flex-col min-w-0 min-h-0">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-base font-bold text-slate-800">
                        Khai báo công đoạn cho chủng loại hàng
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                        {viewAllGroups
                            ? 'Đang xem tất cả công đoạn của mọi cụm.'
                            : `Đang thao tác trên cụm: ${activeGroupName || '-'}`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenOverview}
                        className="px-4 py-2 rounded-sm border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50"
                    >
                        Xem tất cả cụm
                    </button>

                    <button
                        type="button"
                        onClick={onOpenGsd}
                        disabled={viewAllGroups}
                        className="px-5 py-2 rounded-sm bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                        + Chọn công đoạn từ GSD
                    </button>
                </div>
            </div>

            <div className="border border-slate-200 rounded-sm overflow-x-auto">
                <div className="h-full min-w-[1500px] overflow-y-auto overflow-x-hidden no-scrollbar-y">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr className="text-xs text-slate-500 uppercase">
                                <th className="p-3 border border-slate-200 text-left w-[40px]">
                                    STT
                                </th>

                                <th className="p-3 border border-slate-200 text-left w-[110px]">
                                    Xếp chuyền
                                </th>

                                <th className="p-3 border border-slate-200 text-left w-[260px]">
                                    Công đoạn
                                </th>

                                <th className="p-3 border border-slate-200 text-center w-[30px]">
                                    Bậc
                                </th>

                                <th className="p-3 border border-slate-200 text-left w-[220px]">
                                    MMTB
                                </th>

                                <th className="p-3 border border-slate-200 text-left w-[100px]">
                                    MMTB Code
                                </th>

                                <th className="p-3 border border-slate-200 text-right w-[100px]">
                                    SMV
                                </th>

                                <th className="p-3 border border-slate-200 text-right w-[100px]">
                                    Hệ số
                                </th>

                                <th className="p-3 border border-slate-200 text-center w-[90px]">
                                    Nhân sự
                                </th>

                                <th className="p-3 border border-slate-200 text-right w-[120px]">
                                    Đơn giá
                                </th>

                                <th className="p-3 border border-slate-200 text-center w-[90px]">
                                    HS YC
                                </th>

                                <th className="p-3 border border-slate-200 text-right w-[100px]">
                                    SMV ĐC
                                </th>

                                <th className="p-3 border border-slate-200 text-center w-[100px]">
                                    Hiệu suất
                                </th>

                                <th className="p-3 border border-slate-200 text-center w-[100px]">
                                    Bước GSD
                                </th>

                                <th className="p-3 border border-slate-200 text-center w-[50px]">
                                    Xóa
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {operations.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={15}
                                        className="p-10 text-center text-slate-400"
                                    >
                                        Chưa có công đoạn. Chọn công đoạn GSD để thêm.
                                    </td>
                                </tr>
                            )}

                            {operations.map((operation, index) => {
                                const requiredEfficiencyRaw =
                                    operation.required_efficiency !== null &&
                                    operation.required_efficiency !== undefined
                                        ? String(operation.required_efficiency)
                                        : String(formRequiredEfficiency || '');

                                const requiredEfficiency =
                                    requiredEfficiencyRaw &&
                                    requiredEfficiencyRaw !== '.'
                                        ? toNumber(
                                              requiredEfficiencyRaw,
                                              0
                                          )
                                        : 0;

                                return (
                                    <tr
                                        key={`${operation.gsd_analysis_id}-${index}`}
                                        className="border-b border-slate-100 hover:bg-slate-50"
                                    >
                                        <td className="p-3 text-slate-500 border border-slate-200 text-center">
                                            {index + 1}
                                        </td>

                                        <td className="p-3 border border-slate-200 text-center">
                                            <input
                                                value={operation.line_balance_no || ''}
                                                onChange={(event) =>
                                                    onChangeLineBalanceNo(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                disabled={viewAllGroups}
                                                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-center outline-none disabled:bg-slate-100"
                                            />
                                        </td>

                                        <td className="p-3 border border-slate-200 text-left">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onOpenOperationActions(
                                                        operation
                                                    )
                                                }
                                                className="text-slate-800 hover:text-blue-700 hover:underline text-left"
                                                title="Click để xem danh sách thao tác"
                                            >
                                                {operation.operation_name}
                                            </button>

                                            {viewAllGroups && (
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    Cụm:{' '}
                                                    {operation.cluster_name || '-'}
                                                </div>
                                            )}
                                        </td>

                                        <td className="p-3 border border-slate-200 text-center">
                                            {operation.skill_level || '-'}
                                        </td>

                                        <td className="p-3 border border-slate-200 text-left">
                                            {operation.machine_name || '-'}
                                        </td>

                                        <td className="p-3 border border-slate-200 text-left">
                                            {operation.code_mmtb || '-'}
                                        </td>

                                        <td className="p-3 font-semibold border border-slate-200 text-center">
                                            {toNumber(
                                                operation.sam_gsd
                                            ).toFixed(2)}
                                        </td>

                                        <td className="p-2 border border-slate-200 text-center">
                                            <button
                                                type="button"
                                                onClick={(event) =>
                                                    onOpenCoefficientPopup(
                                                        event,
                                                        index
                                                    )
                                                }
                                                disabled={viewAllGroups}
                                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-right text-blue-700 hover:border-blue-400 hover:bg-blue-50 disabled:bg-slate-100 disabled:text-slate-400"
                                                title="Click để chọn hệ số lương"
                                            >
                                                {toNumber(
                                                    operation.salary_coefficient
                                                ).toFixed(2)}
                                            </button>
                                        </td>

                                        <td className="p-2 border border-slate-200 text-center">
                                            <input
                                                value={operation.manpower ?? ''}
                                                onChange={(event) =>
                                                    onChangeManpower(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                disabled={viewAllGroups}
                                                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-center outline-none disabled:bg-slate-100"
                                            />
                                        </td>

                                        <td className="p-3 border border-slate-200 text-right">
                                            {toNumber(
                                                operation.standard_price_preview
                                            ).toFixed(2)}
                                        </td>

                                        <td className="p-2 border border-slate-200 text-center">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={requiredEfficiencyRaw}
                                                onChange={(event) =>
                                                    onChangeEfficiency(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                disabled={viewAllGroups}
                                                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-center outline-none disabled:bg-slate-100"
                                                placeholder="0.8"
                                            />

                                            <div className="text-[10px] text-slate-400 mt-1">
                                                {requiredEfficiency > 0
                                                    ? `${(
                                                          requiredEfficiency *
                                                          100
                                                      ).toFixed(0)}%`
                                                    : '-'}
                                            </div>
                                        </td>

                                        <td className="p-3 border border-slate-200 text-right">
                                            {toNumber(
                                                operation.adjusted_sam_preview
                                            ).toFixed(2)}
                                        </td>

                                        <td className="p-3 border border-slate-200 text-center">
                                            {(
                                                toNumber(
                                                    operation.utilization_rate_preview
                                                ) * 100
                                            ).toFixed(0)}
                                            %
                                        </td>

                                        <td className="p-3 border border-slate-200 text-center">
                                            {operation.total_actions || 0}
                                        </td>

                                        <td className="p-3 border border-slate-200 text-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onRemoveOperation(index)
                                                }
                                                disabled={viewAllGroups}
                                                className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}