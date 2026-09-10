import {
    useMemo,
    useRef,
    useState,
} from 'react';

import type {
    SourceMaster,
} from '../../../types';

import type {
    GsdAnalysisRow,
} from '../types/gsdAnalysis.types';

interface SourceActionPickerModalProps {
    sources: SourceMaster[];
    popupSourceId: number | null;
    popupRows: GsdAnalysisRow[];
    selectedDraftRows: GsdAnalysisRow[];
    loadingSourceActions: boolean;
    selectedDraftCount: number;

    onSelectSource: (
        sourceId: number
    ) => Promise<void>;

    onStepChange: (
        sourceId: number,
        rowIndex: number,
        value: string
    ) => void;

    onFrequencyChange: (
        sourceId: number,
        rowIndex: number,
        value: string
    ) => void;

    onUncheckRow: (
        sourceId: number,
        rowIndex: number
    ) => void;

    onTakeData: () => void;
    onClose: () => void;

    onToggleRowSelection: (
        sourceId: number,
        rowIndex: number,
        checked: boolean
    ) => void;
}

type SelectedSourceSummary = {
    sourceId: number;
    sourceName: string;
    note?: string | null;
    count: number;
};

function getSourceLabel(
    source: SourceMaster | undefined,
    sourceId: number
): string {
    return (
        source?.sourceName ||
        `Source ${sourceId}`
    );
}

export default function SourceActionPickerModal({
    sources,
    popupSourceId,
    popupRows,
    selectedDraftRows,
    loadingSourceActions,
    selectedDraftCount,
    onSelectSource,
    onStepChange,
    onFrequencyChange,
    onUncheckRow,
    onTakeData,
    onClose,
    onToggleRowSelection,
}: SourceActionPickerModalProps) {
    const [
        keyword,
        setKeyword,
    ] = useState('');

    const sourceButtonRefs =
        useRef<
            Map<
                number,
                HTMLButtonElement | null
            >
        >(
            new Map()
        );

    const normalizedKeyword =
        keyword
            .trim()
            .toLowerCase();

    const filteredSources =
        normalizedKeyword
            ? sources.filter(
                (item) => {
                    const sourceName =
                        String(
                            item.sourceName ?? ''
                        ).toLowerCase();

                    const note =
                        String(
                            item.note ?? ''
                        ).toLowerCase();

                    return (
                        sourceName.includes(
                            normalizedKeyword
                        ) ||
                        note.includes(
                            normalizedKeyword
                        )
                    );
                }
            )
            : sources;

    const selectedSourceSummaries =
        useMemo<
            SelectedSourceSummary[]
        >(
            () => {
                const map =
                    new Map<
                        number,
                        SelectedSourceSummary
                    >();

                for (
                    const row
                    of selectedDraftRows
                ) {
                    const sourceId =
                        Number(
                            row.sourceId ?? 0
                        );

                    if (!sourceId) {
                        continue;
                    }

                    const source =
                        sources.find(
                            (item) =>
                                Number(
                                    item.id
                                ) === sourceId
                        );

                    const existed =
                        map.get(
                            sourceId
                        );

                    if (existed) {
                        existed.count += 1;

                        continue;
                    }

                    map.set(
                        sourceId,
                        {
                            sourceId,
                            sourceName:
                                getSourceLabel(
                                    source,
                                    sourceId
                                ),
                            note:
                                source?.note ?? null,
                            count: 1,
                        }
                    );
                }

                return Array.from(
                    map.values()
                ).sort(
                    (
                        first,
                        second
                    ) =>
                        first.sourceName.localeCompare(
                            second.sourceName,
                            'vi'
                        )
                );
            },
            [
                selectedDraftRows,
                sources,
            ]
        );

    const handleJumpToSource =
        async (
            sourceId: number
        ) => {
            setKeyword('');

            await onSelectSource(
                sourceId
            );

            scrollToSource(
                sourceId
            );
        };

    const scrollToSource =
        (
            sourceId: number
        ) => {
            let attempts = 0;

            const run = () => {
                const element =
                    sourceButtonRefs
                        .current
                        .get(
                            sourceId
                        );

                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest',
                    });

                    return;
                }

                attempts += 1;

                if (attempts < 8) {
                    window.requestAnimationFrame(
                        run
                    );
                }
            };

            window.requestAnimationFrame(
                run
            );
        };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
            <div className="flex h-[820px] max-h-[92vh] w-[1500px] max-w-[96vw] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="shrink-0 border-b border-slate-100 px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-black uppercase text-slate-800">
                                Lấy thao tác thuộc source
                            </h3>
                            {/* 
                            <p className="mt-1 text-sm text-slate-500">
                                Chọn source ở danh sách bên trái, nhập bước cho thao tác cần phân tích.
                                Các bước không được trùng trên tất cả source.
                            </p> */}

                            {selectedSourceSummaries.length > 0 && (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {/* <span className="text-xs font-bold uppercase text-slate-500">
                                        Source đã chọn:
                                    </span> */}

                                    {selectedSourceSummaries.map(
                                        (item) => {
                                            const active =
                                                Number(
                                                    popupSourceId
                                                ) ===
                                                Number(
                                                    item.sourceId
                                                );

                                            return (
                                                <button
                                                    key={
                                                        item.sourceId
                                                    }
                                                    type="button"
                                                    onClick={() => {
                                                        void handleJumpToSource(
                                                            item.sourceId
                                                        );
                                                    }}
                                                    className={`inline-flex items-center gap-1 rounded-full  px-3 py-1 text-xs font-bold transition ${active
                                                            ? 'border-blue-300 bg-blue-100 text-blue-800'
                                                            : 'border-blue-100 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100'
                                                        }`}
                                                    title={
                                                        item.note ||
                                                        item.sourceName
                                                    }
                                                >
                                                    <span className="max-w-[220px] truncate underline underline-offset-2">
                                                        {item.sourceName}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${active
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-white text-blue-700'
                                                            }`}
                                                    >
                                                        {item.count}
                                                    </span>
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            className="text-2xl text-slate-400 hover:text-slate-700"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden p-6">
                    <div className="grid h-full min-h-0 grid-cols-[360px_1fr] gap-5">
                        <div className="h-full min-h-0">
                            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200">
                                <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-3">
                                    <div className="text-sm font-bold text-slate-700">
                                        Source
                                    </div>
                                </div>

                                <div className="shrink-0 border-b border-slate-100 px-4 py-3">
                                    <div className="text-sm font-bold text-slate-700">
                                        Tìm kiếm
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Nhập tên source, ghi chú"
                                        value={keyword}
                                        onChange={(event) =>
                                            setKeyword(
                                                event.target.value
                                            )
                                        }
                                        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    {filteredSources.length === 0 ? (
                                        <div className="px-4 py-6 text-center text-sm text-slate-400">
                                            Không có source
                                        </div>
                                    ) : (
                                        <div className="space-y-2 p-2">
                                            {filteredSources.map(
                                                (source) => {
                                                    const sourceId =
                                                        Number(
                                                            source.id
                                                        );

                                                    const isActive =
                                                        Number(
                                                            popupSourceId
                                                        ) ===
                                                        sourceId;

                                                    const selectedSummary =
                                                        selectedSourceSummaries.find(
                                                            (item) =>
                                                                item.sourceId ===
                                                                sourceId
                                                        );

                                                    return (
                                                        <button
                                                            key={
                                                                source.id
                                                            }
                                                            ref={(element) => {
                                                                if (element) {
                                                                    sourceButtonRefs
                                                                        .current
                                                                        .set(
                                                                            sourceId,
                                                                            element
                                                                        );
                                                                } else {
                                                                    sourceButtonRefs
                                                                        .current
                                                                        .delete(
                                                                            sourceId
                                                                        );
                                                                }
                                                            }}
                                                            type="button"
                                                            onClick={() => {
                                                                void onSelectSource(
                                                                    sourceId
                                                                );
                                                            }}
                                                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${isActive
                                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                                    : selectedSummary
                                                                        ? 'border-blue-200 bg-blue-50 text-slate-700 hover:bg-blue-100'
                                                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="min-w-0">
                                                                    <div className="truncate font-semibold">
                                                                        {source.sourceName}
                                                                    </div>

                                                                    {source.note && (
                                                                        <div
                                                                            className={`mt-1 truncate text-xs ${isActive
                                                                                    ? 'text-blue-100'
                                                                                    : 'text-slate-400'
                                                                                }`}
                                                                        >
                                                                            {source.note}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {selectedSummary && (
                                                                    <span
                                                                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${isActive
                                                                                ? 'bg-white/20 text-white'
                                                                                : 'bg-blue-100 text-blue-700'
                                                                            }`}
                                                                    >
                                                                        {selectedSummary.count}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex h-full min-h-0 flex-col">
                            <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm font-bold text-slate-700">
                                        {popupSourceId
                                            ? 'Thao tác của source đang chọn'
                                            : 'Danh sách thao tác'}
                                    </div>

                                    <div className="mt-1 text-xs text-slate-400">
                                        Tick chọn thao tác, hệ thống sẽ tự đánh số bước theo thứ tự chọn.
                                    </div>
                                </div>

                                <div className="w-44">
                                    <label className="mb-1 block text-xs font-bold text-slate-600">
                                        Đã chọn
                                    </label>

                                    <input
                                        value={
                                            selectedDraftCount
                                        }
                                        readOnly
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold"
                                    />
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200">
                                <table className="min-w-full text-sm">
                                    <thead className="sticky top-0 z-10 bg-slate-50 uppercase text-slate-600">
                                        <tr>
                                            <th className="w-[80px] px-4 py-3 text-center">
                                                Chọn
                                            </th>

                                            <th className="w-[80px] px-4 py-3 text-left">
                                                STT
                                            </th>

                                            <th className="px-4 py-3 text-left">
                                                Thao tác
                                            </th>

                                            <th className="w-[120px] px-4 py-3 text-left">
                                                Code
                                            </th>

                                            <th className="w-[120px] px-4 py-3 text-left">
                                                Bước
                                            </th>

                                            <th className="w-[120px] px-4 py-3 text-left">
                                                Tần suất
                                            </th>

                                            <th className="w-[100px] px-4 py-3 text-right">
                                                TMU
                                            </th>

                                            <th className="px-4 py-3 text-left">
                                                Ghi chú
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {loadingSourceActions && (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-4 py-6 text-center text-slate-400"
                                                >
                                                    Đang tải thao tác...
                                                </td>
                                            </tr>
                                        )}

                                        {!loadingSourceActions &&
                                            !popupSourceId && (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-4 py-6 text-center text-slate-400"
                                                    >
                                                        Vui lòng chọn source ở cột bên trái.
                                                    </td>
                                                </tr>
                                            )}

                                        {!loadingSourceActions &&
                                            popupSourceId &&
                                            popupRows.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-4 py-6 text-center text-slate-400"
                                                    >
                                                        Source này chưa có thao tác được khai báo.
                                                    </td>
                                                </tr>
                                            )}

                                        {!loadingSourceActions &&
                                            popupRows.map(
                                                (
                                                    row,
                                                    index
                                                ) => {
                                                    const isChecked =
                                                        row.stepNo !== null &&
                                                        row.stepNo !== undefined &&
                                                        String(
                                                            row.stepNo
                                                        ).trim() !== '' &&
                                                        row.isSelected;

                                                    return (
                                                        <tr
                                                            key={`${popupSourceId}-${row.sourceActionDetailId}-${index}`}
                                                            className={
                                                                isChecked
                                                                    ? 'bg-blue-50/50'
                                                                    : 'hover:bg-slate-50'
                                                            }
                                                        >
                                                            <td className="px-4 py-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        isChecked
                                                                    }
                                                                    onChange={(event) => {
                                                                        if (!popupSourceId) {
                                                                            return;
                                                                        }

                                                                        onToggleRowSelection(
                                                                            popupSourceId,
                                                                            index,
                                                                            event.target.checked
                                                                        );
                                                                    }}
                                                                    title="Tick để tự đánh số bước"
                                                                />
                                                            </td>

                                                            <td className="px-4 py-3 text-slate-500">
                                                                {index + 1}
                                                            </td>

                                                            <td className="px-4 py-3 text-slate-700">
                                                                {row.actionName}
                                                            </td>

                                                            <td className="px-4 py-3 text-slate-700">
                                                                {row.gsdCode}
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        row.stepNo ?? ''
                                                                    }
                                                                    readOnly
                                                                    className="w-24 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center text-sm font-bold text-blue-700"
                                                                    placeholder="-"
                                                                />
                                                            </td>

                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    value={
                                                                        row.frequency ?? 1
                                                                    }
                                                                    onChange={(event) => {
                                                                        if (!popupSourceId) {
                                                                            return;
                                                                        }

                                                                        onFrequencyChange(
                                                                            popupSourceId,
                                                                            index,
                                                                            event.target.value
                                                                        );
                                                                    }}
                                                                    className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
                                                                />
                                                            </td>

                                                            <td className="px-4 py-3 text-right font-bold text-slate-800">
                                                                {row.tmu}
                                                            </td>

                                                            <td className="px-4 py-3 text-slate-500">
                                                                {row.note}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 flex shrink-0 justify-end gap-3 border-t border-slate-100 pt-4">
                                <button
                                    type="button"
                                    onClick={
                                        onClose
                                    }
                                    className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        onTakeData
                                    }
                                    className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800"
                                >
                                    Lấy dữ liệu ({selectedDraftCount})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}