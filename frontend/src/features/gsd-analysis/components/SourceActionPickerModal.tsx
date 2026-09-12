import {
    useEffect,
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

type SourceActionMap =
    Record<number, GsdAnalysisRow[]>;

interface SourceActionPickerModalProps {
    sources: SourceMaster[];
    popupSourceId: number | null;
    popupRows: GsdAnalysisRow[];
    selectedDraftRows: GsdAnalysisRow[];
    loadingSourceActions: boolean;
    selectedDraftCount: number;
    sourceActionMap: SourceActionMap;
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

type SourceActionViewGroup = {
    sourceId: number;
    sourceName: string;
    note?: string | null;
    rows: GsdAnalysisRow[];
    selectedCount: number;
    totalTmu: number;
};

function isSelectedActionRow(
    row: GsdAnalysisRow
): boolean {
    return (
        row.isSelected === true ||
        (
            row.stepNo !== null &&
            row.stepNo !== undefined &&
            String(row.stepNo).trim() !== ''
        )
    );
}

function getSourceLabel(
    source: SourceMaster | undefined,
    sourceId: number
): string {
    return (
        source?.sourceName ||
        `Source ${sourceId}`
    );
}

type SelectedFilterValues =
    Set<string> | null;

function toFilterValue(
    value: unknown
) {
    const text =
        String(value ?? '').trim();

    return text || '-';
}

function uniqueOptions(
    values: unknown[]
) {
    return Array.from(
        new Set(
            values.map(toFilterValue)
        )
    ).sort((a, b) =>
        a.localeCompare(b, 'vi')
    );
}

function isFilterMatch(
    value: unknown,
    selectedValues: SelectedFilterValues
) {
    if (selectedValues === null) {
        return true;
    }

    return selectedValues.has(
        toFilterValue(value)
    );
}

function getRowCheckedText(
    row: GsdAnalysisRow
) {
    return isSelectedActionRow(row)
        ? 'Đã chọn'
        : 'Chưa chọn';
}

export default function SourceActionPickerModal({
    sources,
    popupSourceId,
    popupRows,
    selectedDraftRows,
    loadingSourceActions,
    selectedDraftCount,
    sourceActionMap,
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

    const [
        selectedCheckedValues,
        setSelectedCheckedValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedActionNameValues,
        setSelectedActionNameValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedCodeValues,
        setSelectedCodeValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedStepValues,
        setSelectedStepValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedFrequencyValues,
        setSelectedFrequencyValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedTmuValues,
        setSelectedTmuValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedNoteValues,
        setSelectedNoteValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        viewAllOpen,
        setViewAllOpen,
    ] = useState(false);

    const [
        loadingViewAll,
        setLoadingViewAll,
    ] = useState(false);

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

    const checkedOptions =
        useMemo(
            () =>
                uniqueOptions(
                    popupRows.map(
                        getRowCheckedText
                    )
                ),
            [popupRows]
        );

    const actionNameOptions =
        useMemo(
            () =>
                uniqueOptions(
                    popupRows.map(
                        (row) =>
                            row.actionName || '-'
                    )
                ),
            [popupRows]
        );

    const codeOptions =
        useMemo(
            () =>
                uniqueOptions(
                    popupRows.map(
                        (row) =>
                            row.gsdCode || '-'
                    )
                ),
            [popupRows]
        );

    const stepOptions =
        useMemo(
            () =>
                uniqueOptions(
                    popupRows.map(
                        (row) =>
                            row.stepNo ?? '-'
                    )
                ),
            [popupRows]
        );

    const frequencyOptions =
        useMemo(
            () =>
                uniqueOptions(
                    popupRows.map(
                        (row) =>
                            row.frequency ?? 1
                    )
                ),
            [popupRows]
        );

    const tmuOptions =
        useMemo(
            () =>
                uniqueOptions(
                    popupRows.map(
                        (row) =>
                            row.tmu ?? 0
                    )
                ),
            [popupRows]
        );

    const noteOptions =
        useMemo(
            () =>
                uniqueOptions(
                    popupRows.map(
                        (row) =>
                            row.note || '-'
                    )
                ),
            [popupRows]
        );

    const filteredPopupRows =
        useMemo(
            () => {
                return popupRows
                    .map(
                        (row, rowIndex) => ({
                            row,
                            rowIndex,
                        })
                    )
                    .filter(({ row }) => {
                        return (
                            isFilterMatch(
                                getRowCheckedText(row),
                                selectedCheckedValues
                            ) &&
                            isFilterMatch(
                                row.actionName || '-',
                                selectedActionNameValues
                            ) &&
                            isFilterMatch(
                                row.gsdCode || '-',
                                selectedCodeValues
                            ) &&
                            isFilterMatch(
                                row.stepNo ?? '-',
                                selectedStepValues
                            ) &&
                            isFilterMatch(
                                row.frequency ?? 1,
                                selectedFrequencyValues
                            ) &&
                            isFilterMatch(
                                row.tmu ?? 0,
                                selectedTmuValues
                            ) &&
                            isFilterMatch(
                                row.note || '-',
                                selectedNoteValues
                            )
                        );
                    });
            },
            [
                popupRows,
                selectedCheckedValues,
                selectedActionNameValues,
                selectedCodeValues,
                selectedStepValues,
                selectedFrequencyValues,
                selectedTmuValues,
                selectedNoteValues,
            ]
        );

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

    const viewAllGroups =
        useMemo<SourceActionViewGroup[]>(
            () => {
                const map =
                    new Map<
                        number,
                        SourceActionViewGroup
                    >();

                for (
                    const row
                    of selectedDraftRows
                ) {
                    if (
                        !isSelectedActionRow(
                            row
                        )
                    ) {
                        continue;
                    }

                    const sourceId =
                        Number(
                            row.sourceId ?? 0
                        );

                    if (
                        !Number.isFinite(sourceId) ||
                        sourceId <= 0
                    ) {
                        continue;
                    }

                    const source =
                        sources.find(
                            (item) =>
                                Number(item.id) ===
                                sourceId
                        );

                    if (
                        !map.has(sourceId)
                    ) {
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

                                rows: [],

                                selectedCount: 0,

                                totalTmu: 0,
                            }
                        );
                    }

                    const group =
                        map.get(sourceId)!;

                    group.rows.push(row);

                    group.selectedCount += 1;

                    group.totalTmu +=
                        Number(row.tmu || 0) *
                        Number(row.frequency || 1);
                }

                return Array.from(
                    map.values()
                )
                    .map(
                        (group) => ({
                            ...group,

                            rows:
                                [...group.rows].sort(
                                    (
                                        first,
                                        second
                                    ) =>
                                        Number(
                                            first.stepNo ?? 0
                                        ) -
                                        Number(
                                            second.stepNo ?? 0
                                        )
                                ),

                            totalTmu:
                                Number(
                                    group.totalTmu.toFixed(2)
                                ),
                        })
                    )
                    .sort(
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

    const totalViewAllActions =
        viewAllGroups.reduce(
            (
                sum,
                group
            ) =>
                sum + group.rows.length,
            0
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

    const handleViewAll =
        () => {
            if (
                viewAllGroups.length === 0
            ) {
                alert(
                    'Chưa có thao tác nào được chọn.'
                );

                return;
            }

            setViewAllOpen(
                true
            );
        };

    useEffect(
        () => {
            setSelectedCheckedValues(null);
            setSelectedActionNameValues(null);
            setSelectedCodeValues(null);
            setSelectedStepValues(null);
            setSelectedFrequencyValues(null);
            setSelectedTmuValues(null);
            setSelectedNoteValues(null);
        },
        [popupSourceId]
    );


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

                                <div className="flex shrink-0 items-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleViewAll}
                                        disabled={
                                            selectedDraftCount === 0
                                        }
                                        className="h-11 rounded border border-red-300 bg-white px-5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        View all
                                    </button>

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
                            </div>

                            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200">
                                <table className="min-w-full text-sm">
                                    <thead className="sticky top-0 z-10 bg-slate-50 uppercase text-slate-600">
                                        <tr>
                                            <th className="relative w-[80px] px-4 py-3 text-center">
                                                <DropdownColumnFilter
                                                    title="Chọn"
                                                    options={checkedOptions}
                                                    selectedValues={selectedCheckedValues}
                                                    onChange={setSelectedCheckedValues}
                                                    align="center"
                                                />
                                            </th>

                                            <th className="w-[80px] px-4 py-3 text-left">
                                                STT
                                            </th>

                                            <th className="relative px-4 py-3 text-left">
                                                <DropdownColumnFilter
                                                    title="Thao tác"
                                                    options={actionNameOptions}
                                                    selectedValues={selectedActionNameValues}
                                                    onChange={setSelectedActionNameValues}
                                                />
                                            </th>

                                            <th className="relative w-[120px] px-4 py-3 text-left">
                                                <DropdownColumnFilter
                                                    title="Code"
                                                    options={codeOptions}
                                                    selectedValues={selectedCodeValues}
                                                    onChange={setSelectedCodeValues}
                                                />
                                            </th>

                                            <th className="relative w-[120px] px-4 py-3 text-left">
                                                <DropdownColumnFilter
                                                    title="Bước"
                                                    options={stepOptions}
                                                    selectedValues={selectedStepValues}
                                                    onChange={setSelectedStepValues}
                                                />
                                            </th>

                                            <th className="relative w-[120px] px-4 py-3 text-left">
                                                <DropdownColumnFilter
                                                    title="Tần suất"
                                                    options={frequencyOptions}
                                                    selectedValues={selectedFrequencyValues}
                                                    onChange={setSelectedFrequencyValues}
                                                />
                                            </th>

                                            <th className="relative w-[100px] px-4 py-3 text-right">
                                                <DropdownColumnFilter
                                                    title="TMU"
                                                    options={tmuOptions}
                                                    selectedValues={selectedTmuValues}
                                                    onChange={setSelectedTmuValues}
                                                    align="right"
                                                />
                                            </th>

                                            <th className="relative px-4 py-3 text-left">
                                                <DropdownColumnFilter
                                                    title="Ghi chú"
                                                    options={noteOptions}
                                                    selectedValues={selectedNoteValues}
                                                    onChange={setSelectedNoteValues}
                                                />
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
                                            popupSourceId &&
                                            popupRows.length > 0 &&
                                            filteredPopupRows.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-4 py-6 text-center text-slate-400"
                                                    >
                                                        Không có thao tác phù hợp với bộ lọc.
                                                    </td>
                                                </tr>
                                            )}

                                        {!loadingSourceActions &&
                                            popupSourceId &&
                                            filteredPopupRows.map(
                                                (
                                                    {
                                                        row,
                                                        rowIndex,
                                                    },
                                                    visibleIndex
                                                ) => {
                                                    const isChecked =
                                                        isSelectedActionRow(row);

                                                    return (
                                                        <tr
                                                            key={`${popupSourceId}-${row.sourceActionDetailId}-${rowIndex}`}
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
                                                                            rowIndex,
                                                                            event.target.checked
                                                                        );
                                                                    }}
                                                                    title="Tick để tự đánh số bước"
                                                                />
                                                            </td>

                                                            <td className="px-4 py-3 text-slate-500">
                                                                {visibleIndex + 1}
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
                                                                            rowIndex,
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
            {viewAllOpen && (
                <SourceActionViewAllModal
                    groups={viewAllGroups}
                    loading={loadingViewAll}
                    totalActionCount={totalViewAllActions}
                    onJumpToSource={(sourceId) => {
                        setViewAllOpen(false);

                        void handleJumpToSource(
                            sourceId
                        );
                    }}
                    onClose={() =>
                        setViewAllOpen(false)
                    }
                />
            )}
        </div>
    );
}


function SourceActionViewAllModal({
    groups,
    loading,
    totalActionCount,
    onJumpToSource,
    onClose,
}: {
    groups: Array<{
        sourceId: number;
        sourceName: string;
        note?: string | null;
        rows: GsdAnalysisRow[];
        selectedCount: number;
        totalTmu: number;
    }>;
    loading: boolean;
    totalActionCount: number;
    onJumpToSource: (
        sourceId: number
    ) => void;
    onClose: () => void;
}) {


    const [
        expandedSourceIds,
        setExpandedSourceIds,
    ] = useState<Set<number>>(
        () => new Set()
    );

    const toggleExpanded =
        (
            sourceId: number
        ) => {
            setExpandedSourceIds(
                (previous) => {
                    const next =
                        new Set(previous);

                    if (
                        next.has(sourceId)
                    ) {
                        next.delete(sourceId);
                    } else {
                        next.add(sourceId);
                    }

                    return next;
                }
            );
        };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4">
            <div className="flex h-[90vh] w-[1450px] max-w-[96vw] flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Source có thao tác đã chọn
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Các source đang có thao tác được chọn.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            Source:{' '}
                            <span className="font-bold text-slate-800">
                                {groups.length}
                            </span>
                            {' · '}
                            Thao tác:{' '}
                            <span className="font-bold text-slate-800">
                                {totalActionCount}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-auto bg-white">
                    {loading && (
                        <div className="p-10 text-center text-sm text-slate-400">
                            Đang tải toàn bộ thao tác của source...
                        </div>
                    )}

                    {!loading &&
                        groups.length === 0 && (
                            <div className="p-10 text-center text-sm text-slate-400">
                                Không có source để hiển thị.
                            </div>
                        )}

                    {!loading &&
                        groups.map(
                            (
                                group,
                                groupIndex
                            ) => {
                                const isExpanded =
                                    expandedSourceIds.has(
                                        group.sourceId
                                    );

                                return (
                                    <div
                                        key={group.sourceId}
                                        className="border-b border-slate-200"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleExpanded(
                                                    group.sourceId
                                                )
                                            }
                                            className="w-full border-b border-blue-100 bg-blue-50 px-5 py-3 text-left hover:bg-blue-100"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded border border-blue-200 bg-white text-sm font-bold text-blue-700">
                                                        {isExpanded
                                                            ? '⌄'
                                                            : '>'}
                                                    </span>

                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-blue-700">
                                                            Source {groupIndex + 1}: {group.sourceName}
                                                        </div>

                                                        <div className="mt-1 text-xs text-slate-500">
                                                            {group.rows.length} thao tác
                                                            {' · '}
                                                            Đã chọn: {group.selectedCount}
                                                            {' · '}
                                                            Tổng TMU: {group.totalTmu.toFixed(2)}
                                                            {group.note
                                                                ? ` · ${group.note}`
                                                                : ''}
                                                        </div>
                                                    </div>
                                                </div>

                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={(event) => {
                                                        event.stopPropagation();

                                                        onJumpToSource(
                                                            group.sourceId
                                                        );
                                                    }}
                                                    onKeyDown={(event) => {
                                                        if (
                                                            event.key === 'Enter' ||
                                                            event.key === ' '
                                                        ) {
                                                            event.preventDefault();
                                                            event.stopPropagation();

                                                            onJumpToSource(
                                                                group.sourceId
                                                            );
                                                        }
                                                    }}
                                                    className="rounded border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50"
                                                >
                                                    Mở source này
                                                </span>
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="overflow-auto">
                                                <table className="w-full min-w-[1200px] border-collapse text-sm">
                                                    <thead className="bg-white">
                                                        <tr className="text-xs uppercase text-slate-500">
                                                            <th className="w-[60px] border border-slate-100 p-3 text-center">
                                                                STT
                                                            </th>

                                                            <th className="w-[80px] border border-slate-100 p-3 text-center">
                                                                Chọn
                                                            </th>

                                                            <th className="w-[90px] border border-slate-100 p-3 text-center">
                                                                Bước
                                                            </th>

                                                            <th className="border border-slate-100 p-3 text-left">
                                                                Thao tác
                                                            </th>

                                                            <th className="w-[120px] border border-slate-100 p-3 text-left">
                                                                Code
                                                            </th>

                                                            <th className="w-[120px] border border-slate-100 p-3 text-right">
                                                                Tần suất
                                                            </th>

                                                            <th className="w-[100px] border border-slate-100 p-3 text-right">
                                                                TMU
                                                            </th>

                                                            <th className="border border-slate-100 p-3 text-left">
                                                                Ghi chú
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {group.rows.length === 0 && (
                                                            <tr>
                                                                <td
                                                                    colSpan={8}
                                                                    className="border border-slate-100 p-8 text-center text-slate-400"
                                                                >
                                                                    Source này chưa có thao tác.
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {group.rows.map(
                                                            (
                                                                row,
                                                                rowIndex
                                                            ) => {
                                                                const checked =
                                                                    row.isSelected === true ||
                                                                    (
                                                                        row.stepNo !== null &&
                                                                        row.stepNo !== undefined &&
                                                                        String(row.stepNo).trim() !== ''
                                                                    );

                                                                return (
                                                                    <tr
                                                                        key={`${group.sourceId}-${row.sourceActionDetailId}-${rowIndex}`}
                                                                        className={
                                                                            checked
                                                                                ? 'bg-blue-50/50'
                                                                                : 'hover:bg-slate-50'
                                                                        }
                                                                    >
                                                                        <td className="border border-slate-100 p-3 text-center text-slate-500">
                                                                            {rowIndex + 1}
                                                                        </td>

                                                                        <td className="border border-slate-100 p-3 text-center">
                                                                            {checked ? (
                                                                                <span className="font-bold text-blue-700">
                                                                                    ✓
                                                                                </span>
                                                                            ) : (
                                                                                '-'
                                                                            )}
                                                                        </td>

                                                                        <td className="border border-slate-100 p-3 text-center font-bold text-blue-700">
                                                                            {row.stepNo || '-'}
                                                                        </td>

                                                                        <td className="border border-slate-100 p-3 text-slate-800">
                                                                            {row.actionName || '-'}
                                                                        </td>

                                                                        <td className="border border-slate-100 p-3 text-slate-700">
                                                                            {row.gsdCode || '-'}
                                                                        </td>

                                                                        <td className="border border-slate-100 p-3 text-right">
                                                                            {row.frequency ?? 1}
                                                                        </td>

                                                                        <td className="border border-slate-100 p-3 text-right font-bold text-slate-800">
                                                                            {row.tmu ?? 0}
                                                                        </td>

                                                                        <td className="border border-slate-100 p-3 text-slate-500">
                                                                            {row.note || ''}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        )}
                </div>

                <div className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-sm border border-slate-300 bg-white px-5 py-2 text-sm hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}


function DropdownColumnFilter({
    title,
    options,
    selectedValues,
    onChange,
    align = 'left',
}: {
    title: string;
    options: string[];
    selectedValues: SelectedFilterValues;
    onChange: (values: SelectedFilterValues) => void;
    align?: 'left' | 'center' | 'right';
}) {
    const [
        open,
        setOpen,
    ] = useState(false);

    const [
        search,
        setSearch,
    ] = useState('');

    const [
        draftSelectedValues,
        setDraftSelectedValues,
    ] = useState<SelectedFilterValues>(null);

    const rootRef =
        useRef<HTMLDivElement | null>(
            null
        );

    useEffect(
        () => {
            if (!open) {
                return;
            }

            setDraftSelectedValues(
                selectedValues === null
                    ? null
                    : new Set(selectedValues)
            );
        },
        [
            open,
            selectedValues,
        ]
    );

    const filteredOptions =
        useMemo(
            () => {
                const keyword =
                    search
                        .trim()
                        .toLowerCase();

                if (!keyword) {
                    return options;
                }

                return options.filter(
                    (option) =>
                        option
                            .toLowerCase()
                            .includes(keyword)
                );
            },
            [
                options,
                search,
            ]
        );

    const allSelected =
        draftSelectedValues === null ||
        draftSelectedValues.size === options.length;

    const isOptionChecked =
        (option: string) => {
            if (draftSelectedValues === null) {
                return true;
            }

            return draftSelectedValues.has(option);
        };

    const toggleSelectAll =
        (checked: boolean) => {
            if (checked) {
                setDraftSelectedValues(null);
                return;
            }

            setDraftSelectedValues(
                new Set()
            );
        };

    const toggleOption =
        (
            option: string,
            checked: boolean
        ) => {
            setDraftSelectedValues(
                (current) => {
                    const next =
                        current === null
                            ? new Set(options)
                            : new Set(current);

                    if (checked) {
                        next.add(option);
                    } else {
                        next.delete(option);
                    }

                    if (
                        next.size ===
                        options.length
                    ) {
                        return null;
                    }

                    return next;
                }
            );
        };

    const handleApply =
        () => {
            onChange(
                draftSelectedValues
            );

            setOpen(false);
        };

    const handleClear =
        () => {
            setDraftSelectedValues(
                null
            );

            setSearch('');

            onChange(null);

            setOpen(false);
        };

    const selectedCount =
        selectedValues === null
            ? options.length
            : selectedValues.size;

    useEffect(
        () => {
            if (!open) {
                return;
            }

            const handleMouseDown =
                (event: MouseEvent) => {
                    if (
                        rootRef.current &&
                        !rootRef.current.contains(
                            event.target as Node
                        )
                    ) {
                        setOpen(false);
                    }
                };

            document.addEventListener(
                'mousedown',
                handleMouseDown
            );

            return () => {
                document.removeEventListener(
                    'mousedown',
                    handleMouseDown
                );
            };
        },
        [open]
    );

    return (
        <div
            ref={rootRef}
            className={`relative ${align === 'center'
                ? 'text-center'
                : align === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
        >
            <button
                type="button"
                onClick={() =>
                    setOpen(
                        (previous) => !previous
                    )
                }
                className={`inline-flex w-full items-center gap-1 text-xs font-bold uppercase text-slate-600 hover:text-slate-900 ${align === 'right'
                    ? 'justify-end'
                    : align === 'center'
                        ? 'justify-center'
                        : 'justify-start'
                    }`}
            >
                <span>
                    {title}
                </span>

                <span className="text-[10px]">
                    ▼
                </span>

                {selectedValues !== null && (
                    <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700">
                        {selectedCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className={`absolute top-full z-[120] mt-1 w-[320px] rounded border border-slate-200 bg-white text-left normal-case shadow-xl ${align === 'right'
                        ? 'right-0'
                        : 'left-0'
                        }`}
                >
                    <div className="border-b border-slate-100 p-2">
                        <input
                            autoFocus
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search"
                            className="h-8 w-full rounded border border-blue-400 px-2 text-xs outline-none"
                        />
                    </div>

                    <div className="max-h-64 overflow-auto px-2 py-2">
                        <label className="flex cursor-pointer items-center gap-2 px-1 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(event) =>
                                    toggleSelectAll(
                                        event.target.checked
                                    )
                                }
                            />

                            <span>
                                (Select All)
                            </span>
                        </label>

                        {filteredOptions.map(
                            (option) => (
                                <label
                                    key={option}
                                    className="flex cursor-pointer items-center gap-2 px-1 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isOptionChecked(
                                            option
                                        )}
                                        onChange={(event) =>
                                            toggleOption(
                                                option,
                                                event.target.checked
                                            )
                                        }
                                    />

                                    <span className="break-words">
                                        {option}
                                    </span>
                                </label>
                            )
                        )}

                        {filteredOptions.length === 0 && (
                            <div className="px-2 py-4 text-center text-xs text-slate-400">
                                Không có dữ liệu
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-2 py-2">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                            Clear
                        </button>

                        <button
                            type="button"
                            onClick={handleApply}
                            className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-900"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}