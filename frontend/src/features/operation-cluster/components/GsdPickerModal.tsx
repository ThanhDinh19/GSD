import type {
    GsdActionDetail,
    GsdOption,
} from '../../../types';

type GsdPickerModalProps = {
    open: boolean;

    search: string;
    checkedIds: number[];

    options: GsdOption[];
    checkedGsds: GsdOption[];

    actionsMap: Record<number, GsdActionDetail[]>;
    loadingActionIds: number[];

    onSearchChange: (value: string) => void;
    onToggle: (gsd: GsdOption) => void;
    onCancel: () => void;
    onConfirm: () => void;

    onCopy?: () => void;
    copyDisabled?: boolean;
};

function toNumber(
    value: unknown,
    defaultValue = 0
) {
    const num =
        Number(value);

    return Number.isFinite(num)
        ? num
        : defaultValue;
}

export default function GsdPickerModal({
    open,
    search,
    checkedIds,
    options,
    checkedGsds,
    actionsMap,
    loadingActionIds,
    onSearchChange,
    onToggle,
    onCancel,
    onConfirm,
    onCopy,
    copyDisabled = false,
}: GsdPickerModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[800] flex items-center justify-center bg-slate-900/40 p-4">
            <div className="flex h-[90vh] w-[96vw] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Chọn công đoạn từ GSD
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Tích chọn công đoạn bên trái. Các thao tác của công đoạn đã chọn sẽ hiển thị bên phải.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="h-9 w-9 rounded-full font-black text-slate-500 hover:bg-slate-100"
                    >
                        ✕
                    </button>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-[0.95fr_1.05fr] gap-4 p-4">
                    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
                        <div className="shrink-0 border-b border-slate-200 bg-slate-50 p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">
                                        Danh sách công đoạn
                                    </div>

                                    <div className="mt-0.5 text-xs text-slate-500">
                                        Đã chọn: {checkedIds.length} công đoạn
                                    </div>
                                </div>

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        onSearchChange(
                                            event.target.value
                                        )
                                    }
                                    className="w-[320px] rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Tìm mã, tên công đoạn, máy..."
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <table className="w-full table-fixed text-[15px]">
                                <thead className="sticky top-0 z-10 bg-white">
                                    <tr className="text-[11px] uppercase text-slate-500">
                                        <th className="w-[52px] border-b border-slate-200 p-2 text-center">
                                            Chọn
                                        </th>

                                        <th className="border-b border-slate-200 p-2 text-left">
                                            Công đoạn
                                        </th>

                                        <th className="border-b border-slate-200 p-2 text-right">
                                            MMTB
                                        </th>

                                        <th className="border-b border-slate-200 p-2 text-right">
                                            MMTB code
                                        </th>

                                        <th className="border-b border-slate-200 p-2 text-right">
                                            Bậc tay nghề
                                        </th>

                                        <th className="border-b border-slate-200 p-2 text-right">
                                            TMU
                                        </th>

                                        <th className="w-[75px] border-b border-slate-200 p-2 text-right">
                                            SMV
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {options.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="p-8 text-center text-slate-400"
                                            >
                                                Không có công đoạn GSD phù hợp.
                                            </td>
                                        </tr>
                                    )}

                                    {options.map(
                                        (
                                            item,
                                            index
                                        ) => {
                                            const checked =
                                                checkedIds.includes(
                                                    item.gsd_analysis_id
                                                );

                                            return (
                                                <tr
                                                    key={`${item.gsd_analysis_id}-${item.operation_code}-${index}`}
                                                    className={`border-b border-slate-100 ${
                                                        checked
                                                            ? 'bg-blue-50'
                                                            : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <td className="p-2 text-center align-top">
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() =>
                                                                onToggle(item)
                                                            }
                                                            className="h-4 w-4"
                                                        />
                                                    </td>

                                                    <td className="p-2 align-top">
                                                        <div className="line-clamp-2 text-slate-800">
                                                            {item.operation_name}
                                                        </div>
                                                    </td>

                                                    <td className="p-2 text-right align-top text-slate-800">
                                                        {item.machine_name || '-'}
                                                    </td>

                                                    <td className="p-2 text-right align-top text-slate-800">
                                                        {item.code_mmtb || '-'}
                                                    </td>

                                                    <td className="p-2 text-right align-top text-slate-800">
                                                        {item.skill_level ?? '-'}
                                                    </td>

                                                    <td className="p-2 text-right align-top text-slate-800">
                                                        {toNumber(
                                                            item.total_tmu
                                                        ).toFixed(2)}
                                                    </td>

                                                    <td className="p-2 text-right align-top text-slate-800">
                                                        {toNumber(
                                                            item.sam_gsd
                                                        ).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200">
                        <div className="shrink-0 border-b border-slate-200 bg-slate-50 p-3">
                            <div className="text-[15px] font-bold text-slate-800">
                                Danh sách thao tác
                            </div>

                            <div className="mt-0.5 text-xs text-slate-500">
                                Hiển thị thao tác của tất cả công đoạn đã tích chọn.
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {checkedGsds.length === 0 && (
                                <div className="p-10 text-center text-sm text-slate-400">
                                    Chưa chọn công đoạn. Tích chọn công đoạn bên trái để xem thao tác.
                                </div>
                            )}

                            {checkedGsds.map(
                                (
                                    gsd,
                                    gsdIndex
                                ) => {
                                    const actions =
                                        actionsMap[
                                            gsd.gsd_analysis_id
                                        ] || [];

                                    const isLoading =
                                        loadingActionIds.includes(
                                            gsd.gsd_analysis_id
                                        );

                                    return (
                                        <div
                                            key={`${gsd.gsd_analysis_id}-${gsd.operation_code}-${gsdIndex}`}
                                            className="border-b border-slate-200"
                                        >
                                            <div className="border-b border-blue-100 bg-blue-50 px-3 py-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="text-[15px] font-bold text-blue-700">
                                                            Công đoạn {gsdIndex + 1}:{' '}
                                                            {gsd.operation_name}
                                                        </div>

                                                        <div className="mt-0.5 truncate text-[11px] text-slate-500">
                                                            MMTB:{' '}
                                                            {gsd.machine_name || '-'}
                                                            {gsd.machine_code
                                                                ? ` • ${gsd.code_mmtb || gsd.machine_code}`
                                                                : ''}
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <div className="text-[15px] text-slate-500">
                                                            SMV
                                                        </div>

                                                        <div className="text-sm text-blue-700">
                                                            {toNumber(
                                                                gsd.sam_gsd
                                                            ).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {isLoading ? (
                                                <div className="p-5 text-center text-sm text-slate-400">
                                                    Đang tải thao tác...
                                                </div>
                                            ) : actions.length === 0 ? (
                                                <div className="p-5 text-center text-sm text-slate-400">
                                                    Công đoạn này chưa có thao tác.
                                                </div>
                                            ) : (
                                                <table className="w-full table-fixed text-[12px]">
                                                    <thead className="bg-white">
                                                        <tr className="text-[11px] uppercase text-slate-500">
                                                            <th className="w-[55px] border-b border-slate-100 p-2 text-center">
                                                                Bước
                                                            </th>

                                                            <th className="w-[75px] border-b border-slate-100 p-2 text-left">
                                                                Code
                                                            </th>

                                                            <th className="border-b border-slate-100 p-2 text-left">
                                                                Thao tác
                                                            </th>

                                                            <th className="w-[65px] border-b border-slate-100 p-2 text-right">
                                                                TMU
                                                            </th>

                                                            <th className="w-[65px] border-b border-slate-100 p-2 text-right">
                                                                TS
                                                            </th>

                                                            <th className="w-[70px] border-b border-slate-100 p-2 text-right">
                                                                Giây
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {actions.map(
                                                            (
                                                                action,
                                                                actionIndex
                                                            ) => (
                                                                <tr
                                                                    key={`${action.id}-${action.line_no}-${action.step_no}-${actionIndex}`}
                                                                    className="border-b border-slate-50 hover:bg-slate-50"
                                                                >
                                                                    <td className="p-2 text-center text-[15px] font-bold text-slate-600">
                                                                        {action.step_no ??
                                                                            action.line_no}
                                                                    </td>

                                                                    <td className="truncate p-2 text-[15px] font-semibold text-blue-700">
                                                                        {action.gsd_code ||
                                                                            '-'}
                                                                    </td>

                                                                    <td className="p-2">
                                                                        <div className="line-clamp-2 text-[15px] text-slate-700">
                                                                            {action.action_name}
                                                                        </div>
                                                                    </td>

                                                                    <td className="p-2 text-right text-[15px]">
                                                                        {toNumber(
                                                                            action.tmu
                                                                        ).toFixed(2)}
                                                                    </td>

                                                                    <td className="p-2 text-right text-[15px]">
                                                                        {toNumber(
                                                                            action.frequency
                                                                        ).toFixed(2)}
                                                                    </td>

                                                                    <td className="p-2 text-right text-[15px] font-bold">
                                                                        {toNumber(
                                                                            action.seconds
                                                                        ).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
                    <div className="text-sm text-slate-500">
                        Đã chọn{' '}
                        <span className="font-black text-blue-700">
                            {checkedIds.length}
                        </span>{' '}
                        công đoạn.
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-sm border border-slate-300 bg-white px-5 py-2 text-sm hover:bg-slate-50"
                        >
                            Hủy
                        </button>

                        {onCopy && (
                            <button
                                type="button"
                                onClick={onCopy}
                                disabled={copyDisabled}
                                className="rounded-sm border border-amber-300 bg-amber-50 px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Chọn đúng 1 công đoạn để copy"
                            >
                                Copy
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={checkedIds.length === 0}
                            className="rounded-sm bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}