import type {
    OperationClusterGroupPayload,
} from '../../../types';

import {
    toNumber,
} from '../utils/operationCluster.utils';

/**
 * Kiểu phương pháp tính đơn giá.
 */
export type OperationClusterPriceMethod =
    | 'GSD'
    | 'ADJUSTED';

/**
 * Tính SMV điều chỉnh.
 *
 * Công thức:
 *
 * adjusted SAM = SAM GSD / HS yêu cầu
 *
 * Ví dụ:
 * SAM GSD = 0.8
 * HS YC = 0.8
 *
 * => 1.0
 */
export function calcAdjustedSam(
    samGsd: number,
    requiredEfficiency: number
): number {
    if (
        !requiredEfficiency ||
        requiredEfficiency <= 0
    ) {
        return samGsd;
    }

    return (
        samGsd /
        requiredEfficiency
    );
}

/**
 * Tính đơn giá chuẩn.
 *
 * Nếu phương pháp = GSD:
 *
 * SAM GSD × hệ số lương
 *
 * Nếu phương pháp = ADJUSTED:
 *
 * SAM điều chỉnh × hệ số lương
 */
export function calcStandardPrice(
    samGsd: number,
    adjustedSam: number,
    salaryCoefficient: number,
    priceMethod:
        OperationClusterPriceMethod
): number {
    return (
        priceMethod ===
        'ADJUSTED'
            ? adjustedSam *
              salaryCoefficient
            : samGsd *
              salaryCoefficient
    );
}

/**
 * Tạo dữ liệu groups dùng cho màn hình preview.
 *
 * Không sửa trực tiếp groups gốc.
 *
 * Mỗi operation được bổ sung:
 *
 * required_efficiency_preview
 * adjusted_sam_preview
 * utilization_rate_preview
 * standard_price_preview
 *
 * Mỗi group được bổ sung:
 *
 * tgcn
 */
export function buildEnrichedGroups(
    groups:
        OperationClusterGroupPayload[],

    requiredEfficiency:
        number,

    priceMethod:
        OperationClusterPriceMethod
) {
    return groups.map(
        (group) => {
            const operations =
                group.operations.map(
                    (operation) => {
                        const samGsd =
                            toNumber(
                                operation
                                    .sam_gsd,
                                0
                            );

                        const salaryCoefficient =
                            toNumber(
                                operation
                                    .salary_coefficient,
                                0
                            );

                        /**
                         * Nếu công đoạn có HS yêu cầu riêng
                         * thì dùng HS riêng.
                         *
                         * Nếu chưa nhập
                         * thì dùng HS yêu cầu trên header.
                         */
                        const rawEfficiency =
                            operation
                                .required_efficiency !==
                                null &&
                            operation
                                .required_efficiency !==
                                undefined &&
                            String(
                                operation
                                    .required_efficiency
                            ).trim() !==
                                '' &&
                            String(
                                operation
                                    .required_efficiency
                            ).trim() !==
                                '.'
                                ? operation
                                      .required_efficiency
                                : requiredEfficiency;

                        const operationEfficiency =
                            toNumber(
                                rawEfficiency,
                                requiredEfficiency
                            );

                        const adjustedSam =
                            calcAdjustedSam(
                                samGsd,
                                operationEfficiency
                            );

                        /**
                         * Logic này giữ nguyên theo code cũ.
                         *
                         * Ví dụ:
                         *
                         * SAM GSD = 0.8
                         * SAM ĐC = 1
                         *
                         * utilizationRate =
                         * 1 / 0.8
                         * = 1.25
                         * = 125%
                         */
                        const utilizationRate =
                            samGsd > 0
                                ? adjustedSam /
                                  samGsd
                                : 0;

                        const standardPrice =
                            calcStandardPrice(
                                samGsd,
                                adjustedSam,
                                salaryCoefficient,
                                priceMethod
                            );

                        return {
                            ...operation,

                            required_efficiency_preview:
                                operationEfficiency,

                            adjusted_sam_preview:
                                adjustedSam,

                            utilization_rate_preview:
                                utilizationRate,

                            standard_price_preview:
                                standardPrice,
                        };
                    }
                );

            /**
             * TGCN của cụm.
             *
             * Hiện tại giữ nguyên logic code cũ:
             * tổng SAM điều chỉnh của các công đoạn.
             */
            const tgcn =
                operations.reduce(
                    (
                        total,
                        operation
                    ) =>
                        total +
                        toNumber(
                            operation
                                .adjusted_sam_preview,
                            0
                        ),
                    0
                );

            return {
                ...group,

                operations,

                tgcn,
            };
        }
    );
}

/**
 * Type được suy ra trực tiếp từ
 * buildEnrichedGroups().
 */
export type EnrichedOperationClusterGroups =
    ReturnType<
        typeof buildEnrichedGroups
    >;

export type EnrichedOperationClusterGroup =
    EnrichedOperationClusterGroups[number];

export type EnrichedOperationClusterOperation =
    EnrichedOperationClusterGroup[
        'operations'
    ][number];

/**
 * Build danh sách công đoạn
 * cần hiển thị trên bảng bên phải.
 *
 * Nếu viewAllGroups = false:
 * chỉ hiện công đoạn của cụm đang chọn.
 *
 * Nếu viewAllGroups = true:
 * gộp công đoạn của tất cả cụm.
 */
export function buildVisibleOperations(
    enrichedGroups:
        EnrichedOperationClusterGroups,

    viewAllGroups:
        boolean,

    activeGroupIndex:
        number
) {
    if (
        viewAllGroups
    ) {
        return enrichedGroups.flatMap(
            (group) =>
                group.operations.map(
                    (operation) => ({
                        ...operation,

                        cluster_name:
                            group
                                .cluster_name,

                        group_line_no_preview:
                            group.line_no,
                    })
                )
        );
    }

    const activeGroup =
        enrichedGroups[
            activeGroupIndex
        ];

    if (!activeGroup) {
        return [];
    }

    return activeGroup.operations.map(
        (operation) => ({
            ...operation,

            cluster_name:
                activeGroup
                    .cluster_name,

            group_line_no_preview:
                activeGroup
                    .line_no,
        })
    );
}

/**
 * Tính Dashboard của màn hình
 * khai báo kho cụm.
 */
export function buildOperationClusterDashboard(
    enrichedGroups:
        EnrichedOperationClusterGroups
) {
    const allOperations =
        enrichedGroups.flatMap(
            (group) =>
                group.operations
        );

    /**
     * Tổng SMV GSD.
     */
    const totalSamGsd =
        allOperations.reduce(
            (
                total,
                operation
            ) =>
                total +
                toNumber(
                    operation
                        .sam_gsd,
                    0
                ),
            0
        );

    /**
     * Tổng SMV điều chỉnh.
     */
    const totalAdjustedSam =
        allOperations.reduce(
            (
                total,
                operation
            ) =>
                total +
                toNumber(
                    operation
                        .adjusted_sam_preview,
                    0
                ),
            0
        );

    /**
     * Tổng số bước GSD.
     */
    const totalActions =
        allOperations.reduce(
            (
                total,
                operation
            ) =>
                total +
                toNumber(
                    operation
                        .total_actions,
                    0
                ),
            0
        );

    /**
     * Tổng giây GSD.
     */
    const totalActionSeconds =
        allOperations.reduce(
            (
                total,
                operation
            ) =>
                total +
                toNumber(
                    operation
                        .total_action_seconds,
                    0
                ),
            0
        );

    /**
     * Tổng định mức lao động.
     */
    const totalManpower =
        allOperations.reduce(
            (
                total,
                operation
            ) =>
                total +
                toNumber(
                    operation
                        .manpower,
                    0
                ),
            0
        );

    /**
     * Chỉ tính trung bình trên
     * những cụm có công đoạn.
     */
    const activeGroups =
        enrichedGroups.filter(
            (group) =>
                group.operations
                    .length > 0
        );

    /**
     * Trung bình TGCN / cụm.
     */
    const avgTgcn =
        activeGroups.length >
        0
            ? activeGroups.reduce(
                  (
                      total,
                      group
                  ) =>
                      total +
                      toNumber(
                          group.tgcn,
                          0
                      ),
                  0
              ) /
              activeGroups.length
            : 0;

    return {
        totalSamGsd,

        totalAdjustedSam,

        totalActions,

        totalActionSeconds,

        totalManpower,

        avgTgcn,
    };
}