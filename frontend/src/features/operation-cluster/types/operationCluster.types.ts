export type OperationClusterPriceMethod = 'GSD' | 'ADJUSTED';

export type FormMode = 'create' | 'edit' | 'copy';

export interface OperationClusterFormState {
    document_code: string;
    work_id: string;
    product_category_id: string;
    product_category_group_id: string;
    required_efficiency: string;
    price_method: OperationClusterPriceMethod;
    status_id: number;
    note: string;
}

export interface OperationClusterHeader {
    id: number;
    document_code: string;

    work_id: number;
    work_code?: string;
    work_name?: string;

    product_category_id: number;
    product_code?: string;
    product_name?: string;

    product_category_group_id: number;
    category_group_code?: string;
    category_group_name?: string;

    required_efficiency?: number | null;
    price_method: OperationClusterPriceMethod;
    note?: string | null;
    status_id: number;
    status_name?: string;

    total_adjusted_sam?: number;
    total_sam_gsd?: number;
    total_actions?: number;
    total_action_seconds?: number;
    total_manpower?: number;

    created_at?: string;
    updated_at?: string | null;
}

export interface OperationClusterDetail {
    header: OperationClusterHeader;
    groups: any[];
    operations: any[];
    dashboard: any;
}

export interface GsdOption {
    gsd_analysis_id: number;
    operation_code: string;
    operation_name: string;

    skill_grade_id: number | null;
    skill_level: number | null;
    salary_coefficient: number;

    machine_equipment_id: number | null;
    machine_code: string | null;
    machine_name: string | null;
    code_mmtb?: string | null;
    total_tmu?: number | null;

    sam_gsd: number;
    total_action_seconds: number;
    total_actions: number;
}

export interface OperationClusterOperationPayload {
    line_no: number;
    line_balance_no?: number | null;

    gsd_analysis_id?: number | null;
    operation_code?: string | null;
    operation_name: string;

    skill_grade_id?: number | null;
    skill_level?: number | null;

    machine_equipment_id?: number | null;
    machine_name?: string | null;
    machine_code?: string | null;
    code_mmtb?: string | null;

    sam_gsd: number;
    salary_coefficient?: number;
    manpower?: number | null;
    required_efficiency?: number | string | null;

    // Các giá trị có thể trả về từ detail API khi Edit/Copy.
    standard_price?: number;
    adjusted_sam?: number;
    utilization_rate?: number | null;

    total_action_seconds?: number;
    total_actions?: number;
    status_id?: number;
}

export interface OperationClusterGroupPayload {
    line_no: number;
    cluster_name: string;
    operations: OperationClusterOperationPayload[];
}

export interface CreateOperationClusterPayload {
    document_code: string;
    work_id: number;
    product_category_id: number;
    product_category_group_id: number;
    required_efficiency?: number | null;
    price_method: OperationClusterPriceMethod;
    note?: string | null;
    status_id: number;
    groups: OperationClusterGroupPayload[];
}

export interface GsdActionDetail {
    id: number;
    analysis_id: number;
    line_no: number;
    step_no: number | null;
    gsd_code_id: number | null;
    gsd_code: string | null;
    action_name: string;
    tmu: number;
    frequency: number;
    seconds: number;
    note?: string | null;
    is_selected?: boolean;
}

export interface OperationActionPopupState {
    operationName: string;
    operationCode?: string | null;
    gsdAnalysisId: number;
}

export type GroupContextMenuState = {
    x: number;
    y: number;
    groupIndex: number;
} | null;

export type CoefficientPopupState = {
    x: number;
    y: number;
    groupIndex: number;
    operationIndex: number;
} | null;

export interface EnrichedOperationClusterOperation
    extends OperationClusterOperationPayload {
    required_efficiency_preview?: number;
    adjusted_sam_preview?: number;
    utilization_rate_preview?: number;
    standard_price_preview?: number;
}

export interface EnrichedOperationClusterGroup
    extends Omit<OperationClusterGroupPayload, 'operations'> {
    operations: EnrichedOperationClusterOperation[];
    tgcn: number;
}

export interface OperationClusterOperationView
    extends EnrichedOperationClusterOperation {
    cluster_name?: string;
    group_line_no_preview?: number;
}

export interface OperationClusterDashboardData {
    totalSamGsd: number;
    totalAdjustedSam: number;
    totalActions: number;
    totalActionSeconds: number;
    totalManpower: number;
    avgTgcn: number;
}