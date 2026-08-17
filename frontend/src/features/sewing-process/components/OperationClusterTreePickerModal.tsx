import {
    useEffect,
    type ReactNode,
} from 'react';

import {
    ChevronRight,
    Folder,
    Layers3,
    RefreshCw,
    Search,
    Tags,
    X,
} from 'lucide-react';

import {
    Button,
} from '../../../shared/components';

import {
    useOperationClusterTreePicker,
} from '../hooks/useOperationClusterTreePicker';

import {
    getDisplayGroupKey,
    getNodeKey,
} from '../utils/operationClusterTreePicker.utils';

import type {
    OperationClusterTreePickerModalProps,
} from '../types/operationClusterTreePicker.types';


type TreeNodeRowProps = {
    depth:
        number;

    open:
        boolean;

    onToggle:
        () => void;

    onSelect?:
        () => void;

    icon:
        ReactNode;

    label:
        string;

    selected?:
        boolean;

    inactive?:
        boolean;

    expandable?:
        boolean;

    strong?:
        boolean;
};


function TreeNodeRow({
    depth,
    open,
    onToggle,
    onSelect,
    icon,
    label,
    selected = false,
    inactive = false,
    expandable = true,
    strong = false,
}: TreeNodeRowProps) {
    return (
        <div
            className={`group flex min-h-8 items-center rounded pr-2 text-xs ${
                selected
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
            }`}
            style={{
                paddingLeft:
                    `${6 + depth * 17}px`,
            }}
        >
            {expandable ? (
                <button
                    type='button'
                    onClick={(event) => {
                        event.stopPropagation();

                        onToggle();
                    }}
                    className='mr-1 flex h-6 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-white hover:text-slate-700'
                >
                    <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${
                            open
                                ? 'rotate-90'
                                : ''
                        }`}
                    />
                </button>
            ) : (
                <span className='mr-1 h-6 w-5 shrink-0' />
            )}


            <button
                type='button'
                onClick={
                    onSelect ??
                    onToggle
                }
                className={`flex min-w-0 flex-1 items-center gap-2 py-1 text-left ${
                    strong
                        ? 'font-semibold text-slate-800'
                        : ''
                }`}
            >
                <span className='shrink-0'>
                    {icon}
                </span>

                <span
                    className={`truncate ${
                        inactive
                            ? 'text-slate-400 line-through'
                            : ''
                    }`}
                    title={label}
                >
                    {label}
                </span>
            </button>
        </div>
    );
}


function formatNumber(
    value:
        number |
        null |
        undefined
) {
    const number =
        Number(
            value ?? 0
        );

    return Number.isFinite(
        number
    )
        ? number.toFixed(2)
        : '0.00';
}


export function OperationClusterTreePickerModal({
    open,
    onClose,
    onConfirm,
}: OperationClusterTreePickerModalProps) {
    const picker =
        useOperationClusterTreePicker();


    const {
        displayTree,

        loading,
        error,
        warning,

        keyword,
        showInactive,

        expanded,

        selectedClusterKey,
        selectedContext,
        cluster,

        selectedKeys,
        selectedCount,

        currentClusterOperations,
        allCurrentClusterChecked,

        setKeyword,
        setShowInactive,

        loadTree,
        open:
            openPicker,
        reset,

        toggleNode,
        selectCluster,

        toggleOperation,
        toggleCurrentCluster,

        clearSelection,

        buildSelectedLines,
    } = picker;


    const normalizedKeyword =
        keyword
            .trim()
            .toLowerCase();

    const forcedOpen =
        normalizedKeyword.length >
        0;


    useEffect(
        () => {
            if (!open) {
                return;
            }

            void openPicker();
        },
        [
            open,
        ]
    );


    if (!open) {
        return null;
    }


    const handleClose =
        () => {
            reset();

            onClose();
        };


    const handleConfirm =
        () => {
            const lines =
                buildSelectedLines();

            if (
                lines.length ===
                0
            ) {
                alert(
                    'Vui lòng chọn ít nhất một công đoạn.'
                );

                return;
            }


            onConfirm(
                lines
            );

            reset();

            onClose();
        };


    const rootKey =
        getNodeKey(
            'root',
            0
        );

    const rootOpen =
        forcedOpen ||
        expanded.has(
            rootKey
        );


    return (
        <div className='fixed inset-0 z-[70] flex items-center justify-center bg-black/35 p-4'>
            <div className='flex h-[86vh] w-[94vw] max-w-[1600px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-white shadow-2xl'>
                {/* TITLE BAR */}
                <div className='flex h-11 shrink-0 items-center justify-between border-b border-slate-300 bg-slate-100 pl-4'>
                    <div>
                        <div className='text-sm font-semibold text-slate-800'>
                            Chọn công đoạn từ cây cụm
                        </div>

                        <div className='text-[10px] text-slate-500'>
                            Chọn cụm bên trái và tích các công đoạn cần lấy
                        </div>
                    </div>


                    <button
                        type='button'
                        onClick={
                            handleClose
                        }
                        className='flex h-full w-12 items-center justify-center text-slate-500 hover:bg-red-500 hover:text-white'
                        title='Đóng'
                    >
                        <X className='h-4 w-4' />
                    </button>
                </div>


                {/* BODY */}
                <div className='grid min-h-0 flex-1 grid-cols-[340px_minmax(0,1fr)] overflow-hidden'>
                    {/* LEFT TREE */}
                    <aside className='flex min-h-0 flex-col border-r border-slate-300 bg-white'>
                        <div className='shrink-0 border-b border-slate-200 p-3'>
                            <div className='flex items-center justify-between gap-2'>
                                <div className='text-xs font-semibold text-slate-700'>
                                    Cây cấu trúc
                                </div>

                                <button
                                    type='button'
                                    onClick={() => {
                                        void loadTree();
                                    }}
                                    disabled={
                                        loading
                                    }
                                    className='inline-flex h-7 items-center gap-1 rounded border border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
                                >
                                    <RefreshCw
                                        className={`h-3.5 w-3.5 ${
                                            loading
                                                ? 'animate-spin'
                                                : ''
                                        }`}
                                    />

                                    Làm mới
                                </button>
                            </div>


                            <div className='relative mt-2'>
                                <input
                                    type='text'
                                    value={
                                        keyword
                                    }
                                    onChange={(event) =>
                                        setKeyword(
                                            event.target.value
                                        )
                                    }
                                    placeholder='Tìm chủng loại, nhóm, cụm...'
                                    className='h-8 w-full rounded border border-slate-300 bg-white pl-3 pr-8 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                />

                                <Search className='pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400' />
                            </div>


                            <label className='mt-2 flex cursor-pointer items-center gap-2 text-[11px] text-slate-600'>
                                <input
                                    type='checkbox'
                                    checked={
                                        showInactive
                                    }
                                    onChange={(event) =>
                                        setShowInactive(
                                            event.target.checked
                                        )
                                    }
                                    className='h-3.5 w-3.5 cursor-pointer'
                                />

                                Hiển thị cụm ngừng áp dụng
                            </label>


                            {warning && (
                                <div className='mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700'>
                                    {warning}
                                </div>
                            )}
                        </div>


                        <div className='min-h-0 flex-1 overflow-auto p-2'>
                            {loading ? (
                                <div className='px-3 py-10 text-center text-xs text-slate-500'>
                                    Đang tải dữ liệu...
                                </div>
                            ) : error ? (
                                <div className='px-3 py-10 text-center'>
                                    <div className='text-xs text-red-600'>
                                        {error}
                                    </div>

                                    <button
                                        type='button'
                                        onClick={() => {
                                            void loadTree();
                                        }}
                                        className='mt-3 h-7 rounded border border-slate-300 bg-white px-3 text-xs text-slate-700 hover:bg-slate-50'
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <TreeNodeRow
                                        depth={
                                            0
                                        }
                                        open={
                                            rootOpen
                                        }
                                        onToggle={() =>
                                            toggleNode(
                                                rootKey
                                            )
                                        }
                                        icon={
                                            <Tags className='h-3.5 w-3.5 text-slate-500' />
                                        }
                                        label='Chủng loại'
                                        strong
                                    />


                                    {rootOpen &&
                                        displayTree.map(
                                            (
                                                categoryBucket
                                            ) => {
                                                const categoryKey =
                                                    categoryBucket.key;

                                                const categoryOpen =
                                                    forcedOpen ||
                                                    expanded.has(
                                                        categoryKey
                                                    );


                                                return (
                                                    <div
                                                        key={
                                                            categoryKey
                                                        }
                                                    >
                                                        <TreeNodeRow
                                                            depth={
                                                                1
                                                            }
                                                            open={
                                                                categoryOpen
                                                            }
                                                            onToggle={() =>
                                                                toggleNode(
                                                                    categoryKey
                                                                )
                                                            }
                                                            icon={
                                                                <Tags className='h-3.5 w-3.5 text-blue-500' />
                                                            }
                                                            label={
                                                                categoryBucket
                                                                    .category
                                                                    .name
                                                            }
                                                        />


                                                        {categoryOpen &&
                                                            categoryBucket.documents.map(
                                                                (
                                                                    document
                                                                ) => {
                                                                    const groupKey =
                                                                        getDisplayGroupKey(
                                                                            categoryKey,
                                                                            document
                                                                        );

                                                                    const groupOpen =
                                                                        forcedOpen ||
                                                                        expanded.has(
                                                                            groupKey
                                                                        );


                                                                    return (
                                                                        <div
                                                                            key={`${categoryKey}:${document.id}`}
                                                                        >
                                                                            <TreeNodeRow
                                                                                depth={
                                                                                    2
                                                                                }
                                                                                open={
                                                                                    groupOpen
                                                                                }
                                                                                onToggle={() =>
                                                                                    toggleNode(
                                                                                        groupKey
                                                                                    )
                                                                                }
                                                                                icon={
                                                                                    <Folder className='h-3.5 w-3.5 text-amber-500' />
                                                                                }
                                                                                label={
                                                                                    document.group.name
                                                                                }
                                                                            />


                                                                            {groupOpen &&
                                                                                document.clusters.map(
                                                                                    (
                                                                                        treeCluster
                                                                                    ) => {
                                                                                        const selected =
                                                                                            treeCluster.key ===
                                                                                            selectedClusterKey;


                                                                                        return (
                                                                                            <TreeNodeRow
                                                                                                key={
                                                                                                    treeCluster.key
                                                                                                }
                                                                                                depth={
                                                                                                    3
                                                                                                }
                                                                                                open={
                                                                                                    false
                                                                                                }
                                                                                                onToggle={() => {}}
                                                                                                onSelect={() =>
                                                                                                    selectCluster(
                                                                                                        document,
                                                                                                        treeCluster.key
                                                                                                    )
                                                                                                }
                                                                                                icon={
                                                                                                    <Layers3 className='h-3.5 w-3.5 text-violet-500' />
                                                                                                }
                                                                                                label={
                                                                                                    treeCluster.name
                                                                                                }
                                                                                                selected={
                                                                                                    selected
                                                                                                }
                                                                                                inactive={
                                                                                                    treeCluster.inactive
                                                                                                }
                                                                                                expandable={
                                                                                                    false
                                                                                                }
                                                                                            />
                                                                                        );
                                                                                    }
                                                                                )}
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                    </div>
                                                );
                                            }
                                        )}


                                    {displayTree.length ===
                                        0 && (
                                        <div className='px-3 py-10 text-center text-xs text-slate-400'>
                                            Không có dữ liệu phù hợp.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </aside>


                    {/* RIGHT OPERATIONS */}
                    <section className='flex min-h-0 min-w-0 flex-col bg-slate-50'>
                        <div className='shrink-0 border-b border-slate-200 bg-white px-4 py-3'>
                            <div className='flex flex-wrap items-center justify-between gap-3'>
                                <div>
                                    <div className='text-sm font-semibold text-slate-800'>
                                        {cluster
                                            ? cluster.name
                                            : 'Danh sách công đoạn'}
                                    </div>

                                    <div className='mt-0.5 text-[11px] text-slate-500'>
                                        {selectedContext
                                            ? `${selectedContext.category.name} · ${selectedContext.group.name} · ${selectedContext.document.documentCode}`
                                            : 'Chọn một cụm ở cây bên trái'}
                                    </div>
                                </div>


                                <div className='flex items-center gap-2'>
                                    <div className='rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700'>
                                        Đã chọn:{' '}
                                        <span className='font-semibold'>
                                            {selectedCount}
                                        </span>
                                    </div>

                                    {selectedCount >
                                        0 && (
                                        <button
                                            type='button'
                                            onClick={
                                                clearSelection
                                            }
                                            className='h-7 rounded border border-slate-300 bg-white px-2.5 text-[11px] text-slate-600 hover:bg-slate-50'
                                        >
                                            Bỏ chọn
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>


                        <div className='min-h-0 flex-1 overflow-auto p-3'>
                            <div className='min-h-full overflow-hidden rounded border border-slate-300 bg-white'>
                                <div className='h-full overflow-auto'>
                                    <table className='min-w-[1050px] w-full border-collapse text-xs'>
                                        <thead className='sticky top-0 z-10 bg-slate-100 text-slate-700'>
                                            <tr>
                                                <th className='w-10 border-b border-r border-slate-300 px-2 py-2 text-center'>
                                                    <input
                                                        type='checkbox'
                                                        checked={
                                                            allCurrentClusterChecked
                                                        }
                                                        disabled={
                                                            currentClusterOperations.length ===
                                                            0
                                                        }
                                                        onChange={(event) =>
                                                            toggleCurrentCluster(
                                                                event.target.checked
                                                            )
                                                        }
                                                        title='Chọn tất cả công đoạn trong cụm'
                                                        className='h-4 w-4 cursor-pointer disabled:cursor-not-allowed'
                                                    />
                                                </th>

                                                <th className='w-12 border-b border-r border-slate-300 px-2 py-2 text-center'>
                                                    STT
                                                </th>

                                                <th className='min-w-[220px] border-b border-r border-slate-300 px-3 py-2 text-left'>
                                                    Tên công đoạn
                                                </th>

                                                <th className='min-w-[110px] border-b border-r border-slate-300 px-3 py-2 text-left'>
                                                    Mã công đoạn
                                                </th>

                                                <th className='min-w-[100px] border-b border-r border-slate-300 px-3 py-2 text-left'>
                                                    MMTB code
                                                </th>

                                                <th className='w-16 border-b border-r border-slate-300 px-2 py-2 text-center'>
                                                    Bậc
                                                </th>

                                                <th className='w-24 border-b border-r border-slate-300 px-3 py-2 text-right'>
                                                    Hệ số
                                                </th>

                                                <th className='w-24 border-b border-r border-slate-300 px-3 py-2 text-right'>
                                                    SMV
                                                </th>

                                                <th className='w-24 border-b border-r border-slate-300 px-3 py-2 text-right'>
                                                    SMV ĐC
                                                </th>

                                                <th className='w-24 border-b border-r border-slate-300 px-2 py-2 text-center'>
                                                    GSD bước
                                                </th>

                                                <th className='w-24 border-b border-r border-slate-300 px-3 py-2 text-right'>
                                                    Giây GSD
                                                </th>

                                                <th className='w-20 border-b border-slate-300 px-2 py-2 text-center'>
                                                    Nhân lực
                                                </th>
                                            </tr>
                                        </thead>


                                        <tbody>
                                            {currentClusterOperations.map(
                                                (
                                                    operation,
                                                    index
                                                ) => {
                                                    const checked =
                                                        selectedKeys.has(
                                                            operation.key
                                                        );


                                                    return (
                                                        <tr
                                                            key={
                                                                operation.key
                                                            }
                                                            onClick={() =>
                                                                toggleOperation(
                                                                    operation
                                                                )
                                                            }
                                                            className={`cursor-pointer ${
                                                                checked
                                                                    ? 'bg-blue-50'
                                                                    : 'bg-white hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <td className='border-b border-r border-slate-200 px-2 py-2 text-center'>
                                                                <input
                                                                    type='checkbox'
                                                                    checked={
                                                                        checked
                                                                    }
                                                                    onChange={() =>
                                                                        toggleOperation(
                                                                            operation
                                                                        )
                                                                    }
                                                                    onClick={(event) =>
                                                                        event.stopPropagation()
                                                                    }
                                                                    className='h-4 w-4 cursor-pointer'
                                                                />
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-2 py-2 text-center text-slate-500'>
                                                                {index +
                                                                    1}
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-3 py-2 font-medium text-slate-800'>
                                                                {operation.name ||
                                                                    '-'}
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-3 py-2 text-slate-600'>
                                                                {operation.code ||
                                                                    '-'}
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-3 py-2 text-slate-600'>
                                                                {operation.codeMmtb ||
                                                                    '-'}
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-2 py-2 text-center'>
                                                                {operation.skillLevel}
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-3 py-2 text-right'>
                                                                {formatNumber(
                                                                    operation.salaryCoefficient
                                                                )}
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-3 py-2 text-right font-medium'>
                                                                {formatNumber(
                                                                    operation.samGsd
                                                                )}
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-3 py-2 text-right'>
                                                                {formatNumber(
                                                                    operation.adjustedSam
                                                                )}
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-2 py-2 text-center'>
                                                                {operation.totalActions}
                                                            </td>

                                                            <td className='border-b border-r border-slate-200 px-3 py-2 text-right'>
                                                                {formatNumber(
                                                                    operation.totalActionSeconds
                                                                )}
                                                            </td>

                                                            <td className='border-b border-slate-200 px-2 py-2 text-center'>
                                                                {operation.manpower}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}


                                            {currentClusterOperations.length ===
                                                0 && (
                                                <tr>
                                                    <td
                                                        colSpan={
                                                            12
                                                        }
                                                        className='h-40 px-4 text-center text-sm text-slate-400'
                                                    >
                                                        {cluster
                                                            ? 'Cụm này chưa có công đoạn.'
                                                            : 'Chọn một cụm ở cây bên trái.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>


                        <div className='shrink-0 border-t border-slate-200 bg-white px-4 py-2 text-[11px] text-slate-500'>
                            Cụm hiện tại:{' '}
                            <span className='font-medium text-slate-700'>
                                {currentClusterOperations.length}
                            </span>{' '}
                            công đoạn
                        </div>
                    </section>
                </div>


                {/* FOOTER */}
                <div className='flex h-12 shrink-0 items-center justify-between border-t border-slate-300 bg-slate-50 px-4'>
                    <div className='text-xs text-slate-500'>
                        Đã chọn{' '}
                        <span className='font-semibold text-blue-700'>
                            {selectedCount}
                        </span>{' '}
                        công đoạn
                    </div>


                    <div className='flex items-center gap-2'>
                        <Button
                            type='button'
                            onClick={
                                handleClose
                            }
                            size='sm'
                        >
                            Hủy
                        </Button>

                        <Button
                            type='button'
                            variant='primary'
                            onClick={
                                handleConfirm
                            }
                            disabled={
                                selectedCount ===
                                0
                            }
                            size='sm'
                        >
                            Lấy {selectedCount} công đoạn
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}