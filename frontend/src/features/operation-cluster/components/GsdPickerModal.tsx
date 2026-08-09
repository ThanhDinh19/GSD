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
};

function toNumber(value: unknown, defaultValue = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : defaultValue;
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
}: GsdPickerModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[800] bg-slate-900/40 flex items-center justify-center p-4">
            <div className="w-[96vw] h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Chọn công đoạn từ GSD
                        </h2>

                        <p className="text-xs text-slate-500 mt-1">
                            Tích chọn công đoạn bên trái. Các thao tác của công đoạn đã chọn sẽ hiển thị bên phải.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 grid grid-cols-[0.95fr_1.05fr] gap-4 flex-1 min-h-0">
                    {/* Bên trái: danh sách công đoạn */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col min-h-0">
                        <div className="p-3 border-b border-slate-200 bg-slate-50 shrink-0">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">
                                        Danh sách công đoạn
                                    </div>

                                    <div className="text-xs text-slate-500 mt-0.5">
                                        Đã chọn: {checkedIds.length} công đoạn
                                    </div>
                                </div>

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        onSearchChange(event.target.value)
                                    }
                                    className="w-[320px] border border-slate-300 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                                    placeholder="Tìm mã, tên công đoạn, máy..."
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <table className="w-full table-fixed text-[15px]">
                                <thead className="bg-white sticky top-0 z-10">
                                    <tr className="text-[11px] uppercase text-slate-500">
                                        <th className="p-2 border-b border-slate-200 text-center w-[52px]">
                                            Chọn
                                        </th>

                                        <th className="p-2 border-b border-slate-200 text-left">
                                            Công đoạn
                                        </th>

                                        <th className="p-2 border-b border-slate-200 text-right">
                                            MMTB
                                        </th>

                                        <th className="p-2 border-b border-slate-200 text-right">
                                            MMTB code
                                        </th>

                                        <th className="p-2 border-b border-slate-200 text-right">
                                            Bậc tay nghề
                                        </th>

                                        <th className="p-2 border-b border-slate-200 text-right">
                                            TMU
                                        </th>

                                        <th className="p-2 border-b border-slate-200 text-right w-[75px]">
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

                                    {options.map((item) => {
                                        const checked = checkedIds.includes(
                                            item.gsd_analysis_id
                                        );

                                        return (
                                            <tr
                                                key={item.gsd_analysis_id}
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
                                                        className="w-4 h-4"
                                                    />
                                                </td>

                                                <td className="p-2 align-top">
                                                    <div className="text-slate-800 line-clamp-2">
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
                                                    {toNumber(item.total_tmu).toFixed(2)}
                                                </td>

                                                <td className="p-2 text-right align-top text-slate-800">
                                                    {toNumber(item.sam_gsd).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bên phải: danh sách thao tác */}
                    <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col min-h-0">
                        <div className="p-3 border-b border-slate-200 bg-slate-50 shrink-0">
                            <div className="font-bold text-slate-800 text-[15px]">
                                Danh sách thao tác
                            </div>

                            <div className="text-xs text-slate-500 mt-0.5">
                                Hiển thị thao tác của tất cả công đoạn đã tích chọn.
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto">
                            {checkedGsds.length === 0 && (
                                <div className="p-10 text-center text-slate-400 text-sm">
                                    Chưa chọn công đoạn. Tích chọn công đoạn bên trái để xem thao tác.
                                </div>
                            )}

                            {checkedGsds.map((gsd, gsdIndex) => {
                                const actions =
                                    actionsMap[gsd.gsd_analysis_id] || [];

                                const isLoading = loadingActionIds.includes(
                                    gsd.gsd_analysis_id
                                );

                                return (
                                    <div
                                        key={gsd.gsd_analysis_id}
                                        className="border-b border-slate-200"
                                    >
                                        {/* Header công đoạn */}
                                        <div className="bg-blue-50 px-3 py-2 border-b border-blue-100">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="text-[15px] font-bold text-blue-700">
                                                        Công đoạn {gsdIndex + 1}:{' '}
                                                        {gsd.operation_name}
                                                    </div>

                                                    <div className="text-[11px] text-slate-500 mt-0.5 truncate">
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

                                        {/* Table thao tác */}
                                        {isLoading ? (
                                            <div className="p-5 text-center text-slate-400 text-sm">
                                                Đang tải thao tác...
                                            </div>
                                        ) : actions.length === 0 ? (
                                            <div className="p-5 text-center text-slate-400 text-sm">
                                                Công đoạn này chưa có thao tác.
                                            </div>
                                        ) : (
                                            <table className="w-full table-fixed text-[12px]">
                                                <thead className="bg-white">
                                                    <tr className="text-[11px] uppercase text-slate-500">
                                                        <th className="p-2 border-b border-slate-100 text-center w-[55px]">
                                                            Bước
                                                        </th>

                                                        <th className="p-2 border-b border-slate-100 text-left w-[75px]">
                                                            Code
                                                        </th>

                                                        <th className="p-2 border-b border-slate-100 text-left">
                                                            Thao tác
                                                        </th>

                                                        <th className="p-2 border-b border-slate-100 text-right w-[65px]">
                                                            TMU
                                                        </th>

                                                        <th className="p-2 border-b border-slate-100 text-right w-[65px]">
                                                            TS
                                                        </th>

                                                        <th className="p-2 border-b border-slate-100 text-right w-[70px]">
                                                            Giây
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {actions.map((action) => (
                                                        <tr
                                                            key={action.id}
                                                            className="border-b border-slate-50 hover:bg-slate-50"
                                                        >
                                                            <td className="p-2 text-center font-bold text-slate-600 text-[15px]">
                                                                {action.step_no ??
                                                                    action.line_no}
                                                            </td>

                                                            <td className="p-2 font-semibold text-blue-700 truncate text-[15px]">
                                                                {action.gsd_code ||
                                                                    '-'}
                                                            </td>

                                                            <td className="p-2">
                                                                <div className="line-clamp-2 text-slate-700 text-[15px]">
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

                                                            <td className="p-2 text-right font-bold text-[15px]">
                                                                {toNumber(
                                                                    action.seconds
                                                                ).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
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
                            className="px-5 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={checkedIds.length === 0}
                            className="px-6 py-2 rounded-sm bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}