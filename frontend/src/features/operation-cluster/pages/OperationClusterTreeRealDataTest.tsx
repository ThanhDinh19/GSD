import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  ReactNode,
} from 'react';

import {
  operationClusterService,
} from '../services/operationCluster.service';

import {
  getGsdAnalysisImageUrl,
} from '../../../services/sewingProcess.service';

import GsdPickerModal
  from '../components/GsdPickerModal';

import ImagePreviewModal
  from '../components/ImagePreviewModal';

import OperationActionDetailsModal
  from './OperationActionDetailsModal';

import type {
  CreateOperationClusterPayload,
  GsdActionDetail,
  GsdOption,
  OperationClusterDetail,
  OperationClusterHeader,
} from '../types/operationCluster.types';


import {
  Button
} from '../../../shared/components'

type TreeOperation = {
  key: string;
  id: number | string;
  gsdAnalysisId?: number | null;

  documentId: number;
  groupId: number | string;

  code: string;
  name: string;

  imageFileName: string;
  imageUrl: string;

  machineName: string;
  codeMmtb: string;

  skillLevel: string;
  samGsd: number;
  adjustedSam: number;
  totalActions: number;
  totalActionSeconds: number;
  manpower: number;
  statusLabel: string;

  raw: any;
};

type TreeCluster = {
  key: string;
  id: number | string;
  documentId: number;
  documentCode: string;
  name: string;
  note: string;
  statusLabel: string;
  inactive: boolean;
  requiredEfficiency: number;
  operations: TreeOperation[];
};

type ProductCategoryGroup = {
  id: number;
  code: string;
  name: string;
};

type ProductCategory = {
  id: number;
  code: string;
  name: string;
};

type OperationClusterDocumentTree = {
  id: number;
  documentCode: string;
  note: string;
  statusLabel: string;
  inactive: boolean;
  requiredEfficiency: number;

  header: OperationClusterHeader;

  category: ProductCategory;
  group: ProductCategoryGroup;
  clusters: TreeCluster[];
};

type SelectedContext = {
  document: OperationClusterDocumentTree;
  category: ProductCategory;
  group: ProductCategoryGroup;
  cluster: TreeCluster;
};

function toNumber(
  value: unknown,
  defaultValue = 0
): number {
  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : defaultValue;
}

function formatNumber(value: number) {
  return value.toFixed(2);
}

function getNodeKey(
  level: string,
  id: number | string
) {
  return `${level}:${id}`;
}

function isInactiveStatus(
  statusName: unknown
) {
  const normalized = String(
    statusName || ''
  )
    .trim()
    .toLowerCase();

  return (
    normalized.includes('ngừng') ||
    normalized.includes('không áp dụng') ||
    normalized.includes('inactive') ||
    normalized.includes('disabled')
  );
}

function resolveStatusLabel(
  statusName: unknown,
  statusId: unknown,
  fallback = 'Đang áp dụng'
) {
  const name = String(
    statusName || ''
  ).trim();

  if (name) {
    return name;
  }

  if (
    statusId !== null &&
    statusId !== undefined &&
    String(statusId).trim() !== ''
  ) {
    return `Trạng thái ${statusId}`;
  }

  return fallback;
}

function buildTreeFromDetails(
  details: OperationClusterDetail[]
): OperationClusterDocumentTree[] {
  return details
    .map(
      (
        detail
      ): OperationClusterDocumentTree | null => {
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
          detailGroups
            .map(
              (
                rawGroup: any,
                groupIndex: number
              ): TreeCluster => {
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
                      ): TreeOperation => {
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
                          adjustedSamFromApi !== null
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

                          machineName:
                            operation.machine_name ||
                            operation.machine_name_master ||
                            '-',

                          codeMmtb:
                            operation.code_mmtb ||
                            operation.codeMMTB ||
                            '-',

                          skillLevel:
                            operation.skill_level !==
                              null &&
                              operation.skill_level !==
                              undefined
                              ? String(
                                operation.skill_level
                              )
                              : '-',

                          samGsd,
                          adjustedSam,

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
            )
            .sort(
              (
                a,
                b
              ) =>
                a.name.localeCompare(
                  b.name,
                  'vi'
                )
            );

        return {
          id:
            header.id,

          documentCode:
            header.document_code ||
            `CT-${header.id}`,

          header:
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
      Boolean
    )
    .sort(
      (
        a,
        b
      ) => {
        const categoryCompare =
          a!.category.name.localeCompare(
            b!.category.name,
            'vi'
          );

        if (
          categoryCompare !==
          0
        ) {
          return categoryCompare;
        }

        const groupCompare =
          a!.group.name.localeCompare(
            b!.group.name,
            'vi'
          );

        if (
          groupCompare !==
          0
        ) {
          return groupCompare;
        }

        return a!.documentCode.localeCompare(
          b!.documentCode,
          'vi'
        );
      }
    ) as OperationClusterDocumentTree[];
}


function buildUpdatePayload(
  document:
    OperationClusterDocumentTree
): CreateOperationClusterPayload {
  const header =
    document.header;

  const groups =
    document.clusters
      .filter(
        (cluster) =>
          cluster.name.trim()
      )
      .map(
        (
          cluster,
          groupIndex
        ) => ({
          line_no:
            groupIndex + 1,

          cluster_name:
            cluster.name.trim(),

          operations:
            cluster.operations.map(
              (
                operation,
                operationIndex
              ) => {
                const raw =
                  operation.raw ||
                  {};

                const requiredEfficiency =
                  toNumber(
                    raw.required_efficiency,
                    document.requiredEfficiency
                  ) ||
                  null;

                const skillLevel =
                  raw.skill_level !==
                    null &&
                    raw.skill_level !==
                    undefined
                    ? toNumber(
                      raw.skill_level,
                      0
                    )
                    : operation.skillLevel !==
                      '-'
                      ? toNumber(
                        operation.skillLevel,
                        0
                      )
                      : null;

                return {
                  line_no:
                    operationIndex + 1,

                  line_balance_no:
                    raw.line_balance_no ??
                    null,

                  gsd_analysis_id:
                    operation.gsdAnalysisId ??
                    raw.gsd_analysis_id ??
                    null,

                  operation_code:
                    operation.code ||
                    null,

                  operation_name:
                    operation.name,

                  skill_grade_id:
                    raw.skill_grade_id ??
                    null,

                  skill_level:
                    skillLevel,

                  machine_equipment_id:
                    raw.machine_equipment_id ??
                    null,

                  machine_name:
                    operation.machineName ===
                      '-'
                      ? null
                      : operation.machineName,

                  machine_code:
                    raw.machine_code ??
                    raw.machine_code_master ??
                    null,

                  code_mmtb:
                    operation.codeMmtb ===
                      '-'
                      ? null
                      : operation.codeMmtb,

                  sam_gsd:
                    toNumber(
                      operation.samGsd,
                      0
                    ),

                  salary_coefficient:
                    toNumber(
                      raw.salary_coefficient,
                      0
                    ),

                  manpower:
                    toNumber(
                      operation.manpower,
                      1
                    ),

                  required_efficiency:
                    requiredEfficiency,

                  standard_price:
                    raw.standard_price !==
                      null &&
                      raw.standard_price !==
                      undefined
                      ? toNumber(
                        raw.standard_price,
                        0
                      )
                      : undefined,

                  adjusted_sam:
                    toNumber(
                      operation.adjustedSam,
                      0
                    ),

                  utilization_rate:
                    raw.utilization_rate !==
                      null &&
                      raw.utilization_rate !==
                      undefined
                      ? toNumber(
                        raw.utilization_rate,
                        0
                      )
                      : null,

                  total_action_seconds:
                    toNumber(
                      operation.totalActionSeconds,
                      0
                    ),

                  total_actions:
                    toNumber(
                      operation.totalActions,
                      0
                    ),

                  status_id:
                    raw.status_id ??
                    0,
                };
              }
            ),
        })
      );

  return {
    document_code:
      String(
        header.document_code ||
        document.documentCode ||
        ''
      ).trim(),

    work_id:
      Number(
        header.work_id
      ),

    product_category_id:
      Number(
        header.product_category_id
      ),

    product_category_group_id:
      Number(
        header.product_category_group_id
      ),

    required_efficiency:
      header.required_efficiency !==
        null &&
        header.required_efficiency !==
        undefined
        ? Number(
          header.required_efficiency
        )
        : null,

    price_method:
      header.price_method ===
        'ADJUSTED'
        ? 'ADJUSTED'
        : 'GSD',

    note:
      header.note ||
      null,

    status_id:
      Number(
        header.status_id ??
        0
      ),

    groups,
  };
}

async function loadDetailsInBatches(
  headers: OperationClusterHeader[],
  batchSize = 8
) {
  const details:
    OperationClusterDetail[] = [];

  const failedIds:
    number[] = [];

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
        } else {
          failedIds.push(
            batch[
              resultIndex
            ].id
          );
        }
      }
    );
  }

  return {
    details,
    failedIds,
  };
}

export default function OperationClusterTreeSaveOperationsWithCancelAndImage() {
  const [
    treeData,
    setTreeData,
  ] = useState<
    OperationClusterDocumentTree[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

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
    gsdOptions,
    setGsdOptions,
  ] = useState<
    GsdOption[]
  >([]);

  const [
    isGsdPopupOpen,
    setIsGsdPopupOpen,
  ] = useState(false);

  const [
    gsdSearch,
    setGsdSearch,
  ] = useState('');

  const [
    checkedGsdIds,
    setCheckedGsdIds,
  ] = useState<
    number[]
  >([]);

  const [
    gsdActionsMap,
    setGsdActionsMap,
  ] = useState<
    Record<
      number,
      GsdActionDetail[]
    >
  >({});

  const [
    loadingActionIds,
    setLoadingActionIds,
  ] = useState<
    number[]
  >([]);


  const [
    actionModalOpen,
    setActionModalOpen,
  ] = useState(false);

  const [
    actionModalTitle,
    setActionModalTitle,
  ] = useState('');

  const [
    actionRows,
    setActionRows,
  ] = useState<
    GsdActionDetail[]
  >([]);

  const [
    loadingActionRows,
    setLoadingActionRows,
  ] = useState(false);

  const [
    selectedClusterKey,
    setSelectedClusterKey,
  ] = useState<
    string | null
  >(null);

  const [
    selectedOperationKey,
    setSelectedOperationKey,
  ] = useState<
    string | null
  >(null);


  const [
    previewImageUrl,
    setPreviewImageUrl,
  ] = useState('');


  const [
    dirtyDocumentIds,
    setDirtyDocumentIds,
  ] = useState<
    Set<number>
  >(
    () =>
      new Set()
  );

  const [
    savingDocumentId,
    setSavingDocumentId,
  ] = useState<
    number | null
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

  const loadTree = async () => {
    setLoading(true);
    setError('');
    setWarning('');

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

      setDirtyDocumentIds(
        new Set()
      );

      if (
        failedIds.length >
        0
      ) {
        setWarning(
          `Có ${failedIds.length} chứng từ không tải được chi tiết.`
        );
      }

      const firstContext =
        findFirstCluster(
          nextTree,
          false
        );

      if (
        firstContext
      ) {
        setSelectedClusterKey(
          firstContext.cluster.key
        );

        setSelectedOperationKey(
          firstContext.cluster
            .operations[0]
            ?.key ||
          null
        );

        setExpanded(
          new Set([
            getNodeKey(
              'root',
              0
            ),

            getNodeKey(
              'category',
              `${firstContext.document.id}:${firstContext.category.id}`
            ),

            getNodeKey(
              'group',
              `${firstContext.document.id}:${firstContext.group.id}`
            ),
          ])
        );
      } else {
        setSelectedClusterKey(
          null
        );

        setSelectedOperationKey(
          null
        );
      }
    } catch (loadError) {
      console.error(
        'Load operation cluster tree lỗi:',
        loadError
      );

      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Không tải được dữ liệu cây cụm công đoạn.'
      );

      setTreeData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadGsdOptions =
    async () => {
      try {
        const data =
          await operationClusterService
            .getGsdOptions();

        setGsdOptions(
          data
        );
      } catch (
      loadError
      ) {
        console.error(
          'Load GSD options lỗi:',
          loadError
        );
      }
    };

  useEffect(() => {
    loadTree();
    loadGsdOptions();
  }, []);

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

  const dashboard =
    useMemo(() => {
      const operations =
        selectedContext
          ?.cluster
          .operations ||
        [];

      const totalAdjustedSam =
        operations.reduce(
          (
            total,
            operation
          ) =>
            total +
            operation.adjustedSam,
          0
        );

      const totalSam =
        operations.reduce(
          (
            total,
            operation
          ) =>
            total +
            operation.samGsd,
          0
        );

      const totalActions =
        operations.reduce(
          (
            total,
            operation
          ) =>
            total +
            operation.totalActions,
          0
        );

      const totalSeconds =
        operations.reduce(
          (
            total,
            operation
          ) =>
            total +
            operation.totalActionSeconds,
          0
        );

      const totalManpower =
        operations.reduce(
          (
            total,
            operation
          ) =>
            total +
            operation.manpower,
          0
        );

      // Theo calculation hiện tại của màn Operation Cluster:
      // TGCN của một cụm = tổng SMV điều chỉnh của các công đoạn.
      const tgcn =
        totalAdjustedSam;

      return {
        totalAdjustedSam,
        totalSam,
        totalActions,
        totalSeconds,
        totalManpower,
        tgcn,
      };
    }, [
      selectedContext,
    ]);

  const filteredGsdOptions =
    useMemo(() => {
      const search =
        gsdSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return gsdOptions;
      }

      return gsdOptions.filter(
        (item) =>
          [
            item.operation_code,
            item.operation_name,
            item.machine_name,
            item.machine_code,
            item.code_mmtb,
          ]
            .filter(Boolean)
            .some(
              (value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    search
                  )
            )
      );
    }, [
      gsdOptions,
      gsdSearch,
    ]);

  const checkedGsds =
    useMemo(
      () =>
        gsdOptions.filter(
          (item) =>
            checkedGsdIds.includes(
              item.gsd_analysis_id
            )
        ),
      [
        gsdOptions,
        checkedGsdIds,
      ]
    );

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

  const forcedOpen =
    normalizedKeyword.length >
    0;

  const toggleNode = (
    key: string
  ) => {
    setExpanded(
      (current) => {
        const next =
          new Set(
            current
          );

        if (
          next.has(key)
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
      OperationClusterDocumentTree,
    cluster:
      TreeCluster
  ) => {
    setSelectedClusterKey(
      cluster.key
    );

    setSelectedOperationKey(
      cluster.operations[0]
        ?.key ||
      null
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

        next.add(
          getNodeKey(
            'category',
            `${document.id}:${document.category.id}`
          )
        );

        next.add(
          getNodeKey(
            'group',
            `${document.id}:${document.group.id}`
          )
        );

        return next;
      }
    );
  };

  const cluster =
    selectedContext
      ?.cluster;


  const currentDocument =
    selectedContext
      ?.document ||
    null;

  const hasPendingChanges =
    currentDocument
      ? dirtyDocumentIds.has(
        currentDocument.id
      )
      : false;

  const isSavingCurrentDocument =
    currentDocument
      ? savingDocumentId ===
      currentDocument.id
      : false;

  const handleCancelPendingChanges =
    () => {
      if (
        !currentDocument
      ) {
        return;
      }

      const currentDocumentId =
        currentDocument.id;

      const currentClusterKey =
        selectedClusterKey;

      let nextSelectedOperationKey:
        string | null =
        null;

      setTreeData(
        (currentTree) =>
          currentTree.map(
            (document) => {
              if (
                document.id !==
                currentDocumentId
              ) {
                return document;
              }

              const nextClusters =
                document.clusters.map(
                  (currentCluster) => {
                    const nextOperations =
                      currentCluster.operations.filter(
                        (operation) =>
                          !String(
                            operation.key
                          ).startsWith(
                            'temp:'
                          )
                      );

                    if (
                      currentCluster.key ===
                      currentClusterKey
                    ) {
                      nextSelectedOperationKey =
                        nextOperations[0]
                          ?.key ||
                        null;
                    }

                    return {
                      ...currentCluster,
                      operations:
                        nextOperations,
                    };
                  }
                );

              return {
                ...document,
                clusters:
                  nextClusters,
              };
            }
          )
      );

      setSelectedOperationKey(
        nextSelectedOperationKey
      );

      setDirtyDocumentIds(
        (current) => {
          const next =
            new Set(
              current
            );

          next.delete(
            currentDocumentId
          );

          return next;
        }
      );
    };

  const handleSaveCurrentDocument =
    async () => {
      if (
        !currentDocument
      ) {
        alert(
          'Không xác định được chứng từ cần lưu.'
        );

        return;
      }

      const latestDocument =
        treeData.find(
          (item) =>
            item.id ===
            currentDocument.id
        );

      if (
        !latestDocument
      ) {
        alert(
          'Không tìm thấy dữ liệu chứng từ hiện tại.'
        );

        return;
      }

      const payload =
        buildUpdatePayload(
          latestDocument
        );

      if (
        !payload.groups.some(
          (group) =>
            group.operations.length >
            0
        )
      ) {
        alert(
          'Chứng từ phải có ít nhất một công đoạn.'
        );

        return;
      }

      setSavingDocumentId(
        latestDocument.id
      );

      try {
        const selectedClusterName =
          cluster?.name ||
          '';

        const selectedClusterIndex =
          latestDocument.clusters.findIndex(
            (item) =>
              item.key ===
              selectedClusterKey
          );

        await operationClusterService
          .update(
            latestDocument.id,
            payload
          );

        const refreshedDetail =
          await operationClusterService
            .getById(
              latestDocument.id
            );

        const refreshedDocument =
          buildTreeFromDetails(
            [
              refreshedDetail,
            ]
          )[0];

        if (
          refreshedDocument
        ) {
          setTreeData(
            (currentTree) =>
              currentTree.map(
                (item) =>
                  item.id ===
                    refreshedDocument.id
                    ? refreshedDocument
                    : item
              )
          );

          const refreshedCluster =
            (
              selectedClusterIndex >=
                0
                ? refreshedDocument
                  .clusters[
                selectedClusterIndex
                ]
                : null
            ) ||
            refreshedDocument.clusters.find(
              (item) =>
                item.name ===
                selectedClusterName
            ) ||
            refreshedDocument
              .clusters[0];

          setSelectedClusterKey(
            refreshedCluster
              ?.key ||
            null
          );

          setSelectedOperationKey(
            refreshedCluster
              ?.operations[0]
              ?.key ||
            null
          );
        }

        setDirtyDocumentIds(
          (current) => {
            const next =
              new Set(
                current
              );

            next.delete(
              latestDocument.id
            );

            return next;
          }
        );

        alert(
          'Lưu công đoạn vào chứng từ thành công.'
        );
      } catch (
      saveError
      ) {
        console.error(
          'Lưu công đoạn vào chứng từ lỗi:',
          saveError
        );

        alert(
          saveError instanceof
            Error
            ? saveError.message
            : 'Không lưu được công đoạn vào chứng từ.'
        );
      } finally {
        setSavingDocumentId(
          null
        );
      }
    };

  const handleOpenOperationActions =
    async (
      operation: TreeOperation
    ) => {
      setSelectedOperationKey(
        operation.key
      );

      setActionModalTitle(
        operation.code
          ? `${operation.name}`
          : operation.name
      );

      setActionRows([]);
      setActionModalOpen(true);

      const gsdAnalysisId =
        operation.gsdAnalysisId;

      if (!gsdAnalysisId) {
        return;
      }

      setLoadingActionRows(true);

      try {
        const rows =
          await operationClusterService
            .getGsdActions(
              gsdAnalysisId
            );

        setActionRows(rows);
      } catch (loadError) {
        console.error(
          'Load thao tác công đoạn lỗi:',
          loadError
        );

        setActionRows([]);
      } finally {
        setLoadingActionRows(false);
      }
    };

  const handleCloseOperationActions =
    () => {
      setActionModalOpen(false);
      setActionModalTitle('');
      setActionRows([]);
      setLoadingActionRows(false);
    };

  const resetGsdPopup = () => {
    setIsGsdPopupOpen(
      false
    );

    setGsdSearch('');

    setCheckedGsdIds(
      []
    );

    setGsdActionsMap(
      {}
    );

    setLoadingActionIds(
      []
    );
  };

  const handleOpenGsdPopup =
    () => {
      if (!cluster) {
        alert(
          'Vui lòng chọn một cụm trước khi thêm công đoạn.'
        );

        return;
      }

      setIsGsdPopupOpen(
        true
      );

      setGsdSearch('');

      setCheckedGsdIds(
        []
      );

      setGsdActionsMap(
        {}
      );

      setLoadingActionIds(
        []
      );
    };

  const loadActionsForGsd =
    async (
      gsd: GsdOption
    ) => {
      const id =
        gsd.gsd_analysis_id;

      if (
        gsdActionsMap[id]
      ) {
        return;
      }

      setLoadingActionIds(
        (current) =>
          current.includes(
            id
          )
            ? current
            : [
              ...current,
              id,
            ]
      );

      try {
        const actions =
          await operationClusterService
            .getGsdActions(
              id
            );

        setGsdActionsMap(
          (current) => ({
            ...current,
            [id]:
              actions,
          })
        );
      } finally {
        setLoadingActionIds(
          (current) =>
            current.filter(
              (item) =>
                item !== id
            )
        );
      }
    };

  const handleToggleGsd =
    async (
      gsd: GsdOption
    ) => {
      const id =
        gsd.gsd_analysis_id;

      const existed =
        checkedGsdIds.includes(
          id
        );

      if (existed) {
        setCheckedGsdIds(
          (current) =>
            current.filter(
              (item) =>
                item !== id
            )
        );

        setGsdActionsMap(
          (current) => {
            const next = {
              ...current,
            };

            delete next[id];

            return next;
          }
        );

        return;
      }

      setCheckedGsdIds(
        (current) => [
          ...current,
          id,
        ]
      );

      await loadActionsForGsd(
        gsd
      );
    };

  const handleConfirmSelectGsd =
    () => {
      if (
        !selectedContext ||
        !cluster
      ) {
        resetGsdPopup();
        return;
      }

      if (
        checkedGsdIds.length ===
        0
      ) {
        alert(
          'Vui lòng chọn ít nhất một công đoạn GSD.'
        );

        return;
      }

      const selectedGsds =
        gsdOptions.filter(
          (item) =>
            checkedGsdIds.includes(
              item.gsd_analysis_id
            )
        );

      const requiredEfficiency =
        cluster.requiredEfficiency;

      const createdAt =
        Date.now();

      const newOperations:
        TreeOperation[] =
        selectedGsds.map(
          (
            gsd,
            index
          ) => {
            const samGsd =
              toNumber(
                gsd.sam_gsd,
                0
              );

            const adjustedSam =
              requiredEfficiency >
                0
                ? samGsd /
                requiredEfficiency
                : samGsd;

            const operationKey =
              `temp:${cluster.key}:${gsd.gsd_analysis_id}:${createdAt}:${index}`;

            return {
              key:
                operationKey,

              id:
                operationKey,

              gsdAnalysisId:
                gsd.gsd_analysis_id,

              documentId:
                cluster.documentId,

              groupId:
                cluster.id,

              code:
                gsd.operation_code ||
                '',

              name:
                gsd.operation_name ||
                '',

              imageFileName:
                (gsd as any).image_file_name ||
                (gsd as any).imageFileName ||
                '',

              imageUrl:
                (gsd as any).image_url ||
                (gsd as any).imageUrl ||
                '',

              machineName:
                gsd.machine_name ||
                '-',

              codeMmtb:
                gsd.code_mmtb ||
                '-',

              skillLevel:
                gsd.skill_level !==
                  null &&
                  gsd.skill_level !==
                  undefined
                  ? String(
                    gsd.skill_level
                  )
                  : '-',

              samGsd,

              adjustedSam,

              totalActions:
                toNumber(
                  gsd.total_actions,
                  0
                ),

              totalActionSeconds:
                toNumber(
                  gsd.total_action_seconds,
                  0
                ),

              manpower:
                1,

              statusLabel:
                'Đang áp dụng',

              raw:
                gsd,
            };
          }
        );

      setTreeData(
        (currentTree) =>
          currentTree.map(
            (document) => ({
              ...document,

              clusters:
                document.clusters.map(
                  (
                    currentCluster
                  ) =>
                    currentCluster.key ===
                      cluster.key
                      ? {
                        ...currentCluster,

                        operations:
                          [
                            ...currentCluster.operations,
                            ...newOperations,
                          ],
                      }
                      : currentCluster
                ),
            })
          )
      );

      setSelectedOperationKey(
        newOperations[0]
          ?.key ||
        null
      );

      setDirtyDocumentIds(
        (current) => {
          const next =
            new Set(
              current
            );

          next.add(
            selectedContext
              .document
              .id
          );

          return next;
        }
      );

      resetGsdPopup();
    };


  return (
    <div className="h-full min-h-0 bg-slate-50 p-3 text-slate-800">
      <div className="grid h-full min-h-[620px] grid-cols-1 gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-sm font-semibold text-slate-900">
                Cây cấu trúc cụm công đoạn
              </h1>

              <button
                type="button"
                onClick={
                  loadTree
                }
                disabled={
                  loading
                }
                className="h-7 rounded border border-slate-300 bg-white px-2.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Làm mới
              </button>
            </div>

            <div className="relative mt-3">
              <input
                value={
                  keyword
                }
                onChange={(
                  event
                ) =>
                  setKeyword(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Tìm chủng loại, nhóm chủng loại, cụm..."
                className="h-8 w-full rounded-md border border-slate-300 bg-white pl-3 pr-8 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                <SearchIcon />
              </div>
            </div>

            <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-[11px] text-slate-600">
              <input
                type="checkbox"
                checked={
                  showInactive
                }
                onChange={(
                  event
                ) =>
                  setShowInactive(
                    event
                      .target
                      .checked
                  )
                }
                className="h-3.5 w-3.5 rounded border-slate-300"
              />

              Hiển thị cụm ngừng áp dụng
            </label>

            {warning ? (
              <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-700">
                {warning}
              </div>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-2 py-2">
            {loading ? (
              <div className="px-3 py-10 text-center text-xs text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : error ? (
              <div className="px-3 py-8 text-center">
                <div className="text-xs text-rose-600">
                  {error}
                </div>

                <button
                  type="button"
                  onClick={
                    loadTree
                  }
                  className="mt-3 h-8 rounded border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <>
                <TreeNodeRow
                  depth={0}
                  open={
                    forcedOpen ||
                    expanded.has(
                      getNodeKey(
                        'root',
                        0
                      )
                    )
                  }
                  onToggle={() =>
                    toggleNode(
                      getNodeKey(
                        'root',
                        0
                      )
                    )
                  }
                  icon={
                    <TagIcon />
                  }
                  label="Chủng loại"
                  strong
                />

                {(forcedOpen ||
                  expanded.has(
                    getNodeKey(
                      'root',
                      0
                    )
                  )) &&
                  visibleTree.map(
                    (
                      document
                    ) => {
                      // Category/group keys luôn kèm document.id:
                      // hai chứng từ cùng Chủng loại + Nhóm vẫn là hai nhánh riêng.
                      const categoryKey =
                        getNodeKey(
                          'category',
                          `${document.id}:${document.category.id}`
                        );

                      const categoryOpen =
                        forcedOpen ||
                        expanded.has(
                          categoryKey
                        );

                      const groupKey =
                        getNodeKey(
                          'group',
                          `${document.id}:${document.group.id}`
                        );

                      const groupOpen =
                        forcedOpen ||
                        expanded.has(
                          groupKey
                        );

                      return (
                        <div
                          key={
                            document.id
                          }
                        >
                          <TreeNodeRow
                            depth={1}
                            open={
                              categoryOpen
                            }
                            onToggle={() =>
                              toggleNode(
                                categoryKey
                              )
                            }
                            icon={
                              <TagIcon />
                            }
                            label={
                              document.category.name
                            }
                             className="font-medium text-blue-600"
                          />

                          {categoryOpen ? (
                            <>
                              <TreeNodeRow
                                depth={2}
                                open={
                                  groupOpen
                                }
                                onToggle={() =>
                                  toggleNode(
                                    groupKey
                                  )
                                }
                                icon={
                                  <FolderIcon />
                                }
                                label={
                                  document.group.name
                                }
                                className="font-medium text-amber-700"
                              />

                              {groupOpen &&
                                document.clusters.map(
                                  (
                                    treeCluster
                                  ) => {
                                    const selected =
                                      treeCluster.key ===
                                      selectedClusterKey;

                                    return (
                                      <TreeNodeRow
                                        key={
                                          treeCluster.key
                                        }
                                        depth={3}
                                        open={
                                          false
                                        }
                                        onToggle={() => { }}
                                        onSelect={() =>
                                          selectCluster(
                                            document,
                                            treeCluster
                                          )
                                        }
                                        icon={
                                          <ClusterIcon />
                                        }
                                        label={
                                          treeCluster.name
                                        }
                                        selected={
                                          selected
                                        }
                                        inactive={
                                          treeCluster.inactive
                                        }
                                        expandable={
                                          false
                                        }
                                        className="text-slate-700"
                                      />
                                    );
                                  }
                                )}
                            </>
                          ) : null}
                        </div>
                      );
                    }
                  )}

                {!loading &&
                  visibleTree.length ===
                  0 ? (
                  <div className="px-3 py-10 text-center text-xs text-slate-500">
                    Không có dữ liệu phù hợp.
                  </div>
                ) : null}
              </>
            )}
          </div>
        </aside>

        <section className="min-w-0 space-y-3 overflow-auto">
          {/* <section className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-4 py-2.5">
              <h2 className="text-sm font-semibold text-slate-900">
                Thông tin cụm
              </h2>
            </div>

            <div className="grid gap-x-8 gap-y-3 px-4 py-3 sm:grid-cols-2 2xl:grid-cols-3">
              <InfoItem
                label="Nhóm chủng loại"
                value={
                  selectedContext
                    ?.group
                    .name ||
                  '-'
                }
              />

              <InfoItem
                label="Tên cụm"
                value={
                  cluster?.name ||
                  '-'
                }
              />

              <InfoItem
                label="Mã chứng từ"
                value={
                  cluster
                    ?.documentCode ||
                  '-'
                }
              />

              <InfoItem
                label="Chủng loại"
                value={
                  selectedContext
                    ?.category
                    .name ||
                  '-'
                }
              />

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Trạng thái
                </div>

                <div className="mt-1">
                  {cluster ? (
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        cluster.inactive
                          ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100'
                          : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100'
                      }`}
                    >
                      {
                        cluster.statusLabel
                      }
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
              </div>

              <InfoItem
                label="Ghi chú"
                value={
                  cluster?.note ||
                  '-'
                }
              />
            </div>
          </section> */}

          <section className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Thông tin tổng quan
              </h2>

              <span className="text-[10px] text-slate-400">
                Chỉ tính theo cụm đang chọn
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2.5 md:grid-cols-3 2xl:grid-cols-6">
              <KpiCard
                label="Tổng SMV điều chỉnh"
                value={formatNumber(
                  dashboard.totalAdjustedSam
                )}
                className="border-blue-100 bg-blue-50/70 text-blue-700"
              />

              <KpiCard
                label="Tổng SMV"
                value={formatNumber(
                  dashboard.totalSam
                )}
                className="border-emerald-100 bg-emerald-50/70 text-emerald-700"
              />

              <KpiCard
                label="Tổng bước GSD"
                value={String(
                  dashboard.totalActions
                )}
                className="border-orange-100 bg-orange-50/70 text-orange-700"
              />

              <KpiCard
                label="Tổng giây GSD"
                value={formatNumber(
                  dashboard.totalSeconds
                )}
                className="border-amber-100 bg-amber-50/70 text-amber-700"
              />

              <KpiCard
                label="Định mức lao động"
                value={formatNumber(
                  dashboard.totalManpower
                )}
                className="border-violet-100 bg-violet-50/70 text-violet-700"
              />

              <KpiCard
                label="TGCN / cụm"
                value={formatNumber(
                  dashboard.tgcn
                )}
                className="border-slate-200 bg-slate-50 text-slate-700"
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Danh sách công đoạn
                </h2>

                <div className="mt-0.5 text-[10px] text-slate-400">
                  {cluster
                    ? `${cluster.operations.length} công đoạn thuộc ${cluster.name}`
                    : 'Chưa chọn cụm'}
                </div>
              </div>

              <div className='flex gap-2'>
                <Button
                  type="button"
                  onClick={
                    hasPendingChanges
                      ? handleSaveCurrentDocument
                      : handleOpenGsdPopup
                  }
                  disabled={
                    !cluster ||
                    isSavingCurrentDocument
                  }
                  variant={hasPendingChanges ? 'success' : 'primary'}
                >
                  {isSavingCurrentDocument
                    ? 'Đang lưu...'
                    : hasPendingChanges
                      ? 'Lưu'
                      : 'Thêm'}
                </Button>

                {hasPendingChanges && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={
                      handleCancelPendingChanges
                    }
                    disabled={
                      isSavingCurrentDocument
                    }
                  >
                    Hủy
                  </Button>
                )}
              </div>

            </div>

            <div className="overflow-auto">
              <table className="w-full min-w-[1000px] border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <TableHeader className="w-12 text-center">
                      STT
                    </TableHeader>

                    <TableHeader className="min-w-[120px]">
                      Tên công đoạn
                    </TableHeader>

                    <TableHeader className="w-[76px] text-center">
                      Hình ảnh
                    </TableHeader>

                    <TableHeader className="min-w-[80px]">
                      MMTB code
                    </TableHeader>

                    <TableHeader className="w-20 text-center">
                      Bậc
                    </TableHeader>

                    <TableHeader className="w-20 text-right">
                      SMV
                    </TableHeader>

                    <TableHeader className="w-24 text-center">
                      GSD bước
                    </TableHeader>

                    <TableHeader className="w-24 text-right">
                      Giây GSD
                    </TableHeader>

                    <TableHeader className="w-20 text-center">
                      Nhân lực
                    </TableHeader>

                    <TableHeader className="w-28 text-center">
                      Trạng thái
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {cluster?.operations.map(
                    (
                      operation,
                      index
                    ) => {
                      const selected =
                        operation.key ===
                        selectedOperationKey;

                      const operationInactive =
                        isInactiveStatus(
                          operation.statusLabel
                        );

                      const imageValue =
                        operation.imageFileName ||
                        operation.imageUrl ||
                        operation.raw?.image_file_name ||
                        operation.raw?.imageFileName ||
                        operation.raw?.image_url ||
                        operation.raw?.imageUrl ||
                        '';

                      const imageSrc =
                        imageValue
                          ? getGsdAnalysisImageUrl(
                            imageValue
                          )
                          : '';

                      return (
                        <tr
                          key={
                            operation.key
                          }
                          onClick={() =>
                            setSelectedOperationKey(
                              operation.key
                            )
                          }
                          className={`cursor-pointer border-t border-slate-100 ${selected
                            ? 'bg-blue-50/70'
                            : 'bg-white hover:bg-slate-50'
                            }`}
                        >
                          <TableCell className="text-center text-slate-500">
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            <button
                              type="button"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                handleOpenOperationActions(
                                  operation
                                );
                              }}
                              className="text-left font-medium text-blue-700 hover:text-blue-800 hover:underline"
                            >
                              {operation.name ||
                                '-'}
                            </button>
                          </TableCell>

                          <TableCell className="text-center">
                            {imageSrc ? (
                              <button
                                type="button"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  setPreviewImageUrl(
                                    imageSrc
                                  );
                                }}
                                className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-blue-300"
                                title="Xem hình công đoạn"
                              >
                                <img
                                  src={
                                    imageSrc
                                  }
                                  alt={
                                    operation.name ||
                                    'Hình công đoạn'
                                  }
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                -
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            {
                              operation.codeMmtb
                            }
                          </TableCell>

                          <TableCell className="text-center">
                            {
                              operation.skillLevel
                            }
                          </TableCell>

                          <TableCell className="text-right font-medium">
                            {formatNumber(
                              operation.samGsd
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            {
                              operation.totalActions
                            }
                          </TableCell>

                          <TableCell className="text-right">
                            {formatNumber(
                              operation.totalActionSeconds
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            {
                              operation.manpower
                            }
                          </TableCell>

                          <TableCell className="text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${operationInactive
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-emerald-50 text-emerald-700'
                                }`}
                            >
                              {
                                operation.statusLabel
                              }
                            </span>
                          </TableCell>
                        </tr>
                      );
                    }
                  )}

                  {!cluster ||
                    cluster.operations
                      .length ===
                    0 ? (
                    <tr>
                      <td
                        colSpan={
                          10
                        }
                        className="h-32 text-center text-xs text-slate-400"
                      >
                        Cụm chưa có công đoạn.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-500">
              Hiển thị{' '}
              <span className="font-medium text-slate-700">
                {cluster
                  ?.operations
                  .length ||
                  0}
              </span>{' '}
              bản ghi
            </div>
          </section>
        </section>
      </div>

      {previewImageUrl && (
        <ImagePreviewModal
          imageUrl={
            previewImageUrl
          }
          onClose={() =>
            setPreviewImageUrl('')
          }
        />
      )}

      <OperationActionDetailsModal
        open={
          actionModalOpen
        }
        title={
          actionModalTitle
        }
        loading={
          loadingActionRows
        }
        rows={
          actionRows
        }
        onClose={
          handleCloseOperationActions
        }
      />

      <GsdPickerModal
        open={
          isGsdPopupOpen
        }
        search={
          gsdSearch
        }
        checkedIds={
          checkedGsdIds
        }
        options={
          filteredGsdOptions
        }
        checkedGsds={
          checkedGsds
        }
        actionsMap={
          gsdActionsMap
        }
        loadingActionIds={
          loadingActionIds
        }
        onSearchChange={
          setGsdSearch
        }
        onToggle={
          handleToggleGsd
        }
        onCancel={
          resetGsdPopup
        }
        onConfirm={
          handleConfirmSelectGsd
        }
      />
    </div>
  );
}

function findFirstCluster(
  tree:
    OperationClusterDocumentTree[],
  includeInactive:
    boolean
): SelectedContext | null {
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

function findClusterByKey(
  tree:
    OperationClusterDocumentTree[],
  clusterKey:
    string | null
): SelectedContext | null {
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

function filterTree(
  tree:
    OperationClusterDocumentTree[],
  keyword:
    string,
  showInactive:
    boolean
): OperationClusterDocumentTree[] {
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
          `${document.documentCode}`
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

        if (
          visibleClusters.length ===
          0
        ) {
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
      Boolean
    ) as OperationClusterDocumentTree[];
}

function TreeNodeRow({
  depth,
  open,
  onToggle,
  onSelect,
  icon,
  label,
  selected = false,
  strong = false,
  inactive = false,
  expandable = true,
  className = '',
}: {
  depth: number;
  open: boolean;
  onToggle: () => void;
  onSelect?: () => void;
  icon: ReactNode;
  label: string;
  selected?: boolean;
  strong?: boolean;
  inactive?: boolean;
  expandable?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`group flex min-h-8 items-center rounded pr-2 text-[12px] ${selected
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-700 hover:bg-slate-50'
        }`}
      style={{
        paddingLeft:
          `${6 + depth * 17}px`,
      }}
    >
      {expandable ? (
        <button
          type="button"
          onClick={(
            event
          ) => {
            event.stopPropagation();
            onToggle();
          }}
          className="mr-1 flex h-6 w-5 items-center justify-center rounded text-slate-400 hover:bg-white hover:text-slate-700"
        >
          <ChevronIcon
            open={open}
          />
        </button>
      ) : (
        <span className="mr-1 h-6 w-5 shrink-0" />
      )}

      <button
        type="button"
        onClick={
          onSelect ||
          onToggle
        }
        className={`flex min-w-0 flex-1 items-center gap-2 py-1 text-left ${strong
          ? 'font-semibold text-slate-800'
          : ''
          }`}
      >
        <span
          className={
            selected
              ? 'text-blue-600'
              : 'text-slate-500'
          }
        >
          {icon}
        </span>

        <span className={`truncate ${className}`}>
          {label}
        </span>

        {inactive ? (
          <span className="ml-auto shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-medium text-rose-600">
            Ngừng
          </span>
        ) : null}
      </button>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 truncate text-[13px] font-medium text-slate-800">
        {value}
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div
      className={`min-h-[72px] rounded-md border px-3 py-2.5 ${className}`}
    >
      <div className="text-[9px] font-semibold uppercase tracking-wide">
        {label}
      </div>

      <div className="mt-2 text-xl font-medium leading-none">
        {value}
      </div>
    </div>
  );
}

function TableHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-r border-slate-200 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide last:border-r-0 ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-r border-slate-100 px-3 py-2.5 last:border-r-0 ${className}`}
    >
      {children}
    </td>
  );
}

function ChevronIcon({
  open,
}: {
  open: boolean;
}) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${open
        ? 'rotate-90'
        : ''
        }`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7 5.5 12 10l-5 4.5V5.5Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3.5 7.5h6l2-2h9v13h-17v-11Z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-slate-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 4h7l9 9-7 7-9-9V4Z" />

      <circle
        cx="8.2"
        cy="8.2"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function ClusterIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="5"
        r="2.2"
      />

      <circle
        cx="6"
        cy="18"
        r="2.2"
      />

      <circle
        cx="18"
        cy="18"
        r="2.2"
      />

      <path d="M12 7.2v4M12 11.2 7.2 16M12 11.2 16.8 16" />
    </svg>
  );
}