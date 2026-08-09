import type {
    OperationClusterDetail,
    OperationClusterGroupPayload,
} from '../../../types';

import type {
    OperationClusterFormState,
} from './operationCluster.constants';

/**
 * Kết quả sau khi convert dữ liệu detail
 * từ API sang dữ liệu editor.
 */
export type OperationClusterEditorData = {
    form: OperationClusterFormState;

    groups:
        OperationClusterGroupPayload[];
};

/**
 * Convert dữ liệu chứng từ đã lưu
 * sang dữ liệu dùng cho form Edit / Copy.
 *
 * API:
 * detail.header
 * detail.groups
 * detail.operations
 *
 * =>
 *
 * {
 *     form,
 *     groups
 * }
 */
export function mapOperationClusterDetailToEditor(
    detail: OperationClusterDetail
): OperationClusterEditorData {
    const header =
        detail.header;

    /**
     * -------------------------------------------------
     * HEADER
     * -------------------------------------------------
     */
    const form:
        OperationClusterFormState = {
        document_code:
            header.document_code ||
            '',

        work_id:
            header.work_id
                ? String(
                      header.work_id
                  )
                : '',

        product_category_id:
            header.product_category_id
                ? String(
                      header.product_category_id
                  )
                : '',

        product_category_group_id:
            header.product_category_group_id
                ? String(
                      header
                          .product_category_group_id
                  )
                : '',

        required_efficiency:
            header.required_efficiency !==
                null &&
            header.required_efficiency !==
                undefined
                ? String(
                      header
                          .required_efficiency
                  )
                : '0.8',

        price_method:
            header.price_method ===
            'ADJUSTED'
                ? 'ADJUSTED'
                : 'GSD',

        status_id:
            Number(
                header.status_id ??
                    0
            ),

        note:
            header.note || '',
    };

    /**
     * -------------------------------------------------
     * GROUPS + OPERATIONS
     * -------------------------------------------------
     */

    const detailGroups =
        Array.isArray(
            detail.groups
        )
            ? detail.groups
            : [];

    const detailOperations =
        Array.isArray(
            detail.operations
        )
            ? detail.operations
            : [];

    const groups:
        OperationClusterGroupPayload[] =
        detailGroups.map(
            (
                group: any,
                groupIndex: number
            ) => {
                /**
                 * Lấy các operation
                 * thuộc group hiện tại.
                 */
                const operations =
                    detailOperations

                        /**
                         * operation.group_id
                         * phải bằng group.id
                         */
                        .filter(
                            (
                                operation: any
                            ) =>
                                Number(
                                    operation
                                        .group_id
                                ) ===
                                Number(
                                    group.id
                                )
                        )

                        /**
                         * Sort lại theo line_no.
                         */
                        .sort(
                            (
                                a: any,
                                b: any
                            ) => {
                                const aLine =
                                    Number(
                                        a.line_no ||
                                            0
                                    );

                                const bLine =
                                    Number(
                                        b.line_no ||
                                            0
                                    );

                                return (
                                    aLine -
                                    bLine
                                );
                            }
                        )

                        /**
                         * Map dữ liệu DB/API
                         * về payload editor.
                         */
                        .map(
                            (
                                operation: any,
                                operationIndex: number
                            ) => {
                                return {
                                    /**
                                     * Luôn đánh lại
                                     * line_no từ 1.
                                     */
                                    line_no:
                                        operationIndex +
                                        1,

                                    line_balance_no:
                                        operation
                                            .line_balance_no ??
                                        null,

                                    /**
                                     * GSD
                                     */
                                    gsd_analysis_id:
                                        operation
                                            .gsd_analysis_id ??
                                        null,

                                    operation_code:
                                        operation
                                            .operation_code ||
                                        operation
                                            .analysis_no ||
                                        null,

                                    operation_name:
                                        operation
                                            .operation_name ||
                                        operation
                                            .gsd_operation_name ||
                                        '',

                                    /**
                                     * Bậc tay nghề
                                     */
                                    skill_grade_id:
                                        operation
                                            .skill_grade_id ??
                                        null,

                                    skill_level:
                                        operation
                                            .skill_level ??
                                        operation
                                            .skill_level_master ??
                                        null,

                                    /**
                                     * Máy / MMTB
                                     */
                                    machine_equipment_id:
                                        operation
                                            .machine_equipment_id ??
                                        null,

                                    machine_name:
                                        operation
                                            .machine_name ||
                                        operation
                                            .machine_name_master ||
                                        null,

                                    machine_code:
                                        operation
                                            .machine_code ||
                                        operation
                                            .machine_code_master ||
                                        null,

                                    code_mmtb:
                                        operation
                                            .code_mmtb ??
                                        operation
                                            .codeMMTB ??
                                        operation
                                            .code_mmtb_master ??
                                        null,

                                    /**
                                     * SMV gốc GSD
                                     */
                                    sam_gsd:
                                        Number(
                                            operation
                                                .sam_gsd ||
                                                0
                                        ),

                                    /**
                                     * Hệ số lương
                                     */
                                    salary_coefficient:
                                        Number(
                                            operation
                                                .salary_coefficient ||
                                                0
                                        ),

                                    /**
                                     * Nhân sự
                                     */
                                    manpower:
                                        operation
                                            .manpower !==
                                            null &&
                                        operation
                                            .manpower !==
                                            undefined
                                            ? Number(
                                                  operation
                                                      .manpower
                                              )
                                            : 1,

                                    /**
                                     * Giá trị DB cũ.
                                     *
                                     * Phần preview sau đó
                                     * vẫn được buildEnrichedGroups
                                     * tính realtime lại.
                                     */
                                    standard_price:
                                        Number(
                                            operation
                                                .standard_price ||
                                                0
                                        ),

                                    /**
                                     * HS yêu cầu riêng
                                     * từng công đoạn.
                                     *
                                     * Giữ string để input
                                     * có thể nhập:
                                     *
                                     * 0.
                                     * 0.8
                                     * 0.75
                                     */
                                    required_efficiency:
                                        operation
                                            .required_efficiency !==
                                            null &&
                                        operation
                                            .required_efficiency !==
                                            undefined
                                            ? String(
                                                  operation
                                                      .required_efficiency
                                              )
                                            : null,

                                    adjusted_sam:
                                        Number(
                                            operation
                                                .adjusted_sam ||
                                                0
                                        ),

                                    utilization_rate:
                                        operation
                                            .utilization_rate !==
                                            null &&
                                        operation
                                            .utilization_rate !==
                                            undefined
                                            ? Number(
                                                  operation
                                                      .utilization_rate
                                              )
                                            : null,

                                    /**
                                     * Thông tin thao tác GSD
                                     */
                                    total_action_seconds:
                                        Number(
                                            operation
                                                .total_action_seconds ||
                                                0
                                        ),

                                    total_actions:
                                        Number(
                                            operation
                                                .total_actions ||
                                                0
                                        ),

                                    status_id:
                                        Number(
                                            operation
                                                .status_id ??
                                                0
                                        ),
                                };
                            }
                        );

                return {
                    line_no:
                        Number(
                            group.line_no
                        ) ||
                        groupIndex + 1,

                    cluster_name:
                        group.cluster_name ||
                        '',

                    operations,
                };
            }
        );

    return {
        form,
        groups,
    };
}