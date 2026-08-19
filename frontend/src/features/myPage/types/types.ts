import type { ReactNode } from 'react';

export type ColumnType =
    | 'string'
    | 'number'
    | 'date'
    | 'datetime'
    | 'boolean'
    | 'select';

export type DynamicRow = Record<string, unknown>;

export type SelectOption = {
    label: string;
    value: string | number | boolean;
};

export type DynamicColumn = {
    field: string;
    label: string;

    type?: ColumnType;

    // Table
    visible?: boolean;
    sortable?: boolean;
    searchable?: boolean;
    filterable?: boolean;
    width?: number | string;

    // Form
    formVisible?: boolean;
    insertable?: boolean;
    editable?: boolean;
    required?: boolean;
    placeholder?: string;

    // select
    options?: SelectOption[];

    // custom cell nếu cần
    render?: (
        value: unknown,
        row: DynamicRow
    ) => ReactNode;
};

export type DynamicTableResponse = {
    success: boolean;
    columns: DynamicColumn[];
    data: DynamicRow[];
};