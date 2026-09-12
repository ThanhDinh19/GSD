import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { GsdAnalysisSummary } from '../types/gsdAnalysis.types';
import { getGsdAnalysisImageUrl } from '../services/gsdAnalysis.service';
import { useGsdAnalysis } from '../hooks/useGsdAnalysis';
import {
    usePermissions,
} from '../../../../src/features/auth/hooks/usePermissions';
import {
    SCREEN,
} from '../../../../src/features/auth/constants/permission.constants';

import {
    Button
} from '../../../shared/components';
import {
    Plus,
    Trash2,
    Save,
    Download,
    RefreshCw,
    Search,
    Pencil,
    Edit,
    Copy,
    Import,
    FileDown,
    RefreshCcw
} from 'lucide-react';

interface GsdProcessTableProps {
    analyses: GsdAnalysisSummary[];
    loading?: boolean;

    selectedId?: number | null;
    onRowClick?: (analysisId: number) => void;
    onDetailClick?: (analysisId: number) => void;

    onCreate?: () => void;
    onEdit?: () => void;
    onCopy?: () => void;
    onRefresh?: () => void;

    showActionButtons?: boolean;
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
    values: string[]
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




export default function GsdProcessTable({
    analyses,
    loading = false,

    selectedId = null,
    onRowClick,
    onDetailClick,

    onCreate,
    onEdit,
    onCopy,
    onRefresh,

    showActionButtons = true,
}: GsdProcessTableProps) {

    const {
        deactivatingId,
        deactivateGsdAnalysis,
    } = useGsdAnalysis();

    const permissions = usePermissions(SCREEN.GSD_ANALYSIS);
    const columnCount = onDetailClick ? 8 : 7;
    const [previewImageUrl, setPreviewImageUrl] = useState('');

    const [
        selectedOperationValues,
        setSelectedOperationValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedImageValues,
        setSelectedImageValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedSkillGradeValues,
        setSelectedSkillGradeValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedMachineValues,
        setSelectedMachineValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedCodeMmtbValues,
        setSelectedCodeMmtbValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedFinalSmvValues,
        setSelectedFinalSmvValues,
    ] = useState<SelectedFilterValues>(null);

    const [
        selectedCreatedAtValues,
        setSelectedCreatedAtValues,
    ] = useState<SelectedFilterValues>(null);

    const operationOptions =
        useMemo(
            () =>
                uniqueOptions(
                    analyses.map(
                        (item) => item.operationName
                    )
                ),
            [analyses]
        );

    const imageOptions =
        useMemo(
            () =>
                uniqueOptions(
                    analyses.map((item) => {
                        const imageFileName =
                            item.imageFileName ||
                            item.imageUrl ||
                            '';

                        return imageFileName
                            ? 'Có hình'
                            : 'Không hình';
                    })
                ),
            [analyses]
        );

    const skillGradeOptions =
        useMemo(
            () =>
                uniqueOptions(
                    analyses.map(
                        (item) => String(item.skillGrade ?? '-')
                    )
                ),
            [analyses]
        );

    const machineOptions =
        useMemo(
            () =>
                uniqueOptions(
                    analyses.map(
                        (item) => item.machineName || '-'
                    )
                ),
            [analyses]
        );

    const codeMmtbOptions =
        useMemo(
            () =>
                uniqueOptions(
                    analyses.map(
                        (item) => item.codeMMTB || '-'
                    )
                ),
            [analyses]
        );

    const finalSmvOptions =
        useMemo(
            () =>
                uniqueOptions(
                    analyses.map(
                        (item) =>
                            Number(
                                item.finalSmv || 0
                            ).toFixed(0)
                    )
                ),
            [analyses]
        );

    const createdAtOptions =
        useMemo(
            () =>
                uniqueOptions(
                    analyses.map((item) =>
                        formatDateTime(
                            item.createdAt ||
                            item.analysisDate
                        )
                    )
                ),
            [analyses]
        );

    const filteredAnalyses =
        useMemo(
            () => {
                return analyses.filter((item) => {
                    const imageFileName =
                        item.imageFileName ||
                        item.imageUrl ||
                        '';

                    const imageStatus =
                        imageFileName
                            ? 'Có hình'
                            : 'Không hình';

                    const finalSmvText =
                        Number(
                            item.finalSmv || 0
                        ).toFixed(0);

                    const createdAtText =
                        formatDateTime(
                            item.createdAt ||
                            item.analysisDate
                        );

                    return (
                        isFilterMatch(
                            item.operationName,
                            selectedOperationValues
                        ) &&
                        isFilterMatch(
                            imageStatus,
                            selectedImageValues
                        ) &&
                        isFilterMatch(
                            item.skillGrade ?? '-',
                            selectedSkillGradeValues
                        ) &&
                        isFilterMatch(
                            item.machineName || '-',
                            selectedMachineValues
                        ) &&
                        isFilterMatch(
                            item.codeMMTB || '-',
                            selectedCodeMmtbValues
                        ) &&
                        isFilterMatch(
                            finalSmvText,
                            selectedFinalSmvValues
                        ) &&
                        isFilterMatch(
                            createdAtText,
                            selectedCreatedAtValues
                        )
                    );
                });
            },
            [
                analyses,
                selectedOperationValues,
                selectedImageValues,
                selectedSkillGradeValues,
                selectedMachineValues,
                selectedCodeMmtbValues,
                selectedFinalSmvValues,
                selectedCreatedAtValues,
            ]
        );



    const handleMoveToTrash =
        async (id: number) => {
            const confirmed = window.confirm(
                'Bạn có chắc muốn chuyển chứng từ này vào thùng rác?'
            );

            if (!confirmed) {
                return;
            }

            try {
                const response =
                    await deactivateGsdAnalysis(id);

                alert(response.message);
                await onRefresh?.();
            } catch (error) {
                alert(
                    error instanceof Error
                        ? error.message
                        : 'Không thể chuyển vào thùng rác'
                );
            }
        };

    return (
        <div className="bg-white border-slate-200 p-5 pt-2">
            <div className="flex items-center justify-between gap-4 mb-5">
                {/* <div>
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                        Quy trình công đoạn
                    </h2>
                </div> */}

                {showActionButtons && (
                    <div className="flex items-center gap-2">
                        {permissions.canCreate && onCreate && (
                            <Button
                                variant='primary'
                                onClick={onCreate}
                                size='sm'
                                leftIcon={<Plus className='w-4 h-4' />}
                            >
                                New
                            </Button>
                        )}

                        {permissions.canUpdate && onEdit && (
                            <Button
                                variant='warning'
                                onClick={onEdit}
                                disabled={!selectedId}
                                size='sm'
                                leftIcon={<Edit className='w-4 h-4' />}
                            >
                                Edit
                            </Button>
                        )}

                        {permissions.canCreate && onCopy && (
                            <Button
                                type="button"
                                onClick={onCopy}
                                disabled={!selectedId}
                                size='sm'
                                leftIcon={<Copy className='w-4 h-4' />}
                            >
                                Copy
                            </Button>
                        )}


                        {permissions.canDelete && (
                            <Button
                                variant='danger'
                                disabled={!selectedId}
                                size='sm'
                                leftIcon={<Trash2 className='w-4 h-4' />}
                                onClick={() =>
                                    void handleMoveToTrash(Number(selectedId))
                                }
                            >
                                Trash
                            </Button>
                        )}

                        {onRefresh && (
                            <Button
                                onClick={onRefresh}
                                disabled={loading}
                                size='sm'
                                leftIcon={<RefreshCcw className='w-4 h-4' />}
                            >
                                {loading ? 'Loading...' : 'Refresh'}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="h-[534px] overflow-auto border border-slate-200 rounded-lg">
                <table className="min-w-[1100px] w-full text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-1.5 border border-slate-200 text-left">
                                STT
                            </th>

                            {onDetailClick && (
                                <th className="relative px-4 py-1.5 border border-slate-200 text-left">
                                    <DropdownColumnFilter
                                        title="Bước công việc"
                                        options={operationOptions}
                                        selectedValues={selectedOperationValues}
                                        onChange={setSelectedOperationValues}
                                    />
                                </th>
                            )}

                            <th className="relative px-4 py-1.5 border border-slate-200 text-center">
                                <DropdownColumnFilter
                                    title="Hình ảnh"
                                    options={imageOptions}
                                    selectedValues={selectedImageValues}
                                    onChange={setSelectedImageValues}
                                    align="center"
                                />
                            </th>

                            <th className="relative px-4 py-1.5 border border-slate-200 text-right">
                                <DropdownColumnFilter
                                    title="Bậc thợ"
                                    options={skillGradeOptions}
                                    selectedValues={selectedSkillGradeValues}
                                    onChange={setSelectedSkillGradeValues}
                                    align="right"
                                />
                            </th>

                            <th className="relative px-4 py-1.5 border border-slate-200 text-left">
                                <DropdownColumnFilter
                                    title="Nhu cầu CC+DC, MMTB"
                                    options={machineOptions}
                                    selectedValues={selectedMachineValues}
                                    onChange={setSelectedMachineValues}
                                />
                            </th>

                            <th className="relative px-4 py-1.5 border border-slate-200 text-left">
                                <DropdownColumnFilter
                                    title="MMTB Code"
                                    options={codeMmtbOptions}
                                    selectedValues={selectedCodeMmtbValues}
                                    onChange={setSelectedCodeMmtbValues}
                                />
                            </th>

                            <th className="relative px-4 py-1.5 border border-slate-200 text-right">
                                <DropdownColumnFilter
                                    title="Thời gian chuẩn"
                                    options={finalSmvOptions}
                                    selectedValues={selectedFinalSmvValues}
                                    onChange={setSelectedFinalSmvValues}
                                    align="right"
                                />
                            </th>

                            <th className="relative px-4 py-1.5 border border-slate-200 text-left whitespace-nowrap">
                                <DropdownColumnFilter
                                    title="Ngày tạo"
                                    options={createdAtOptions}
                                    selectedValues={selectedCreatedAtValues}
                                    onChange={setSelectedCreatedAtValues}
                                />
                            </th>
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

                        {!loading && filteredAnalyses.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columnCount}
                                    className="px-4 py-6 border border-slate-200 text-center text-slate-400"
                                >
                                    Không có công đoạn nào phù hợp với bộ lọc.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            filteredAnalyses.map((item, index) => {
                                // const isSelected =
                                //     selectedId === item.id;

                                let isSelected;
                                if (selectedId === item.id) {
                                    isSelected = true;
                                }
                                else {
                                    isSelected = false;
                                }

                                const imageFileName = item.imageFileName || item.imageUrl || '';
                                const imageSrc = getGsdAnalysisImageUrl(imageFileName);

                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() =>
                                            onRowClick?.(item.id)
                                        }
                                        className={`
                                            cursor-pointer
                                            transition-colors
                                            ${isSelected
                                                ? 'bg-blue-100'
                                                : 'bg-white hover:bg-blue-50'
                                            }
                                        `}
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

                                        <td className="border border-slate-200 px-3 py-2 text-center">
                                            {imageSrc ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImageUrl(imageSrc);
                                                    }}
                                                    className="inline-flex items-center justify-center w-12 h-12 border border-slate-200 rounded-sm bg-slate-50 overflow-hidden hover:ring-2 hover:ring-blue-400"
                                                    title="Xem hình"
                                                >
                                                    <img
                                                        src={imageSrc}
                                                        alt="Hình mã hàng"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>

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


            {previewImageUrl && (
                <ImagePreviewModal
                    imageUrl={previewImageUrl}
                    onClose={() => setPreviewImageUrl('')}
                />
            )}
        </div>
    );
}

function ImagePreviewModal({
    imageUrl,
    onClose,
}: {
    imageUrl: string;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-6"
            onClick={onClose} // bấm ngoài ảnh, đóng pop up
        >
            <img
                src={imageUrl}
                alt="Hình mã hàng"
                className="w-[30vw] h-[50vh] object-contain bg-white"
                onClick={(e) => e.stopPropagation()} // bấm vào ảnh ko đóng pop up
            />
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

            setDraftSelectedValues(new Set());
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

                    if (next.size === options.length) {
                        return null;
                    }

                    return next;
                }
            );
        };

    const handleApply =
        () => {
            onChange(draftSelectedValues);
            setOpen(false);
        };

    const handleClear =
        () => {
            setDraftSelectedValues(null);
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
                className={`inline-flex w-full items-center gap-1 text-[11px] font-bold uppercase text-slate-500 hover:text-slate-800 ${align === 'right'
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
                    className={`absolute top-full z-[80] mt-1 w-[320px] rounded border border-slate-200 bg-white text-left normal-case shadow-xl ${align === 'right'
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