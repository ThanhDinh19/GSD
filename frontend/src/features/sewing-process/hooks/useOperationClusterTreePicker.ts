import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    operationClusterService,
} from '../../operation-cluster/services/operationCluster.service';

import type {
    OperationClusterDetail,
    OperationClusterHeader,
} from '../../operation-cluster/types/operationCluster.types';

import type {
    SewingProcessLine,
} from '../types/sewingProcess.types';

import type {
    OperationClusterPickerDocument,
    OperationClusterPickerOperation,
    SelectedOperationClusterItem,
} from '../types/operationClusterTreePicker.types';

import {
    buildDisplayTree,
    buildTreeFromDetails,
    filterTree,
    findClusterByKey,
    findDisplayBucketByDocument,
    findFirstCluster,
    getDisplayGroupKey,
    getNodeKey,
} from '../utils/operationClusterTreePicker.utils';


async function loadDetailsInBatches(
    headers:
        OperationClusterHeader[],
    batchSize = 8
) {
    const details:
        OperationClusterDetail[] =
        [];

    const failedIds:
        number[] =
        [];


    for (
        let index = 0;
        index < headers.length;
        index += batchSize
    ) {
        const batch =
            headers.slice(
                index,
                index + batchSize
            );


        const results =
            await Promise.allSettled(
                batch.map(
                    (header) =>
                        operationClusterService
                            .getById(
                                header.id
                            )
                )
            );


        results.forEach(
            (
                result,
                resultIndex
            ) => {
                if (
                    result.status ===
                    'fulfilled'
                ) {
                    details.push(
                        result.value
                    );

                    return;
                }


                failedIds.push(
                    batch[
                        resultIndex
                    ].id
                );
            }
        );
    }


    return {
        details,
        failedIds,
    };
}


function mapSelectedItemToLine(
    item:
        SelectedOperationClusterItem,
    index:
        number
): SewingProcessLine {
    const {
        operation,
        document,
        cluster,
    } = item;


    return {
        sourceDocumentCode:
            document.documentCode,

        sourceLineId:
            typeof operation.id ===
                'number'
                ? operation.id
                : null,

        gsdAnalysisId:
            operation.gsdAnalysisId ??
            null,

        lineNo:
            index + 1,

        lineOrder:
            index + 1,

        clusterNo:
            cluster.lineNo,

        clusterName:
            cluster.name,

        operationCode:
            operation.code ||
            '',

        operationName:
            operation.name ||
            '',

        skillGradeId:
            operation.skillGradeId ??
            null,

        skillGradeLevel:
            operation.skillLevel !==
                '-'
                ? Number(
                    operation.skillLevel
                )
                : null,

        machineId:
            operation.machineId ??
            null,

        machineCode:
            operation.codeMmtb !==
                '-'
                ? operation.codeMmtb
                : (
                    operation.machineCode ??
                    ''
                ),

        machineName:
            operation.machineName !==
                '-'
                ? operation.machineName
                : '',

        samGsd:
            Number(
                operation.samGsd ??
                0
            ),

        salaryCoefficient:
            Number(
                operation.salaryCoefficient ??
                0
            ),

        laborCount:
            Number(
                operation.manpower ??
                0
            ),

        requiredEfficiency:
            operation.requiredEfficiency ??
            cluster.requiredEfficiency ??
            document.requiredEfficiency ??
            null,

        adjustedSam:
            Number(
                operation.adjustedSam ??
                0
            ),

        totalActions:
            Number(
                operation.totalActions ??
                0
            ),

        imageFileName:
            operation.imageFileName ||
            null,

        imageUrl:
            operation.imageUrl ||
            null,

        note:
            operation.note ??
            null,
    };
}


export function useOperationClusterTreePicker() {
    const [
        treeData,
        setTreeData,
    ] = useState<
        OperationClusterPickerDocument[]
    >([]);


    const [
        loading,
        setLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState('');


    const [
        warning,
        setWarning,
    ] = useState('');


    const [
        keyword,
        setKeyword,
    ] = useState('');


    const [
        showInactive,
        setShowInactive,
    ] = useState(false);


    const [
        selectedClusterKey,
        setSelectedClusterKey,
    ] = useState<
        string | null
    >(null);


    const [
        expanded,
        setExpanded,
    ] = useState<
        Set<string>
    >(
        () =>
            new Set([
                getNodeKey(
                    'root',
                    0
                ),
            ])
    );


    const [
        selectedOperations,
        setSelectedOperations,
    ] = useState<
        Record<
            string,
            SelectedOperationClusterItem
        >
    >({});


    const normalizedKeyword =
        keyword
            .trim()
            .toLowerCase();


    const visibleTree =
        useMemo(
            () =>
                filterTree(
                    treeData,
                    normalizedKeyword,
                    showInactive
                ),
            [
                treeData,
                normalizedKeyword,
                showInactive,
            ]
        );


    const displayTree =
        useMemo(
            () =>
                buildDisplayTree(
                    visibleTree
                ),
            [
                visibleTree,
            ]
        );


    const selectedContext =
        useMemo(
            () =>
                findClusterByKey(
                    treeData,
                    selectedClusterKey
                ),
            [
                treeData,
                selectedClusterKey,
            ]
        );


    const cluster =
        selectedContext
            ?.cluster ??
        null;


    const selectedItems =
        useMemo(
            () =>
                Object.values(
                    selectedOperations
                ),
            [
                selectedOperations,
            ]
        );


    const selectedCount =
        selectedItems.length;


    const selectedKeys =
        useMemo(
            () =>
                new Set(
                    Object.keys(
                        selectedOperations
                    )
                ),
            [
                selectedOperations,
            ]
        );


    const currentClusterOperations =
        cluster?.operations ??
        [];


    const selectableCurrentOperations =
        currentClusterOperations.filter(
            (operation) =>
                Boolean(
                    operation.name?.trim()
                )
        );


    const allCurrentClusterChecked =
        selectableCurrentOperations.length >
            0 &&
        selectableCurrentOperations.every(
            (operation) =>
                selectedKeys.has(
                    operation.key
                )
        );


    const loadTree =
        async () => {
            setLoading(
                true
            );

            setError(
                ''
            );

            setWarning(
                ''
            );


            try {
                const headers =
                    await operationClusterService
                        .getAll();


                const {
                    details,
                    failedIds,
                } =
                    await loadDetailsInBatches(
                        headers
                    );


                const nextTree =
                    buildTreeFromDetails(
                        details
                    );


                setTreeData(
                    nextTree
                );


                if (
                    failedIds.length >
                    0
                ) {
                    setWarning(
                        `Có ${failedIds.length} chứng từ không tải được chi tiết.`
                    );
                }


                const nextVisibleTree =
                    filterTree(
                        nextTree,
                        '',
                        false
                    );


                const nextDisplayTree =
                    buildDisplayTree(
                        nextVisibleTree
                    );


                const firstContext =
                    findFirstCluster(
                        nextVisibleTree,
                        false
                    );


                if (!firstContext) {
                    setSelectedClusterKey(
                        null
                    );

                    setExpanded(
                        new Set([
                            getNodeKey(
                                'root',
                                0
                            ),
                        ])
                    );

                    return;
                }


                setSelectedClusterKey(
                    firstContext
                        .cluster
                        .key
                );


                const firstBucket =
                    findDisplayBucketByDocument(
                        nextDisplayTree,
                        firstContext
                            .document
                            .id
                    );


                const nextExpanded =
                    new Set<string>([
                        getNodeKey(
                            'root',
                            0
                        ),
                    ]);


                if (firstBucket) {
                    nextExpanded.add(
                        firstBucket.key
                    );

                    nextExpanded.add(
                        getDisplayGroupKey(
                            firstBucket.key,
                            firstContext.document
                        )
                    );
                }


                setExpanded(
                    nextExpanded
                );
            } catch (
                loadError
            ) {
                console.error(
                    'Load Operation Cluster picker lỗi:',
                    loadError
                );


                setTreeData(
                    []
                );

                setSelectedClusterKey(
                    null
                );


                setError(
                    loadError instanceof
                        Error
                        ? loadError.message
                        : 'Không tải được cây cụm công đoạn.'
                );
            } finally {
                setLoading(
                    false
                );
            }
        };


    const reset =
        () => {
            setKeyword(
                ''
            );

            setShowInactive(
                false
            );

            setSelectedOperations(
                {}
            );
        };


    const open =
        async () => {
            reset();

            await loadTree();
        };


    const toggleNode = (
        key:
            string
    ) => {
        setExpanded(
            (current) => {
                const next =
                    new Set(
                        current
                    );


                if (
                    next.has(
                        key
                    )
                ) {
                    next.delete(
                        key
                    );
                } else {
                    next.add(
                        key
                    );
                }


                return next;
            }
        );
    };


    const selectCluster = (
        document:
            OperationClusterPickerDocument,
        clusterKey:
            string
    ) => {
        setSelectedClusterKey(
            clusterKey
        );


        const displayBucket =
            findDisplayBucketByDocument(
                displayTree,
                document.id
            );


        setExpanded(
            (current) => {
                const next =
                    new Set(
                        current
                    );


                next.add(
                    getNodeKey(
                        'root',
                        0
                    )
                );


                if (
                    displayBucket
                ) {
                    next.add(
                        displayBucket.key
                    );

                    next.add(
                        getDisplayGroupKey(
                            displayBucket.key,
                            document
                        )
                    );
                }


                return next;
            }
        );
    };


    const toggleOperation = (
        operation:
            OperationClusterPickerOperation
    ) => {
        if (
            !selectedContext
        ) {
            return;
        }


        setSelectedOperations(
            (current) => {
                const next = {
                    ...current,
                };


                if (
                    next[
                        operation.key
                    ]
                ) {
                    delete next[
                        operation.key
                    ];

                    return next;
                }


                next[
                    operation.key
                ] = {
                    operation,

                    document:
                        selectedContext.document,

                    cluster:
                        selectedContext.cluster,
                };


                return next;
            }
        );
    };


    const toggleCurrentCluster =
        (
            checked:
                boolean
        ) => {
            if (
                !selectedContext
            ) {
                return;
            }


            setSelectedOperations(
                (current) => {
                    const next = {
                        ...current,
                    };


                    selectableCurrentOperations.forEach(
                        (
                            operation
                        ) => {
                            if (
                                checked
                            ) {
                                next[
                                    operation.key
                                ] = {
                                    operation,

                                    document:
                                        selectedContext.document,

                                    cluster:
                                        selectedContext.cluster,
                                };
                            } else {
                                delete next[
                                    operation.key
                                ];
                            }
                        }
                    );


                    return next;
                }
            );
        };


    const removeSelectedOperation = (
        operationKey:
            string
    ) => {
        setSelectedOperations(
            (current) => {
                const next = {
                    ...current,
                };

                delete next[
                    operationKey
                ];

                return next;
            }
        );
    };


    const clearSelection =
        () => {
            setSelectedOperations(
                {}
            );
        };


    const buildSelectedLines =
        (): SewingProcessLine[] => {
            return selectedItems.map(
                (
                    item,
                    index
                ) =>
                    mapSelectedItemToLine(
                        item,
                        index
                    )
            );
        };


    useEffect(
        () => {
            if (
                selectedClusterKey &&
                !findClusterByKey(
                    visibleTree,
                    selectedClusterKey
                )
            ) {
                const first =
                    findFirstCluster(
                        visibleTree,
                        showInactive
                    );

                setSelectedClusterKey(
                    first?.cluster
                        .key ??
                    null
                );
            }
        },
        [
            visibleTree,
            selectedClusterKey,
            showInactive,
        ]
    );


    return {
        treeData,

        visibleTree,
        displayTree,

        loading,
        error,
        warning,

        keyword,
        showInactive,

        expanded,

        selectedClusterKey,
        selectedContext,
        cluster,

        selectedOperations,
        selectedItems,
        selectedKeys,
        selectedCount,

        currentClusterOperations,
        allCurrentClusterChecked,

        setKeyword,
        setShowInactive,

        loadTree,
        open,
        reset,

        toggleNode,
        selectCluster,

        toggleOperation,
        toggleCurrentCluster,

        removeSelectedOperation,
        clearSelection,

        buildSelectedLines,
    };
}