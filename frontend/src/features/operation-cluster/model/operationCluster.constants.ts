export type OperationClusterFormState = {
    document_code: string;
    work_id: string;
    product_category_id: string;
    product_category_group_id: string;
    required_efficiency: string;
    price_method: 'GSD' | 'ADJUSTED';
    status_id: number;
    note: string;
};

export const OPERATION_CLUSTER_DRAFT_KEY =
    'operation_cluster_draft_v1';

export const DEFAULT_OPERATION_CLUSTER_FORM: OperationClusterFormState = {
    document_code: '',
    work_id: '',
    product_category_id: '',
    product_category_group_id: '',
    required_efficiency: '0.8',
    price_method: 'GSD',
    status_id: 0,
    note: '',
};