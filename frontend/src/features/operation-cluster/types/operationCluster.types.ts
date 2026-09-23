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

    /*
     * updated_at của chứng từ tại thời điểm tải lên form sửa.
     * Gửi lại khi Lưu (expected_updated_at) để backend phát hiện
     * có người khác đã lưu chứng từ này trước mình chưa.
     * null với chứng từ mới tạo / chưa từng lưu.
     */
    updated_at: string | null;
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

    /**
     * Mã phân tích GSD.
     * Một số API trả analysis_no,
     * một số chỗ dùng operation_code làm mã công đoạn.
     */
    analysisNo?: string | null;
    analysis_no?: string | null;

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

    customer_name?: string | null;
    product_name?: string | null;
    fabric_group_name?: string | null;
}

export interface OperationClusterOperationPayload {
    id?: number | string | null;

    source_operation_id?: number | string | null;

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

    standard_price?: number;
    adjusted_sam?: number;
    utilization_rate?: number | null;

    total_action_seconds?: number;
    total_actions?: number;
    status_id?: number;

    /*
     * updated_at của công đoạn này tại thời điểm client tải lên.
     * Chỉ có ý nghĩa với công đoạn đã có id thật trong DB. Backend so
     * với updated_at hiện tại; khác nhau (người khác vừa cập nhật
     * công đoạn này, ví dụ vừa "Đồng bộ") thì bỏ qua, giữ bản mới hơn
     * trong DB, không ghi đè bằng giá trị cũ của client này.
     */
    expected_updated_at?: string | null;
}

export interface OperationClusterGroupPayload {
    id?: number | string | null;
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

    /*
     * Id công đoạn / cụm người dùng đã cố ý xóa trên màn hình.
     * Backend chỉ xóa những id này; dòng không có trong payload
     * nhưng còn trong DB (do người khác thêm) sẽ được giữ lại.
     */
    deleted_operation_ids?: number[];
    deleted_group_ids?: number[];

    /*
     * Id các công đoạn ĐÃ CÓ trong chứng từ mà người dùng vừa bấm
     * "Đồng bộ" (lấy lại dữ liệu theo GSD mới nhất). Backend sẽ xóa
     * và tạo lại snapshot operation_cluster_operation_actions cho
     * đúng các id này.
     */
    resync_actions_operation_ids?: number[];

    /*
     * Chống ghi đè mất dữ liệu khi 2 người cùng sửa 1 chứng từ:
     * updated_at của chứng từ tại thời điểm client tải lên. Backend so
     * với updated_at hiện tại trong DB; khác nhau (đã có người lưu
     * trước) thì từ chối, không cho ghi đè âm thầm.
     * Không gửi (create/copy, hoặc client cũ) thì backend bỏ qua check.
     */
    expected_updated_at?: string | null;
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