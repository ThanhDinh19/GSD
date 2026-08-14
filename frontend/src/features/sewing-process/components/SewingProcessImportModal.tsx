import {
    useMemo,
    useRef,
    useState,
} from 'react';

import {
    FileSpreadsheet,
    Maximize2,
    Minimize2,
    X,
} from 'lucide-react';

import type {
    SewingProcessHeader,
    SewingProcessLine
} from '../types/sewingProcess.types';

import type {
    SewingProcessImportColumn,
    SewingProcessImportPreview,
    SewingProcessImportRow,
} from '../types/sewingProcessImport';

import {
    sewingProcessImportService,
} from '../services/sewingProcessImport.service';


interface SewingProcessImportModalProps {
    open: boolean;

    header: Partial<SewingProcessHeader>;

    onClose: () => void;

    onApply: (
        lines: SewingProcessLine[]
    ) => void;
}

function displayValue(
    value: unknown
) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return '';
    }

    if (
        typeof value === 'number'
    ) {
        return String(value);
    }

    return String(value);
}

export default function SewingProcessImportModal({
    open,
    header,
    onClose,
    onApply,
}: SewingProcessImportModalProps) {
    const [
        file,
        setFile,
    ] = useState<File | null>(
        null
    );

    const [
        preview,
        setPreview,
    ] = useState<SewingProcessImportPreview | null>(
        null
    );

    const [
        rows,
        setRows,
    ] = useState<SewingProcessImportRow[]>(
        []
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState('');

    const [
        isMaximized,
        setIsMaximized,
    ] = useState(false);

    const [
        windowRect,
        setWindowRect,
    ] = useState(() => ({
        x: 8,
        y: 8,
        width: Math.max(
            720,
            window.innerWidth - 16
        ),
        height: Math.max(
            500,
            window.innerHeight - 16
        ),
    }));

    const restoreRectRef =
        useRef(windowRect);

    const dragRef =
        useRef<{
            pointerId: number;
            startX: number;
            startY: number;
            startLeft: number;
            startTop: number;
        } | null>(null);

    type ResizeDirection =
        | 'nw'
        | 'ne'
        | 'sw'
        | 'se';

    const resizeRef =
        useRef<{
            pointerId: number;
            startX: number;
            startY: number;

            startLeft: number;
            startTop: number;

            startWidth: number;
            startHeight: number;

            direction: ResizeDirection;
        } | null>(null);


    const dataRows =
        useMemo(
            () =>
                rows.filter(
                    (row) =>
                        row.rowType ===
                        'DATA'
                ),
            [rows]
        );


    const checkedRows =
        useMemo(
            () =>
                dataRows.filter(
                    (row) =>
                        row.checked
                ),
            [dataRows]
        );


    const validRows =
        useMemo(
            () =>
                dataRows.filter(
                    (row) =>
                        row.isValid
                ),
            [dataRows]
        );


    const invalidRows =
        useMemo(
            () =>
                dataRows.filter(
                    (row) =>
                        !row.isValid
                ),
            [dataRows]
        );


    const checkedValidRows =
        useMemo(
            () =>
                dataRows.filter(
                    (row) =>
                        row.checked &&
                        row.isValid
                ),
            [dataRows]
        );


    const allValidChecked =
        validRows.length > 0 &&
        checkedValidRows.length ===
        validRows.length;


    if (!open) {
        return null;
    }


    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile =
            event.target.files?.[0] ??
            null;

        setFile(
            selectedFile
        );

        setPreview(
            null
        );

        setRows(
            []
        );

        setError(
            ''
        );
    };


    const handlePreview = async () => {
        if (!file) {
            setError(
                'Vui lòng chọn file Excel.'
            );

            return;
        }

        try {
            setLoading(
                true
            );

            setError(
                ''
            );

            const result =
                await sewingProcessImportService.preview(
                    file,
                    header
                );

            setPreview(
                result
            );

            setRows(
                result.rows.map(
                    (row) => ({
                        ...row,

                        errors: {
                            ...row.errors,
                        },

                        values: {
                            ...row.values,
                        },

                        normalizedInput:
                            row.normalizedInput
                                ? {
                                    ...row.normalizedInput,
                                }
                                : null,
                    })
                )
            );

        } catch (err) {
            console.error(
                'Preview import Excel lỗi:',
                err
            );

            setPreview(
                null
            );

            setRows(
                []
            );

            setError(
                err instanceof Error
                    ? err.message
                    : 'Không đọc được file Excel.'
            );

        } finally {
            setLoading(
                false
            );
        }
    };


    const handleToggleRow = (
        excelRow: number
    ) => {
        setRows(
            (currentRows) =>
                currentRows.map(
                    (row) => {
                        if (
                            row.rowType !==
                            'DATA' ||
                            row.excelRow !==
                            excelRow
                        ) {
                            return row;
                        }

                        return {
                            ...row,
                            checked:
                                !row.checked,
                        };
                    }
                )
        );
    };


    const handleCheckAll = (
        checked: boolean
    ) => {
        setRows(
            (currentRows) =>
                currentRows.map(
                    (row) => {
                        if (
                            row.rowType !==
                            'DATA'
                        ) {
                            return row;
                        }

                        return {
                            ...row,

                            checked:
                                checked
                                    ? row.isValid
                                    : false,
                        };
                    }
                )
        );
    };

    const normalizeEditedValue = (
        column: SewingProcessImportColumn,
        value: string
    ): unknown => {
        const text =
            String(value ?? '').trim();

        if (text === '') {
            return null;
        }

        if (
            column.dataType === 'integer'
        ) {
            const number =
                Number(
                    text.replace(',', '.')
                );

            return Number.isFinite(number)
                ? Math.trunc(number)
                : null;
        }

        if (
            column.dataType === 'decimal'
        ) {
            const number =
                Number(
                    text.replace(',', '.')
                );

            return Number.isFinite(number)
                ? number
                : null;
        }

        if (
            column.dataType === 'percent'
        ) {
            const clean =
                text
                    .replace('%', '')
                    .replace(',', '.')
                    .trim();

            const number =
                Number(clean);

            if (
                !Number.isFinite(number)
            ) {
                return null;
            }

            return number > 1
                ? number / 100
                : number;
        }

        return text;
    };


    const validateEditedValue = (
        column: SewingProcessImportColumn,
        value: string
    ): string => {
        const text =
            String(value ?? '').trim();

        if (
            column.field ===
            'operationName' &&
            !text
        ) {
            return 'Tên công đoạn không được để trống.';
        }

        if (!text) {
            return '';
        }

        if (
            column.dataType === 'integer'
        ) {
            const number =
                Number(
                    text.replace(',', '.')
                );

            if (
                !Number.isFinite(number) ||
                !Number.isInteger(number)
            ) {
                return 'Phải là số nguyên.';
            }
        }

        if (
            column.dataType === 'decimal'
        ) {
            const number =
                Number(
                    text.replace(',', '.')
                );

            if (
                !Number.isFinite(number)
            ) {
                return 'Phải là số.';
            }
        }

        if (
            column.dataType === 'percent'
        ) {
            const number =
                Number(
                    text
                        .replace('%', '')
                        .replace(',', '.')
                );

            if (
                !Number.isFinite(number) ||
                number <= 0 ||
                number > 100
            ) {
                return 'Hiệu suất phải > 0 và <= 100.';
            }
        }

        return '';
    };

    const handleEditCell = (
        excelRow: number,
        column: SewingProcessImportColumn,
        value: string
    ) => {
        setRows(
            (currentRows) =>
                currentRows.map(
                    (row) => {
                        if (
                            row.rowType !==
                            'DATA' ||
                            row.excelRow !==
                            excelRow
                        ) {
                            return row;
                        }

                        const nextValues = {
                            ...row.values,

                            [column.key]:
                                value,
                        };

                        const nextErrors = {
                            ...row.errors,
                        };

                        const errorMessage =
                            validateEditedValue(
                                column,
                                value
                            );

                        if (errorMessage) {
                            nextErrors[
                                column.key
                            ] =
                                errorMessage;
                        } else {
                            delete nextErrors[
                                column.key
                            ];
                        }

                        const nextNormalizedInput =
                            row.normalizedInput
                                ? {
                                    ...row.normalizedInput,
                                }
                                : {};

                        if (
                            column.field &&
                            column.saveInput
                        ) {
                            (
                                nextNormalizedInput as Record<
                                    string,
                                    unknown
                                >
                            )[column.field] =
                                normalizeEditedValue(
                                    column,
                                    value
                                );
                        }

                        return {
                            ...row,

                            values:
                                nextValues,

                            errors:
                                nextErrors,

                            normalizedInput:
                                nextNormalizedInput,

                            isValid:
                                Object.keys(
                                    nextErrors
                                ).length === 0,

                            calculated:
                                undefined,
                        };
                    }
                )
        );
    };

    const handleApply = () => {
        const selectedRows =
            rows.filter(
                (row) =>
                    row.rowType === 'DATA' &&
                    row.checked
            );


        if (
            selectedRows.length === 0
        ) {
            setError(
                'Vui lòng chọn ít nhất một dòng để áp dụng.'
            );

            return;
        }


        const invalidSelectedRows =
            selectedRows.filter(
                (row) =>
                    !row.isValid
            );


        if (
            invalidSelectedRows.length > 0
        ) {
            setError(
                `Có ${invalidSelectedRows.length} dòng đang lỗi nhưng vẫn được chọn. Vui lòng sửa hoặc bỏ chọn các dòng lỗi trước khi áp dụng.`
            );

            return;
        }


        const selectedLines: SewingProcessLine[] =
            selectedRows
                .filter(
                    (row) =>
                        row.normalizedInput !==
                        null
                )
                .map(
                    (
                        row,
                        index
                    ) => {
                        const input =
                            row.normalizedInput!;

                        return {
                            lineNo:
                                input.lineNo ??
                                index + 1,

                            lineOrder:
                                input.lineOrder ??
                                index + 1,

                            clusterNo:
                                input.clusterNo ??
                                null,

                            clusterName:
                                input.clusterName ??
                                null,

                            operationName:
                                input.operationName ??
                                '',

                            skillGradeLevel:
                                input.skillGradeLevel ??
                                null,

                            machineCode:
                                input.machineCode ??
                                null,

                            machineName:
                                input.machineName ??
                                null,

                            samGsd:
                                input.samGsd ??
                                0,

                            salaryCoefficient:
                                input.salaryCoefficient ??
                                0,

                            requiredEfficiency:
                                input.requiredEfficiency ??
                                null,

                            sewingEmployee:
                                input.sewingEmployee ??
                                null,

                            cbcTime:
                                input.cbcTime ??
                                null,

                            note:
                                input.note ??
                                null,

                            laborCount:
                                row.calculated
                                    ?.laborCount,

                            standardPrice:
                                row.calculated
                                    ?.standardPrice,

                            adjustedSam:
                                row.calculated
                                    ?.adjustedSam,

                            usedEfficiency:
                                row.calculated
                                    ?.usedEfficiency,

                            totalActions:
                                0,

                            toolNeed:
                                null,

                            operationCode:
                                null,

                            skillGradeId:
                                null,

                            machineId:
                                null,

                            gsdAnalysisId:
                                null,

                            sourceDocumentCode:
                                null,

                            sourceLineId:
                                null,
                        };
                    }
                );


        if (
            selectedLines.length === 0
        ) {
            setError(
                'Không có dòng hợp lệ để áp dụng.'
            );

            return;
        }


        setError(
            ''
        );

        onApply(
            selectedLines
        );
    };

    const toggleMaximize = () => {
        if (isMaximized) {
            setWindowRect(
                restoreRectRef.current
            );

            setIsMaximized(false);

            return;
        }

        restoreRectRef.current =
            windowRect;

        setWindowRect({
            x: 4,
            y: 4,
            width:
                window.innerWidth - 8,
            height:
                window.innerHeight - 8,
        });

        setIsMaximized(true);
    };


    const handleTitlePointerDown = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (isMaximized) {
            return;
        }

        dragRef.current = {
            pointerId:
                event.pointerId,

            startX:
                event.clientX,

            startY:
                event.clientY,

            startLeft:
                windowRect.x,

            startTop:
                windowRect.y,
        };

        event.currentTarget
            .setPointerCapture(
                event.pointerId
            );
    };


    const handleTitlePointerMove = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        const drag =
            dragRef.current;

        if (
            !drag ||
            drag.pointerId !==
            event.pointerId
        ) {
            return;
        }

        const nextX =
            drag.startLeft +
            event.clientX -
            drag.startX;

        const nextY =
            drag.startTop +
            event.clientY -
            drag.startY;

        setWindowRect(
            (previous) => ({
                ...previous,

                x: Math.min(
                    Math.max(
                        nextX,
                        0
                    ),
                    Math.max(
                        window.innerWidth -
                        120,
                        0
                    )
                ),

                y: Math.min(
                    Math.max(
                        nextY,
                        0
                    ),
                    Math.max(
                        window.innerHeight -
                        40,
                        0
                    )
                ),
            })
        );
    };


    const handleTitlePointerUp = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (
            dragRef.current?.pointerId !==
            event.pointerId
        ) {
            return;
        }

        dragRef.current =
            null;

        event.currentTarget
            .releasePointerCapture(
                event.pointerId
            );
    };

    const handleResizePointerDown = (
        event: React.PointerEvent<HTMLDivElement>,
        direction: ResizeDirection
    ) => {
        if (isMaximized) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        resizeRef.current = {
            pointerId: event.pointerId,

            startX: event.clientX,
            startY: event.clientY,

            startLeft: windowRect.x,
            startTop: windowRect.y,

            startWidth: windowRect.width,
            startHeight: windowRect.height,

            direction,
        };

        event.currentTarget.setPointerCapture(
            event.pointerId
        );
    };


    const handleResizePointerMove = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        const resize =
            resizeRef.current;

        if (
            !resize ||
            resize.pointerId !==
            event.pointerId
        ) {
            return;
        }

        const deltaX =
            event.clientX -
            resize.startX;

        const deltaY =
            event.clientY -
            resize.startY;


        const minWidth = Math.min(
            720,
            window.innerWidth - 16
        );

        const minHeight = Math.min(
            450,
            window.innerHeight - 16
        );


        let left =
            resize.startLeft;

        let top =
            resize.startTop;

        let right =
            resize.startLeft +
            resize.startWidth;

        let bottom =
            resize.startTop +
            resize.startHeight;


        if (
            resize.direction.includes('e')
        ) {
            right = Math.min(
                window.innerWidth,
                Math.max(
                    left + minWidth,
                    resize.startLeft +
                    resize.startWidth +
                    deltaX
                )
            );
        }


        if (
            resize.direction.includes('w')
        ) {
            left = Math.max(
                0,
                Math.min(
                    right - minWidth,
                    resize.startLeft +
                    deltaX
                )
            );
        }


        if (
            resize.direction.includes('s')
        ) {
            bottom = Math.min(
                window.innerHeight,
                Math.max(
                    top + minHeight,
                    resize.startTop +
                    resize.startHeight +
                    deltaY
                )
            );
        }


        if (
            resize.direction.includes('n')
        ) {
            top = Math.max(
                0,
                Math.min(
                    bottom - minHeight,
                    resize.startTop +
                    deltaY
                )
            );
        }


        setWindowRect({
            x: left,
            y: top,

            width:
                right - left,

            height:
                bottom - top,
        });
    };


    const handleResizePointerUp = (
        event: React.PointerEvent<HTMLDivElement>
    ) => {
        if (
            resizeRef.current
                ?.pointerId !==
            event.pointerId
        ) {
            return;
        }

        resizeRef.current = null;

        event.currentTarget
            .releasePointerCapture(
                event.pointerId
            );
    };


    const handleClose = () => {
        if (loading) {
            return;
        }

        setFile(
            null
        );

        setPreview(
            null
        );

        setRows(
            []
        );

        setError(
            ''
        );

        onClose();
    };


    return (
        <div className='fixed inset-0 z-50 bg-black/25'>
            <div
                className='absolute flex flex-col overflow-hidden border border-slate-400 bg-white shadow-2xl'
                style={{
                    left: windowRect.x,
                    top: windowRect.y,
                    width: windowRect.width,
                    height: windowRect.height,
                }}
            >
                {/* TITLE BAR */}
                <div
                    onDoubleClick={toggleMaximize}
                    onPointerDown={handleTitlePointerDown}
                    onPointerMove={handleTitlePointerMove}
                    onPointerUp={handleTitlePointerUp}
                    className='flex h-9 shrink-0 cursor-default select-none items-center justify-between border-b border-slate-300 bg-slate-100 pl-3'
                >
                    <div className='flex min-w-0 items-center gap-2'>
                        <FileSpreadsheet className='h-4 w-4 shrink-0 text-emerald-600' />

                        <span className='truncate text-sm font-semibold text-slate-800'>
                            Import quy trình may
                        </span>

                        <span className='hidden text-xs text-slate-500 md:inline'>
                            - Kiểm tra dữ liệu Excel trước khi áp dụng
                        </span>
                    </div>

                    <div className='flex h-full items-center'>
                        <button
                            type='button'
                            onPointerDown={(event) =>
                                event.stopPropagation()
                            }
                            onClick={toggleMaximize}
                            className='flex h-full w-11 items-center justify-center text-slate-600 hover:bg-slate-200'
                            title={
                                isMaximized
                                    ? 'Khôi phục'
                                    : 'Phóng to'
                            }
                        >
                            {isMaximized ? (
                                <Minimize2 className='h-4 w-4' />
                            ) : (
                                <Maximize2 className='h-4 w-4' />
                            )}
                        </button>

                        <button
                            type='button'
                            onPointerDown={(event) =>
                                event.stopPropagation()
                            }
                            onClick={handleClose}
                            disabled={loading}
                            className='flex h-full w-11 items-center justify-center text-slate-600 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
                            title='Đóng'
                        >
                            <X className='h-4 w-4' />
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
                    {/* FILE TOOLBAR */}
                    <div className='flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2'>
                        <span className='text-xs font-medium text-slate-600'>
                            File Excel:
                        </span>

                        <label className='inline-flex h-7 cursor-pointer items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100'>
                            <FileSpreadsheet className='h-3.5 w-3.5' />

                            Chọn file

                            <input
                                type='file'
                                accept='.xlsx,.xls'
                                onChange={handleFileChange}
                                disabled={loading}
                                className='hidden'
                            />
                        </label>

                        <div
                            className='max-w-[320px] truncate text-xs text-slate-600'
                            title={file?.name || ''}
                        >
                            {file?.name || 'Chưa chọn file'}
                        </div>

                        <button
                            type='button'
                            onClick={handlePreview}
                            disabled={!file || loading}
                            className='h-7 rounded bg-slate-800 px-3 text-xs font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40'
                        >
                            {loading
                                ? 'Đang đọc...'
                                : 'Preview'}
                        </button>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className='mx-3 mt-2 shrink-0 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700'>
                            {error}
                        </div>
                    )}

                    {/* PREVIEW */}
                    {preview ? (
                        <>
                            {/* SUMMARY BAR */}
                            <div className='flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2'>
                                <div className='flex items-center gap-3'>
                                    <div>
                                        <div className='text-xs font-semibold text-slate-800'>
                                            Kết quả kiểm tra
                                        </div>

                                        <div className='text-[11px] text-slate-500'>
                                            Sheet: {preview.sheetName}
                                            {' · '}
                                            Header dòng {preview.headerRow}
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-wrap items-center gap-2'>
                                    <div className='rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700'>
                                        Tổng:{' '}
                                        <span className='font-semibold'>
                                            {dataRows.length}
                                        </span>
                                    </div>

                                    <div className='rounded border border-green-200 bg-green-50 px-2 py-1 text-[11px] text-green-700'>
                                        Hợp lệ:{' '}
                                        <span className='font-semibold'>
                                            {validRows.length}
                                        </span>
                                    </div>

                                    <div className='rounded border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-700'>
                                        Lỗi:{' '}
                                        <span className='font-semibold'>
                                            {invalidRows.length}
                                        </span>
                                    </div>

                                    <div className='rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] text-blue-700'>
                                        Đã chọn:{' '}
                                        <span className='font-semibold'>
                                            {checkedRows.length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* CALCULATION ERROR */}
                            {preview.calculationError && (
                                <div className='mx-3 mt-2 shrink-0 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800'>
                                    {preview.calculationError}
                                </div>
                            )}

                            {/* TABLE */}
                            <div className='mx-3 mb-2 mt-2 min-h-0 flex-1 overflow-hidden border border-slate-300 bg-white'>
                                <div className='h-full overflow-auto'>
                                    <table className='min-w-max border-collapse text-xs'>
                                        <thead className='sticky top-0 z-20 bg-slate-100'>
                                            <tr>
                                                <th className='sticky left-0 z-30 w-10 min-w-10 border-b border-r border-slate-300 bg-slate-100 px-2 py-2 text-center'>
                                                    <input
                                                        type='checkbox'
                                                        checked={allValidChecked}
                                                        onChange={(event) =>
                                                            handleCheckAll(
                                                                event.target.checked
                                                            )
                                                        }
                                                        title='Chọn tất cả dòng hợp lệ'
                                                        className='h-4 w-4 cursor-pointer'
                                                    />
                                                </th>

                                                <th className='sticky left-10 z-30 min-w-14 border-b border-r border-slate-300 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-700'>
                                                    Excel
                                                </th>

                                                {preview.columns.map(
                                                    (column) => (
                                                        <th
                                                            key={column.key}
                                                            className={`min-w-32 max-w-64 border-b border-r border-slate-300 px-3 py-2 text-left align-top font-semibold ${column.mapped
                                                                ? 'bg-slate-100 text-slate-700'
                                                                : 'bg-amber-50 text-amber-700'
                                                                }`}
                                                        >
                                                            <div>
                                                                {column.title}
                                                            </div>

                                                            <div className='mt-0.5 text-[10px] font-normal opacity-70'>
                                                                {column.mapped
                                                                    ? column.field
                                                                    : 'Unknown'}
                                                            </div>
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {rows.map(
                                                (row) => {
                                                    if (
                                                        row.rowType ===
                                                        'GROUP'
                                                    ) {
                                                        return (
                                                            <tr
                                                                key={`group-${row.excelRow}`}
                                                                className='bg-amber-100'
                                                            >
                                                                <td className='sticky left-0 z-10 border-b border-r border-amber-200 bg-amber-100 px-2 py-2' />

                                                                <td className='sticky left-10 z-10 border-b border-r border-amber-200 bg-amber-100 px-2 py-2 text-center text-xs font-medium text-amber-800'>
                                                                    {row.excelRow}
                                                                </td>

                                                                <td
                                                                    colSpan={
                                                                        preview
                                                                            .columns
                                                                            .length
                                                                    }
                                                                    className='border-b border-amber-200 px-3 py-2 font-semibold text-amber-900'
                                                                >
                                                                    {row.clusterName ||
                                                                        'CỤM'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    }

                                                    return (
                                                        <tr
                                                            key={`data-${row.excelRow}`}
                                                            className={
                                                                row.isValid
                                                                    ? 'bg-white hover:bg-slate-50'
                                                                    : 'bg-red-50/30'
                                                            }
                                                        >
                                                            <td className='sticky left-0 z-10 border-b border-r border-slate-200 bg-inherit px-2 py-2 text-center'>
                                                                <input
                                                                    type='checkbox'
                                                                    checked={
                                                                        row.checked
                                                                    }
                                                                    onChange={() =>
                                                                        handleToggleRow(
                                                                            row.excelRow
                                                                        )
                                                                    }
                                                                    className='h-4 w-4 cursor-pointer'
                                                                />
                                                            </td>

                                                            <td className='sticky left-10 z-10 border-b border-r border-slate-200 bg-inherit px-2 py-2 text-center text-slate-500'>
                                                                {row.excelRow}
                                                            </td>

                                                            {preview.columns.map(
                                                                (column) => {
                                                                    const cellError =
                                                                        row.errors[
                                                                        column
                                                                            .key
                                                                        ];

                                                                    const value =
                                                                        row.values[
                                                                        column
                                                                            .key
                                                                        ];

                                                                    return (
                                                                        <td
                                                                            key={`${row.excelRow}-${column.key}`}
                                                                            title={
                                                                                cellError ||
                                                                                ''
                                                                            }
                                                                            className={`max-w-64 border-b border-r border-slate-200 px-3 py-2 align-top ${cellError
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : !column.mapped
                                                                                    ? 'bg-amber-50/50 text-slate-700'
                                                                                    : 'text-slate-700'
                                                                                }`}
                                                                        >
                                                                            {column.mapped ? (
                                                                                <input
                                                                                    type='text'
                                                                                    inputMode={
                                                                                        column.dataType ===
                                                                                            'decimal' ||
                                                                                            column.dataType ===
                                                                                            'integer' ||
                                                                                            column.dataType ===
                                                                                            'percent'
                                                                                            ? 'decimal'
                                                                                            : undefined
                                                                                    }
                                                                                    value={
                                                                                        displayValue(
                                                                                            value
                                                                                        )
                                                                                    }
                                                                                    onChange={(event) =>
                                                                                        handleEditCell(
                                                                                            row.excelRow,
                                                                                            column,
                                                                                            event.target.value
                                                                                        )
                                                                                    }
                                                                                    className={`w-full min-w-24 border-0 bg-transparent px-1 py-0.5 text-xs outline-none ${cellError
                                                                                            ? 'text-red-800'
                                                                                            : 'text-slate-700'
                                                                                        }`}
                                                                                />
                                                                            ) : (
                                                                                <div className='whitespace-pre-wrap break-words'>
                                                                                    {displayValue(
                                                                                        value
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                            {cellError && (
                                                                                <div className='mt-1 text-[10px] font-medium text-red-600'>
                                                                                    {cellError}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                }
                                                            )}
                                                        </tr>
                                                    );
                                                }
                                            )}

                                            {rows.length ===
                                                0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={
                                                                preview
                                                                    .columns
                                                                    .length +
                                                                2
                                                            }
                                                            className='px-4 py-10 text-center text-sm text-slate-500'
                                                        >
                                                            Không có dữ liệu để hiển thị.
                                                        </td>
                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* LEGEND */}
                            <div className='flex shrink-0 flex-wrap items-center gap-4 border-t border-slate-100 px-3 py-1.5 text-[11px]'>
                                <div className='flex items-center gap-1.5'>
                                    <span className='h-3 w-3 border border-red-300 bg-red-100' />
                                    <span className='text-slate-600'>
                                        Ô sai dữ liệu
                                    </span>
                                </div>

                                <div className='flex items-center gap-1.5'>
                                    <span className='h-3 w-3 border border-amber-300 bg-amber-50' />
                                    <span className='text-slate-600'>
                                        Cột không nhận diện
                                    </span>
                                </div>

                                <div className='flex items-center gap-1.5'>
                                    <span className='h-3 w-3 border border-amber-300 bg-amber-100' />
                                    <span className='text-slate-600'>
                                        Dòng cụm
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='flex min-h-0 flex-1 items-center justify-center text-sm text-slate-400'>
                            Chọn file Excel và nhấn Preview để kiểm tra dữ liệu.
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className='flex h-10 shrink-0 items-center justify-between gap-3 border-t border-slate-300 bg-slate-50 px-3'>
                    <div className='text-xs text-slate-500'>
                        {preview && (
                            <>
                                Đã chọn{' '}
                                <span className='font-semibold text-slate-800'>
                                    {checkedRows.length}
                                </span>
                                {' / '}
                                {dataRows.length} dòng
                            </>
                        )}
                    </div>

                    <div className='flex items-center gap-2'>
                        <button
                            type='button'
                            onClick={handleClose}
                            disabled={loading}
                            className='h-7 rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            Đóng
                        </button>

                        {preview && (
                            <button
                                type='button'
                                onClick={handleApply}
                                disabled={
                                    loading ||
                                    checkedRows.length === 0
                                }
                                className='h-7 rounded bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
                            >
                                Áp dụng {checkedRows.length} dòng
                            </button>
                        )}
                    </div>
                </div>

                {/* RESIZE HANDLE */}
                {!isMaximized && (
                    <>
                        {/* TOP LEFT */}
                        <div
                            onPointerDown={(event) =>
                                handleResizePointerDown(
                                    event,
                                    'nw'
                                )
                            }
                            onPointerMove={
                                handleResizePointerMove
                            }
                            onPointerUp={
                                handleResizePointerUp
                            }
                            className='absolute left-0 top-0 z-50 h-3 w-3 cursor-nw-resize'
                            title='Resize'
                        >
                            <div className='absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-slate-400' />
                        </div>


                        {/* TOP RIGHT */}
                        <div
                            onPointerDown={(event) =>
                                handleResizePointerDown(
                                    event,
                                    'ne'
                                )
                            }
                            onPointerMove={
                                handleResizePointerMove
                            }
                            onPointerUp={
                                handleResizePointerUp
                            }
                            className='absolute right-0 top-0 z-50 h-3 w-3 cursor-ne-resize'
                            title='Resize'
                        >
                            <div className='absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-slate-400' />
                        </div>


                        {/* BOTTOM LEFT */}
                        <div
                            onPointerDown={(event) =>
                                handleResizePointerDown(
                                    event,
                                    'sw'
                                )
                            }
                            onPointerMove={
                                handleResizePointerMove
                            }
                            onPointerUp={
                                handleResizePointerUp
                            }
                            className='absolute bottom-0 left-0 z-50 h-3 w-3 cursor-sw-resize'
                            title='Resize'
                        >
                            <div className='absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-slate-400' />
                        </div>


                        {/* BOTTOM RIGHT */}
                        <div
                            onPointerDown={(event) =>
                                handleResizePointerDown(
                                    event,
                                    'se'
                                )
                            }
                            onPointerMove={
                                handleResizePointerMove
                            }
                            onPointerUp={
                                handleResizePointerUp
                            }
                            className='absolute bottom-0 right-0 z-50 h-3 w-3 cursor-se-resize'
                            title='Resize'
                        >
                            <div className='absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-slate-400' />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}