import type {
    OperationClusterDetail,
} from '../../operation-cluster/types/operationCluster.types';

import type {
    OperationClusterPickerBucket,
    OperationClusterPickerCluster,
    OperationClusterPickerContext,
    OperationClusterPickerDocument,
    OperationClusterPickerOperation,
} from '../types/operationClusterTreePicker.types';


export function toNumber(
    value: unknown,
    defaultValue = 0
): number {
    const numberValue =
        Number(value);

    return Number.isFinite(
        numberValue
    )
        ? numberValue
        : defaultValue;
}


export function getNodeKey(
    level: string,
    id: number | string
) {
    return `${level}:${id}`;
}


export function isInactiveStatus(
    statusName: unknown
) {
    const normalized =
        String(
            statusName ?? ''
        )
            .trim()
            .toLowerCase();

    return (
        normalized.includes(
            'ngừng'
        ) ||
        normalized.includes(
            'không áp dụng'
        ) ||
        normalized.includes(
            'inactive'
        ) ||
        normalized.includes(
            'disabled'
        )
    );
}


export function resolveStatusLabel(
    statusName: unknown,
    statusId: unknown,
    fallback = 'Đang áp dụng'
) {
    const name =
        String(
            statusName ?? ''
        ).trim();

    if (name) {
        return name;
    }

    if (
        statusId !== null &&
        statusId !== undefined &&
        String(statusId).trim() !==
            ''
    ) {
        return `Trạng thái ${statusId}`;
    }

    return fallback;
}


export function buildDisplayTree(
    documents:
        OperationClusterPickerDocument[]
): OperationClusterPickerBucket[] {
    const categoryMap =
        new Map<
            number,
            {
                category:
                    OperationClusterPickerDocument['category'];

                groups:
                    Map<
                        number,
                        OperationClusterPickerDocument[]
                    >;
            }
        >();


    documents.forEach(
        (document) => {
            let categoryEntry =
                categoryMap.get(
                    document.category.id
                );

            if (!categoryEntry) {
                categoryEntry = {
                    category:
                        document.category,

                    groups:
                        new Map(),
                };

                categoryMap.set(
                    document.category.id,
                    categoryEntry
                );
            }


            const groupDocuments =
                categoryEntry.groups.get(
                    document.group.id
                ) ?? [];

            groupDocuments.push(
                document
            );

            categoryEntry.groups.set(
                document.group.id,
                groupDocuments
            );
        }
    );


    const result:
        OperationClusterPickerBucket[] =
        [];


    categoryMap.forEach(
        ({
            category,
            groups,
        }) => {
            const groupDocumentLists =
                Array.from(
                    groups.values()
                ).sort(
                    (
                        a,
                        b
                    ) =>
                        (
                            a[0]
                                ?.group
                                .name ??
                            ''
                        ).localeCompare(
                            b[0]
                                ?.group
                                .name ??
                                '',
                            'vi'
                        )
                );


            const maxDocumentsPerGroup =
                groupDocumentLists.reduce(
                    (
                        max,
                        items
                    ) =>
                        Math.max(
                            max,
                            items.length
                        ),
                    0
                );


            for (
                let bucketIndex = 0;
                bucketIndex <
                maxDocumentsPerGroup;
                bucketIndex += 1
            ) {
                const bucketDocuments =
                    groupDocumentLists
                        .map(
                            (items) =>
                                items[
                                    bucketIndex
                                ]
                        )
                        .filter(
                            (
                                document
                            ):
                                document is OperationClusterPickerDocument =>
                                Boolean(
                                    document
                                )
                        );

                if (
                    bucketDocuments.length ===
                    0
                ) {
                    continue;
                }


                result.push({
                    key:
                        getNodeKey(
                            'category',
                            `${category.id}:${bucketIndex + 1}`
                        ),

                    category,

                    documents:
                        bucketDocuments,
                });
            }
        }
    );


    return result;
}


export function getDisplayGroupKey(
    categoryKey: string,
    document:
        OperationClusterPickerDocument
) {
    return getNodeKey(
        'group',
        `${categoryKey}:${document.id}:${document.group.id}`
    );
}


export function findDisplayBucketByDocument(
    displayTree:
        OperationClusterPickerBucket[],
    documentId: number
) {
    return (
        displayTree.find(
            (bucket) =>
                bucket.documents.some(
                    (document) =>
                        document.id ===
                        documentId
                )
        ) ?? null
    );
}


export function buildTreeFromDetails(
    details:
        OperationClusterDetail[]
): OperationClusterPickerDocument[] {
    return details
        .map(
            (
                detail
            ):
                OperationClusterPickerDocument |
                null => {
                const header =
                    detail?.header;

                if (!header) {
                    return null;
                }


                const categoryId =
                    Number(
                        header.product_category_id
                    );

                const categoryGroupId =
                    Number(
                        header.product_category_group_id
                    );


                if (
                    !categoryId ||
                    !categoryGroupId
                ) {
                    return null;
                }


                const headerStatusLabel =
                    resolveStatusLabel(
                        header.status_name,
                        header.status_id
                    );


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


                const clusters =
                    [...detailGroups]
                        .sort(
                            (
                                a: any,
                                b: any
                            ) => {
                                const lineCompare =
                                    toNumber(
                                        a.line_no,
                                        0
                                    ) -
                                    toNumber(
                                        b.line_no,
                                        0
                                    );

                                if (
                                    lineCompare !==
                                    0
                                ) {
                                    return lineCompare;
                                }

                                return (
                                    toNumber(
                                        a.id,
                                        0
                                    ) -
                                    toNumber(
                                        b.id,
                                        0
                                    )
                                );
                            }
                        )
                        .map(
                            (
                                rawGroup: any,
                                groupIndex: number
                            ):
                                OperationClusterPickerCluster => {
                                const rawGroupId =
                                    rawGroup?.id ??
                                    `${header.id}-${groupIndex + 1}`;

                                const clusterKey =
                                    `${header.id}:${rawGroupId}`;


                                const operations =
                                    detailOperations
                                        .filter(
                                            (
                                                operation: any
                                            ) =>
                                                String(
                                                    operation.group_id
                                                ) ===
                                                String(
                                                    rawGroup.id
                                                )
                                        )
                                        .sort(
                                            (
                                                a: any,
                                                b: any
                                            ) =>
                                                toNumber(
                                                    a.line_no,
                                                    0
                                                ) -
                                                toNumber(
                                                    b.line_no,
                                                    0
                                                )
                                        )
                                        .map(
                                            (
                                                operation: any,
                                                operationIndex: number
                                            ):
                                                OperationClusterPickerOperation => {
                                                const samGsd =
                                                    toNumber(
                                                        operation.sam_gsd,
                                                        0
                                                    );


                                                const operationEfficiency =
                                                    toNumber(
                                                        operation.required_efficiency,
                                                        toNumber(
                                                            header.required_efficiency,
                                                            0
                                                        )
                                                    );


                                                const adjustedSamFromApi =
                                                    operation.adjusted_sam !==
                                                        null &&
                                                    operation.adjusted_sam !==
                                                        undefined
                                                        ? toNumber(
                                                            operation.adjusted_sam,
                                                            0
                                                        )
                                                        : null;


                                                const adjustedSam =
                                                    adjustedSamFromApi !==
                                                        null
                                                        ? adjustedSamFromApi
                                                        : operationEfficiency >
                                                            0
                                                            ? samGsd /
                                                            operationEfficiency
                                                            : samGsd;


                                                const operationId =
                                                    operation.id ??
                                                    `${rawGroupId}-${operationIndex + 1}`;


                                                return {
                                                    key:
                                                        `${header.id}:${rawGroupId}:${operationId}`,

                                                    id:
                                                        operationId,

                                                    gsdAnalysisId:
                                                        operation.gsd_analysis_id ??
                                                        operation.gsdAnalysisId ??
                                                        null,

                                                    documentId:
                                                        header.id,

                                                    groupId:
                                                        rawGroupId,

                                                    code:
                                                        operation.operation_code ||
                                                        operation.analysis_no ||
                                                        '',

                                                    name:
                                                        operation.operation_name ||
                                                        operation.gsd_operation_name ||
                                                        '',

                                                    imageFileName:
                                                        operation.image_file_name ||
                                                        operation.imageFileName ||
                                                        '',

                                                    imageUrl:
                                                        operation.image_url ||
                                                        operation.imageUrl ||
                                                        '',

                                                    machineId:
                                                        operation.machine_equipment_id ??
                                                        operation.machineId ??
                                                        null,

                                                    machineCode:
                                                        operation.machine_code ??
                                                        operation.machine_code_master ??
                                                        operation.machineCode ??
                                                        null,

                                                    machineName:
                                                        operation.machine_name ||
                                                        operation.machine_name_master ||
                                                        '-',

                                                    codeMmtb:
                                                        operation.code_mmtb ||
                                                        operation.codeMMTB ||
                                                        '-',

                                                    skillGradeId:
                                                        operation.skill_grade_id ??
                                                        operation.skillGradeId ??
                                                        null,

                                                    skillLevel:
                                                        operation.skill_level !==
                                                            null &&
                                                        operation.skill_level !==
                                                            undefined
                                                            ? String(
                                                                operation.skill_level
                                                            )
                                                            : '-',

                                                    salaryCoefficient:
                                                        toNumber(
                                                            operation.salary_coefficient,
                                                            0
                                                        ),

                                                    samGsd,

                                                    adjustedSam,

                                                    requiredEfficiency:
                                                        operationEfficiency,

                                                    totalActions:
                                                        toNumber(
                                                            operation.total_actions,
                                                            0
                                                        ),

                                                    totalActionSeconds:
                                                        toNumber(
                                                            operation.total_action_seconds,
                                                            0
                                                        ),

                                                    manpower:
                                                        toNumber(
                                                            operation.manpower,
                                                            0
                                                        ),

                                                    statusLabel:
                                                        resolveStatusLabel(
                                                            operation.status_name,
                                                            operation.status_id,
                                                            headerStatusLabel
                                                        ),

                                                    note:
                                                        operation.note ??
                                                        null,

                                                    raw:
                                                        operation,
                                                };
                                            }
                                        );


                                return {
                                    key:
                                        clusterKey,

                                    id:
                                        rawGroupId,

                                    lineNo:
                                        toNumber(
                                            rawGroup.line_no,
                                            groupIndex + 1
                                        ),

                                    documentId:
                                        header.id,

                                    documentCode:
                                        header.document_code ||
                                        '',

                                    name:
                                        rawGroup.cluster_name ||
                                        `Cụm ${groupIndex + 1}`,

                                    note:
                                        rawGroup.note ||
                                        header.note ||
                                        '',

                                    statusLabel:
                                        headerStatusLabel,

                                    inactive:
                                        isInactiveStatus(
                                            header.status_name
                                        ),

                                    requiredEfficiency:
                                        toNumber(
                                            header.required_efficiency,
                                            0
                                        ),

                                    operations,
                                };
                            }
                        );


                return {
                    id:
                        header.id,

                    documentCode:
                        header.document_code ||
                        `CT-${header.id}`,

                    header,

                    note:
                        header.note ||
                        '',

                    statusLabel:
                        headerStatusLabel,

                    inactive:
                        isInactiveStatus(
                            header.status_name
                        ),

                    requiredEfficiency:
                        toNumber(
                            header.required_efficiency,
                            0
                        ),

                    category: {
                        id:
                            categoryId,

                        code:
                            header.product_code ||
                            '',

                        name:
                            header.product_name ||
                            `Chủng loại ${categoryId}`,
                    },

                    group: {
                        id:
                            categoryGroupId,

                        code:
                            header.category_group_code ||
                            '',

                        name:
                            header.category_group_name ||
                            `Nhóm ${categoryGroupId}`,
                    },

                    clusters,
                };
            }
        )
        .filter(
            (
                document
            ):
                document is OperationClusterPickerDocument =>
                Boolean(
                    document
                )
        )
        .sort(
            (
                a,
                b
            ) => {
                const categoryCompare =
                    a.category.name.localeCompare(
                        b.category.name,
                        'vi'
                    );

                if (
                    categoryCompare !==
                    0
                ) {
                    return categoryCompare;
                }


                const groupCompare =
                    a.group.name.localeCompare(
                        b.group.name,
                        'vi'
                    );

                if (
                    groupCompare !==
                    0
                ) {
                    return groupCompare;
                }


                return a.documentCode.localeCompare(
                    b.documentCode,
                    'vi'
                );
            }
        );
}


export function findFirstCluster(
    tree:
        OperationClusterPickerDocument[],
    includeInactive:
        boolean
): OperationClusterPickerContext | null {
    for (
        const document of tree
    ) {
        const cluster =
            document.clusters.find(
                (item) =>
                    includeInactive ||
                    !item.inactive
            );

        if (cluster) {
            return {
                document,

                category:
                    document.category,

                group:
                    document.group,

                cluster,
            };
        }
    }

    return null;
}


export function findClusterByKey(
    tree:
        OperationClusterPickerDocument[],
    clusterKey:
        string |
        null
): OperationClusterPickerContext | null {
    if (!clusterKey) {
        return null;
    }


    for (
        const document of tree
    ) {
        const cluster =
            document.clusters.find(
                (item) =>
                    item.key ===
                    clusterKey
            );

        if (cluster) {
            return {
                document,

                category:
                    document.category,

                group:
                    document.group,

                cluster,
            };
        }
    }


    return null;
}


export function filterTree(
    tree:
        OperationClusterPickerDocument[],
    keyword:
        string,
    showInactive:
        boolean
): OperationClusterPickerDocument[] {
    return tree
        .map(
            (document) => {
                if (
                    !showInactive &&
                    document.inactive
                ) {
                    return null;
                }


                const categoryMatched =
                    `${document.category.code} ${document.category.name}`
                        .toLowerCase()
                        .includes(
                            keyword
                        );


                const groupMatched =
                    `${document.group.code} ${document.group.name}`
                        .toLowerCase()
                        .includes(
                            keyword
                        );


                const documentMatched =
                    document.documentCode
                        .toLowerCase()
                        .includes(
                            keyword
                        );


                const visibleClusters =
                    document.clusters
                        .filter(
                            (cluster) =>
                                showInactive ||
                                !cluster.inactive
                        )
                        .filter(
                            (cluster) => {
                                if (
                                    !keyword ||
                                    categoryMatched ||
                                    groupMatched ||
                                    documentMatched
                                ) {
                                    return true;
                                }


                                return `${cluster.name} ${cluster.documentCode}`
                                    .toLowerCase()
                                    .includes(
                                        keyword
                                    );
                            }
                        );


                if (visibleClusters.length === 0) {
                    return null;
                }


                return {
                    ...document,

                    clusters:
                        visibleClusters,
                };
            }
        )
        .filter(
            (document):
                document is OperationClusterPickerDocument =>
                Boolean(document)
        );
}