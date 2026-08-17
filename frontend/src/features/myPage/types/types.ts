export interface vGSD30BizDoc {
    SWCode: string,
    OPCode: string,
    ClusterName: string,
    OperationName: string
}

export type DynamicColumn = {
    field: string;
    label: string;
    type: 'string' | 'number' | 'datetime' | 'boolean';

    visible?: boolean;
    editable?: boolean;
    required?: boolean;
};

export type DynamicRow = Record<string, unknown>;

export type DynamicTableResponse = {
    success: boolean;
    columns: DynamicColumn[];
    data: DynamicRow[];
    
};