import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import type {
    DynamicColumn,
    DynamicRow,
    ColumnType,
} from '../../features/myPage/types/types';

import './DynamicTable.css';


type SortState = {
    field: string;
    direction: 'asc' | 'desc';
} | null;


type Props = {
    columns: DynamicColumn[];
    rows: DynamicRow[];

    idField: string;

    loading?: boolean;

    pageSize?: number;

    onAdd?: (
        data: DynamicRow
    ) => Promise<void>;

    onEdit?: (
        id: unknown,
        data: DynamicRow
    ) => Promise<void>;

    onDelete?: (
        id: unknown,
        row: DynamicRow
    ) => Promise<void>;

    onRefresh?: () => Promise<unknown> | void;
};


export function DynamicTable({
    columns,
    rows,
    idField,

    loading = false,

    pageSize: defaultPageSize = 10,

    onAdd,
    onEdit,
    onDelete,
    onRefresh,
}: Props) {

    const [search, setSearch] = useState('');

    const [filters, setFilters] = useState<
        Record<string, string>
    >({});

    const [sort, setSort] =
        useState<SortState>(null);

    const [page, setPage] =
        useState(1);

    const [pageSize, setPageSize] =
        useState(defaultPageSize);

    const [showForm, setShowForm] =
        useState(false);

    const [formMode, setFormMode] =
        useState<'add' | 'edit'>('add');

    const [selectedRow, setSelectedRow] =
        useState<DynamicRow | null>(null);

    const [saving, setSaving] =
        useState(false);


    // =========================
    // Visible columns
    // =========================

    const visibleColumns = useMemo(
        () =>
            columns.filter(
                col => col.visible !== false
            ),
        [columns]
    );


    // =========================
    // Search
    // =========================

    const searchedRows = useMemo(() => {

        if (!search.trim()) {
            return rows;
        }

        const keyword =
            search.toLowerCase().trim();

        const searchableColumns =
            visibleColumns.filter(
                col => col.searchable !== false
            );

        return rows.filter(row => {

            return searchableColumns.some(
                column => {

                    const value =
                        row[column.field];

                    return String(value ?? '')
                        .toLowerCase()
                        .includes(keyword);
                }
            );
        });

    }, [
        rows,
        search,
        visibleColumns
    ]);


    // =========================
    // Filter
    // =========================

    const filteredRows = useMemo(() => {

        return searchedRows.filter(row => {

            return columns.every(column => {

                const filter =
                    filters[column.field];

                if (
                    filter === undefined ||
                    filter === ''
                ) {
                    return true;
                }

                const value =
                    row[column.field];

                if (column.type === 'boolean') {

                    return String(
                        Boolean(value)
                    ) === filter;
                }

                return String(value ?? '')
                    .toLowerCase()
                    .includes(
                        filter.toLowerCase()
                    );
            });
        });

    }, [
        searchedRows,
        filters,
        columns
    ]);


    // =========================
    // Sort
    // =========================

    const sortedRows = useMemo(() => {

        if (!sort) {
            return filteredRows;
        }

        const column =
            columns.find(
                col =>
                    col.field === sort.field
            );

        if (!column) {
            return filteredRows;
        }

        return [...filteredRows].sort(
            (a, b) => {

                const result = compareValues(
                    a[sort.field],
                    b[sort.field],
                    column.type
                );

                return sort.direction === 'asc'
                    ? result
                    : -result;
            }
        );

    }, [
        filteredRows,
        sort,
        columns
    ]);


    // =========================
    // Pagination
    // =========================

    const totalPages = Math.max(
        1,
        Math.ceil(
            sortedRows.length / pageSize
        )
    );

    const paginatedRows = useMemo(() => {

        const start =
            (page - 1) * pageSize;

        return sortedRows.slice(
            start,
            start + pageSize
        );

    }, [
        sortedRows,
        page,
        pageSize
    ]);


    useEffect(() => {
        setPage(1);
    }, [
        search,
        filters,
        pageSize
    ]);


    useEffect(() => {

        if (page > totalPages) {
            setPage(totalPages);
        }

    }, [
        totalPages,
        page
    ]);


    // =========================
    // Sorting
    // =========================

    const handleSort = (
        column: DynamicColumn
    ) => {

        if (column.sortable === false) {
            return;
        }

        setSort(current => {

            if (
                current?.field ===
                column.field
            ) {
                return {
                    field: column.field,
                    direction:
                        current.direction === 'asc'
                            ? 'desc'
                            : 'asc'
                };
            }

            return {
                field: column.field,
                direction: 'asc'
            };
        });
    };


    // =========================
    // Add
    // =========================

    const openAdd = () => {
        setFormMode('add');
        setSelectedRow(null);
        setShowForm(true);
    };


    // =========================
    // Edit
    // =========================

    const openEdit = (
        row: DynamicRow
    ) => {
        setSelectedRow(row);
        setFormMode('edit');
        setShowForm(true);
    };


    // =========================
    // Delete
    // =========================

    const handleDelete = async (
        row: DynamicRow
    ) => {

        if (!onDelete) return;

        const id =
            row[idField];

        const confirmed =
            window.confirm(
                'Bạn có chắc muốn xóa dòng này?'
            );

        if (!confirmed) return;

        try {

            await onDelete(
                id,
                row
            );

        } catch (error) {

            console.error(error);

            alert('Xóa thất bại');
        }
    };


    // =========================
    // Submit form
    // =========================

    const handleSubmit = async (
        data: DynamicRow
    ) => {

        try {

            setSaving(true);

            if (
                formMode === 'add' &&
                onAdd
            ) {
                await onAdd(data);
            }

            if (
                formMode === 'edit' &&
                onEdit &&
                selectedRow
            ) {

                await onEdit(
                    selectedRow[idField],
                    data
                );
            }

            setShowForm(false);
            setSelectedRow(null);

        } catch (error) {

            console.error(error);

            alert('Lưu dữ liệu thất bại');

        } finally {

            setSaving(false);
        }
    };


    return (
        <div className="dynamic-table">

            {/* Toolbar */}

            <div className="dt-toolbar">

                <div className="dt-toolbar-left">

                    {onAdd && (
                        <button
                            className="dt-btn dt-btn-primary"
                            onClick={openAdd}
                        >
                            + Thêm
                        </button>
                    )}

                    {onRefresh && (
                        <button
                            className="dt-btn"
                            onClick={() =>
                                onRefresh()
                            }
                        >
                            ↻ Làm mới
                        </button>
                    )}

                </div>


                <div className="dt-toolbar-right">

                    <input
                        className="dt-search"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={e =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

            </div>


            {/* Table */}

            <div className="dt-table-wrapper">

                <table>

                    <thead>

                        {/* Header */}

                        <tr>

                            {visibleColumns.map(
                                column => (

                                    <th
                                        key={
                                            column.field
                                        }
                                        style={{
                                            width:
                                                column.width
                                        }}
                                    >

                                        <button
                                            className="dt-sort-button"
                                            onClick={() =>
                                                handleSort(
                                                    column
                                                )
                                            }
                                        >

                                            {
                                                column.label
                                            }

                                            {sort?.field ===
                                                column.field && (
                                                <span>
                                                    {
                                                        sort.direction ===
                                                        'asc'
                                                            ? ' ▲'
                                                            : ' ▼'
                                                    }
                                                </span>
                                            )}

                                        </button>

                                    </th>
                                )
                            )}


                            {(onEdit ||
                                onDelete) && (
                                <th className="dt-action-column">
                                    Thao tác
                                </th>
                            )}

                        </tr>


                        {/* Filters */}

                        <tr className="dt-filter-row">

                            {visibleColumns.map(
                                column => (

                                    <th
                                        key={
                                            column.field
                                        }
                                    >

                                        {column.filterable !==
                                        false ? (

                                            <FilterInput
                                                column={
                                                    column
                                                }
                                                value={
                                                    filters[
                                                        column
                                                            .field
                                                    ] ??
                                                    ''
                                                }
                                                onChange={value =>
                                                    setFilters(
                                                        prev => ({
                                                            ...prev,
                                                            [column.field]:
                                                                value,
                                                        })
                                                    )
                                                }
                                            />

                                        ) : null}

                                    </th>
                                )
                            )}


                            {(onEdit ||
                                onDelete) && (
                                <th />
                            )}

                        </tr>

                    </thead>


                    <tbody>

                        {loading ? (

                            <tr>
                                <td
                                    colSpan={
                                        visibleColumns.length +
                                        (onEdit ||
                                        onDelete
                                            ? 1
                                            : 0)
                                    }
                                    className="dt-empty"
                                >
                                    Đang tải...
                                </td>
                            </tr>

                        ) : paginatedRows.length ===
                          0 ? (

                            <tr>
                                <td
                                    colSpan={
                                        visibleColumns.length +
                                        (onEdit ||
                                        onDelete
                                            ? 1
                                            : 0)
                                    }
                                    className="dt-empty"
                                >
                                    Không có dữ liệu
                                </td>
                            </tr>

                        ) : (

                            paginatedRows.map(
                                (row, rowIndex) => (

                                    <tr
                                        key={
                                            String(
                                                row[
                                                    idField
                                                ] ??
                                                    rowIndex
                                            )
                                        }
                                    >

                                        {visibleColumns.map(
                                            column => (

                                                <td
                                                    key={
                                                        column.field
                                                    }
                                                >

                                                    {column.render
                                                        ? column.render(
                                                              row[
                                                                  column
                                                                      .field
                                                              ],
                                                              row
                                                          )
                                                        : renderValue(
                                                              row[
                                                                  column
                                                                      .field
                                                              ],
                                                              column.type
                                                          )}

                                                </td>
                                            )
                                        )}


                                        {(onEdit ||
                                            onDelete) && (

                                            <td className="dt-actions">

                                                {onEdit && (
                                                    <button
                                                        className="dt-btn dt-btn-small"
                                                        onClick={() =>
                                                            openEdit(
                                                                row
                                                            )
                                                        }
                                                    >
                                                        Sửa
                                                    </button>
                                                )}

                                                {onDelete && (
                                                    <button
                                                        className="dt-btn dt-btn-small dt-btn-danger"
                                                        onClick={() =>
                                                            handleDelete(
                                                                row
                                                            )
                                                        }
                                                    >
                                                        Xóa
                                                    </button>
                                                )}

                                            </td>
                                        )}

                                    </tr>
                                )
                            )
                        )}

                    </tbody>

                </table>

            </div>


            {/* Pagination */}

            <div className="dt-pagination">

                <div>
                    Tổng:
                    {' '}
                    <strong>
                        {sortedRows.length}
                    </strong>
                    {' '}
                    dòng
                </div>


                <div className="dt-pagination-controls">

                    <select
                        value={pageSize}
                        onChange={e =>
                            setPageSize(
                                Number(
                                    e.target.value
                                )
                            )
                        }
                    >
                        <option value={10}>
                            10 / trang
                        </option>

                        <option value={20}>
                            20 / trang
                        </option>

                        <option value={50}>
                            50 / trang
                        </option>

                        <option value={100}>
                            100 / trang
                        </option>
                    </select>


                    <button
                        className="dt-btn"
                        disabled={page <= 1}
                        onClick={() =>
                            setPage(1)
                        }
                    >
                        «
                    </button>

                    <button
                        className="dt-btn"
                        disabled={page <= 1}
                        onClick={() =>
                            setPage(
                                p =>
                                    Math.max(
                                        1,
                                        p - 1
                                    )
                            )
                        }
                    >
                        ‹
                    </button>


                    <span>
                        Trang {page} /{' '}
                        {totalPages}
                    </span>


                    <button
                        className="dt-btn"
                        disabled={
                            page >= totalPages
                        }
                        onClick={() =>
                            setPage(
                                p =>
                                    Math.min(
                                        totalPages,
                                        p + 1
                                    )
                            )
                        }
                    >
                        ›
                    </button>

                    <button
                        className="dt-btn"
                        disabled={
                            page >= totalPages
                        }
                        onClick={() =>
                            setPage(
                                totalPages
                            )
                        }
                    >
                        »
                    </button>

                </div>

            </div>


            {/* Add / Edit Modal */}

            {showForm && (

                <DynamicFormModal
                    mode={formMode}
                    columns={columns}
                    initialData={
                        selectedRow ?? {}
                    }
                    saving={saving}
                    onSubmit={
                        handleSubmit
                    }
                    onClose={() => {
                        setShowForm(false);
                        setSelectedRow(null);
                    }}
                />

            )}

        </div>
    );
}


// =======================================================
// Dynamic Form
// =======================================================

type FormProps = {
    mode: 'add' | 'edit';

    columns: DynamicColumn[];

    initialData: DynamicRow;

    saving: boolean;

    onSubmit: (
        data: DynamicRow
    ) => Promise<void>;

    onClose: () => void;
};


function DynamicFormModal({
    mode,
    columns,
    initialData,
    saving,
    onSubmit,
    onClose,
}: FormProps) {

    const [form, setForm] =
        useState<DynamicRow>({});


    useEffect(() => {

        const initial: DynamicRow = {};

        columns.forEach(column => {

            const value =
                initialData[column.field];

            initial[column.field] =
                value ??
                getDefaultValue(
                    column.type
                );
        });

        setForm(initial);

    }, [
        columns,
        initialData
    ]);


    const formColumns =
        columns.filter(column => {

            if (
                column.formVisible === false
            ) {
                return false;
            }

            if (mode === 'add') {
                return (
                    column.insertable !==
                    false
                );
            }

            return (
                column.editable !== false
            );
        });


    const setValue = (
        field: string,
        value: unknown
    ) => {

        setForm(prev => ({
            ...prev,
            [field]: value,
        }));
    };


    const handleFormSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        const output: DynamicRow = {};

        formColumns.forEach(column => {

            output[column.field] =
                normalizeFormValue(
                    form[column.field],
                    column.type
                );
        });

        await onSubmit(output);
    };


    return (
        <div className="dt-modal-backdrop">

            <div className="dt-modal">

                <div className="dt-modal-header">

                    <h3>
                        {mode === 'add'
                            ? 'Thêm mới'
                            : 'Chỉnh sửa'}
                    </h3>

                    <button
                        type="button"
                        className="dt-modal-close"
                        onClick={onClose}
                    >
                        ×
                    </button>

                </div>


                <form
                    onSubmit={
                        handleFormSubmit
                    }
                >

                    <div className="dt-form">

                        {formColumns.map(
                            column => (

                                <div
                                    className="dt-form-group"
                                    key={
                                        column.field
                                    }
                                >

                                    <label>

                                        {
                                            column.label
                                        }

                                        {column.required && (
                                            <span className="dt-required">
                                                {' '}
                                                *
                                            </span>
                                        )}

                                    </label>


                                    <FormInput
                                        column={
                                            column
                                        }
                                        value={
                                            form[
                                                column
                                                    .field
                                            ]
                                        }
                                        onChange={
                                            value =>
                                                setValue(
                                                    column.field,
                                                    value
                                                )
                                        }
                                    />

                                </div>
                            )
                        )}

                    </div>


                    <div className="dt-modal-footer">

                        <button
                            type="button"
                            className="dt-btn"
                            onClick={
                                onClose
                            }
                            disabled={
                                saving
                            }
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className="dt-btn dt-btn-primary"
                            disabled={
                                saving
                            }
                        >
                            {saving
                                ? 'Đang lưu...'
                                : 'Lưu'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


// =======================================================
// Form Input
// =======================================================

type FormInputProps = {
    column: DynamicColumn;
    value: unknown;

    onChange: (
        value: unknown
    ) => void;
};


function FormInput({
    column,
    value,
    onChange,
}: FormInputProps) {

    switch (column.type) {

        case 'number':

            return (
                <input
                    type="number"
                    required={
                        column.required
                    }
                    placeholder={
                        column.placeholder
                    }
                    value={String(
                        value ?? ''
                    )}
                    onChange={e =>
                        onChange(
                            e.target.value
                        )
                    }
                />
            );


        case 'date':

            return (
                <input
                    type="date"
                    required={
                        column.required
                    }
                    value={
                        toDateInputValue(
                            value
                        )
                    }
                    onChange={e =>
                        onChange(
                            e.target.value
                        )
                    }
                />
            );


        case 'datetime':

            return (
                <input
                    type="datetime-local"
                    required={
                        column.required
                    }
                    value={
                        toDateTimeInputValue(
                            value
                        )
                    }
                    onChange={e =>
                        onChange(
                            e.target.value
                        )
                    }
                />
            );


        case 'boolean':

            return (
                <label className="dt-checkbox">

                    <input
                        type="checkbox"
                        checked={
                            Boolean(value)
                        }
                        onChange={e =>
                            onChange(
                                e.target.checked
                            )
                        }
                    />

                    Có

                </label>
            );


        case 'select':

            return (
                <select
                    required={
                        column.required
                    }
                    value={String(
                        value ?? ''
                    )}
                    onChange={e => {

                        const option =
                            column.options?.find(
                                option =>
                                    String(
                                        option.value
                                    ) ===
                                    e.target.value
                            );

                        onChange(
                            option?.value ??
                                e.target.value
                        );
                    }}
                >

                    <option value="">
                        -- Chọn --
                    </option>

                    {column.options?.map(
                        option => (

                            <option
                                key={String(
                                    option.value
                                )}
                                value={String(
                                    option.value
                                )}
                            >
                                {
                                    option.label
                                }
                            </option>
                        )
                    )}

                </select>
            );


        default:

            return (
                <input
                    type="text"
                    required={
                        column.required
                    }
                    placeholder={
                        column.placeholder
                    }
                    value={String(
                        value ?? ''
                    )}
                    onChange={e =>
                        onChange(
                            e.target.value
                        )
                    }
                />
            );
    }
}


// =======================================================
// Filter Input
// =======================================================

function FilterInput({
    column,
    value,
    onChange,
}: {
    column: DynamicColumn;
    value: string;
    onChange: (
        value: string
    ) => void;
}) {

    if (column.type === 'boolean') {

        return (
            <select
                value={value}
                onChange={e =>
                    onChange(
                        e.target.value
                    )
                }
            >

                <option value="">
                    Tất cả
                </option>

                <option value="true">
                    Có
                </option>

                <option value="false">
                    Không
                </option>

            </select>
        );
    }


    if (
        column.type === 'select' &&
        column.options
    ) {

        return (
            <select
                value={value}
                onChange={e =>
                    onChange(
                        e.target.value
                    )
                }
            >

                <option value="">
                    Tất cả
                </option>

                {column.options.map(
                    option => (

                        <option
                            key={String(
                                option.value
                            )}
                            value={String(
                                option.value
                            )}
                        >
                            {option.label}
                        </option>

                    )
                )}

            </select>
        );
    }


    return (
        <input
            type={
                column.type === 'date'
                    ? 'date'
                    : 'text'
            }
            placeholder="Lọc..."
            value={value}
            onChange={e =>
                onChange(
                    e.target.value
                )
            }
        />
    );
}


// =======================================================
// Render Cell
// =======================================================

function renderValue(
    value: unknown,
    type?: ColumnType
) {

    if (
        value === null ||
        value === undefined
    ) {
        return '';
    }


    switch (type) {

        case 'number':

            return Number(value)
                .toLocaleString(
                    'vi-VN'
                );


        case 'date':

            return formatDate(
                value,
                false
            );


        case 'datetime':

            return formatDate(
                value,
                true
            );


        case 'boolean':

            return Boolean(value)
                ? '✓'
                : '';


        default:

            return String(value);
    }
}


// =======================================================
// Helpers
// =======================================================

function compareValues(
    a: unknown,
    b: unknown,
    type?: ColumnType
) {

    if (
        a === null ||
        a === undefined
    ) {
        return 1;
    }

    if (
        b === null ||
        b === undefined
    ) {
        return -1;
    }


    if (type === 'number') {

        return (
            Number(a) -
            Number(b)
        );
    }


    if (
        type === 'date' ||
        type === 'datetime'
    ) {

        return (
            new Date(
                String(a)
            ).getTime() -
            new Date(
                String(b)
            ).getTime()
        );
    }


    if (type === 'boolean') {

        return (
            Number(Boolean(a)) -
            Number(Boolean(b))
        );
    }


    return String(a).localeCompare(
        String(b),
        'vi'
    );
}


function getDefaultValue(
    type?: ColumnType
) {

    if (type === 'boolean') {
        return false;
    }

    return '';
}


function normalizeFormValue(
    value: unknown,
    type?: ColumnType
) {

    if (
        value === '' ||
        value === undefined
    ) {
        return null;
    }


    if (type === 'number') {
        return Number(value);
    }


    if (type === 'boolean') {
        return Boolean(value);
    }


    return value;
}


function formatDate(
    value: unknown,
    showTime: boolean
) {

    const date =
        new Date(String(value));

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }


    if (showTime) {

        return date.toLocaleString(
            'vi-VN'
        );
    }


    return date.toLocaleDateString(
        'vi-VN'
    );
}


function toDateInputValue(
    value: unknown
) {

    if (!value) {
        return '';
    }

    const date =
        new Date(String(value));

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value).slice(
            0,
            10
        );
    }

    return date
        .toISOString()
        .slice(0, 10);
}


function toDateTimeInputValue(
    value: unknown
) {

    if (!value) {
        return '';
    }

    const date =
        new Date(String(value));

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value).slice(
            0,
            16
        );
    }

    const offset =
        date.getTimezoneOffset();

    const local =
        new Date(
            date.getTime() -
                offset * 60000
        );

    return local
        .toISOString()
        .slice(0, 16);
}