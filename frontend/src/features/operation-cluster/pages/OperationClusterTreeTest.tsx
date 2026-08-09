import { useMemo, useState } from 'react';

type OperationStatus = 'ACTIVE' | 'INACTIVE';

type TreeOperation = {
  id: number;
  code: string;
  name: string;
  machineName: string;
  skillLevel: string;
  samGsd: number;
  adjustedSam: number;
  totalActions: number;
  totalActionSeconds: number;
  manpower: number;
  status: OperationStatus;
};

type TreeCluster = {
  id: number;
  name: string;
  note?: string;
  owner?: string;
  status: OperationStatus;
  operations: TreeOperation[];
};

type ProductCategory = {
  id: number;
  code: string;
  name: string;
  clusters: TreeCluster[];
};

type ProductCategoryGroup = {
  id: number;
  code: string;
  name: string;
  productCategories: ProductCategory[];
};

type ClusterSelection = {
  groupId: number;
  categoryId: number;
  clusterId: number;
};

const DEMO_DATA: ProductCategoryGroup[] = [
  {
    id: 1,
    code: 'NA',
    name: 'Nhóm áo',
    productCategories: [
      {
        id: 11,
        code: 'ASM',
        name: 'Áo sơ mi',
        clusters: [
          {
            id: 111,
            name: 'Cụm lắp ráp',
            note: 'Lắp ráp thân áo sơ mi',
            owner: 'Chưa khai báo',
            status: 'ACTIVE',
            operations: [
              {
                id: 1111,
                code: 'CD001',
                name: 'May sườn',
                machineName: 'Máy 1 kim điện tử',
                skillLevel: '3/7',
                samGsd: 1.85,
                adjustedSam: 1.95,
                totalActions: 4,
                totalActionSeconds: 111,
                manpower: 1,
                status: 'ACTIVE',
              },
              {
                id: 1112,
                code: 'CD002',
                name: 'Ráp vai',
                machineName: 'Máy vắt sổ',
                skillLevel: '3/7',
                samGsd: 1.5,
                adjustedSam: 1.58,
                totalActions: 4,
                totalActionSeconds: 90,
                manpower: 1,
                status: 'ACTIVE',
              },
              {
                id: 1113,
                code: 'CD003',
                name: 'Tra tay',
                machineName: 'Máy 1 kim điện tử',
                skillLevel: '3/7',
                samGsd: 1.9,
                adjustedSam: 2.0,
                totalActions: 4,
                totalActionSeconds: 114,
                manpower: 2,
                status: 'ACTIVE',
              },
              {
                id: 1114,
                code: 'CD004',
                name: 'May cổ',
                machineName: 'Máy 1 kim điện tử',
                skillLevel: '4/7',
                samGsd: 2.1,
                adjustedSam: 2.21,
                totalActions: 4,
                totalActionSeconds: 126,
                manpower: 1,
                status: 'ACTIVE',
              },
              {
                id: 1115,
                code: 'CD005',
                name: 'Đính bo',
                machineName: 'Máy đính bọ',
                skillLevel: '3/7',
                samGsd: 1.4,
                adjustedSam: 1.47,
                totalActions: 4,
                totalActionSeconds: 84,
                manpower: 1,
                status: 'ACTIVE',
              },
              {
                id: 1116,
                code: 'CD006',
                name: 'Diễu gấu',
                machineName: 'Máy 2 kim',
                skillLevel: '3/7',
                samGsd: 3.1,
                adjustedSam: 3.19,
                totalActions: 4,
                totalActionSeconds: 186,
                manpower: 2.5,
                status: 'ACTIVE',
              },
            ],
          },
          {
            id: 112,
            name: 'Cụm thân trước',
            note: 'Chuẩn bị và hoàn thiện thân trước',
            owner: 'Nguyễn Văn B',
            status: 'ACTIVE',
            operations: [
              {
                id: 1121,
                code: 'CD007',
                name: 'Vắt sổ thân trước',
                machineName: 'Máy vắt sổ',
                skillLevel: '2/7',
                samGsd: 0.82,
                adjustedSam: 0.88,
                totalActions: 3,
                totalActionSeconds: 49,
                manpower: 1,
                status: 'ACTIVE',
              },
              {
                id: 1122,
                code: 'CD008',
                name: 'Lắp túi',
                machineName: 'Máy 1 kim điện tử',
                skillLevel: '4/7',
                samGsd: 1.65,
                adjustedSam: 1.72,
                totalActions: 5,
                totalActionSeconds: 99,
                manpower: 1,
                status: 'ACTIVE',
              },
              {
                id: 1123,
                code: 'CD009',
                name: 'May nẹp',
                machineName: 'Máy 1 kim điện tử',
                skillLevel: '4/7',
                samGsd: 1.45,
                adjustedSam: 1.53,
                totalActions: 4,
                totalActionSeconds: 87,
                manpower: 1,
                status: 'ACTIVE',
              },
              {
                id: 1124,
                code: 'CD010',
                name: 'May cầu vai',
                machineName: 'Máy 1 kim điện tử',
                skillLevel: '3/7',
                samGsd: 1.25,
                adjustedSam: 1.31,
                totalActions: 4,
                totalActionSeconds: 75,
                manpower: 1,
                status: 'ACTIVE',
              },
            ],
          },
          {
            id: 113,
            name: 'Cụm cũ - ngừng áp dụng',
            note: 'Dữ liệu cũ để test checkbox',
            owner: 'Chưa khai báo',
            status: 'INACTIVE',
            operations: [
              {
                id: 1131,
                code: 'CD011',
                name: 'May thử',
                machineName: 'Máy 1 kim',
                skillLevel: '2/7',
                samGsd: 0.65,
                adjustedSam: 0.7,
                totalActions: 2,
                totalActionSeconds: 39,
                manpower: 1,
                status: 'INACTIVE',
              },
            ],
          },
        ],
      },
      {
        id: 12,
        code: 'AT',
        name: 'Áo thun',
        clusters: [
          {
            id: 121,
            name: 'Cụm ráp thân',
            note: 'Ráp thân áo thun',
            owner: 'Trần Thị C',
            status: 'ACTIVE',
            operations: [
              {
                id: 1211,
                code: 'CD012',
                name: 'Ráp sườn áo',
                machineName: 'Máy vắt sổ',
                skillLevel: '3/7',
                samGsd: 1.12,
                adjustedSam: 1.18,
                totalActions: 4,
                totalActionSeconds: 67,
                manpower: 1,
                status: 'ACTIVE',
              },
              {
                id: 1212,
                code: 'CD013',
                name: 'Tra tay áo',
                machineName: 'Máy vắt sổ',
                skillLevel: '3/7',
                samGsd: 1.28,
                adjustedSam: 1.34,
                totalActions: 4,
                totalActionSeconds: 77,
                manpower: 1,
                status: 'ACTIVE',
              },
            ],
          },
        ],
      },
      {
        id: 13,
        code: 'AK',
        name: 'Áo khoác',
        clusters: [],
      },
    ],
  },
  {
    id: 2,
    code: 'NQ',
    name: 'Nhóm quần',
    productCategories: [
      {
        id: 21,
        code: 'QT',
        name: 'Quần tây',
        clusters: [
          {
            id: 211,
            name: 'Cụm túi',
            note: 'Công đoạn túi quần tây',
            owner: 'Lê Văn D',
            status: 'ACTIVE',
            operations: [
              {
                id: 2111,
                code: 'CD014',
                name: 'May túi sau',
                machineName: 'Máy 1 kim điện tử',
                skillLevel: '4/7',
                samGsd: 1.82,
                adjustedSam: 1.91,
                totalActions: 5,
                totalActionSeconds: 109,
                manpower: 1,
                status: 'ACTIVE',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    code: 'NPK',
    name: 'Nhóm phụ kiện',
    productCategories: [],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${
        open ? 'rotate-90' : ''
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
      <circle cx="11" cy="11" r="7" />
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
      <circle cx="8.2" cy="8.2" r="1" fill="currentColor" stroke="none" />
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
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M12 7.2v4M12 11.2 7.2 16M12 11.2 16.8 16" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="m4 20 4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
      <path d="m13.8 7.4 2.8 2.8" />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M5 4h10l4 4v12H5V4Z" />
      <path d="M15 4v4h4" />
      <path d="m8 11 4 5m0-5-4 5" />
    </svg>
  );
}

function formatNumber(value: number) {
  return value.toFixed(2);
}

function getStatusLabel(status: OperationStatus) {
  return status === 'ACTIVE' ? 'Đang áp dụng' : 'Ngừng áp dụng';
}

function getStatusClasses(status: OperationStatus) {
  return status === 'ACTIVE'
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100'
    : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100';
}

function getNodeKey(level: string, id: number) {
  return `${level}:${id}`;
}

export default function OperationClusterTreeDashboardTest() {
  const [keyword, setKeyword] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedOperationId, setSelectedOperationId] = useState<number | null>(
    1111
  );

  const [selection, setSelection] = useState<ClusterSelection>({
    groupId: 1,
    categoryId: 11,
    clusterId: 111,
  });

  const [expanded, setExpanded] = useState<Set<string>>(
    () =>
      new Set([
        getNodeKey('root', 0),
        getNodeKey('group', 1),
        getNodeKey('category', 11),
        getNodeKey('cluster', 111),
        getNodeKey('cluster', 112),
      ])
  );

  const selectedData = useMemo(() => {
    const group = DEMO_DATA.find((item) => item.id === selection.groupId);
    const category = group?.productCategories.find(
      (item) => item.id === selection.categoryId
    );
    const cluster = category?.clusters.find(
      (item) => item.id === selection.clusterId
    );

    return { group, category, cluster };
  }, [selection]);

  const dashboard = useMemo(() => {
    const operations = selectedData.cluster?.operations ?? [];

    const totalAdjustedSam = operations.reduce(
      (sum, operation) => sum + operation.adjustedSam,
      0
    );

    const totalSam = operations.reduce(
      (sum, operation) => sum + operation.samGsd,
      0
    );

    const totalActions = operations.reduce(
      (sum, operation) => sum + operation.totalActions,
      0
    );

    const totalSeconds = operations.reduce(
      (sum, operation) => sum + operation.totalActionSeconds,
      0
    );

    const totalManpower = operations.reduce(
      (sum, operation) => sum + operation.manpower,
      0
    );

    const avgTgcn =
      operations.length > 0
        ? totalSeconds / operations.length / 4
        : 0;

    return {
      totalAdjustedSam,
      totalSam,
      totalActions,
      totalSeconds,
      totalManpower,
      avgTgcn,
    };
  }, [selectedData.cluster]);

  const normalizedKeyword = keyword.trim().toLowerCase();

  const visibleTree = useMemo(() => {
    const clusterIsVisible = (cluster: TreeCluster) =>
      showInactive || cluster.status === 'ACTIVE';

    if (!normalizedKeyword) {
      return DEMO_DATA.map((group) => ({
        ...group,
        productCategories: group.productCategories.map((category) => ({
          ...category,
          clusters: category.clusters.filter(clusterIsVisible),
        })),
      }));
    }

    return DEMO_DATA.map((group) => {
      const groupMatched = `${group.code} ${group.name}`
        .toLowerCase()
        .includes(normalizedKeyword);

      const categories = group.productCategories
        .map((category) => {
          const categoryMatched = `${category.code} ${category.name}`
            .toLowerCase()
            .includes(normalizedKeyword);

          const clusters = category.clusters
            .filter(clusterIsVisible)
            .map((cluster) => {
              const clusterMatched = cluster.name
                .toLowerCase()
                .includes(normalizedKeyword);

              const matchedOperations = cluster.operations.filter((operation) =>
                `${operation.code} ${operation.name} ${operation.machineName}`
                  .toLowerCase()
                  .includes(normalizedKeyword)
              );

              if (groupMatched || categoryMatched || clusterMatched) {
                return cluster;
              }

              if (matchedOperations.length > 0) {
                return {
                  ...cluster,
                  operations: matchedOperations,
                };
              }

              return null;
            })
            .filter(Boolean) as TreeCluster[];

          if (groupMatched || categoryMatched || clusters.length > 0) {
            return {
              ...category,
              clusters:
                groupMatched || categoryMatched
                  ? category.clusters.filter(clusterIsVisible)
                  : clusters,
            };
          }

          return null;
        })
        .filter(Boolean) as ProductCategory[];

      if (groupMatched || categories.length > 0) {
        return {
          ...group,
          productCategories: groupMatched ? group.productCategories : categories,
        };
      }

      return null;
    }).filter(Boolean) as ProductCategoryGroup[];
  }, [normalizedKeyword, showInactive]);

  const isForcedOpen = normalizedKeyword.length > 0;

  const toggleNode = (key: string) => {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const selectCluster = (
    groupId: number,
    categoryId: number,
    clusterId: number
  ) => {
    setSelection({
      groupId,
      categoryId,
      clusterId,
    });

    const group = DEMO_DATA.find((item) => item.id === groupId);
    const category = group?.productCategories.find(
      (item) => item.id === categoryId
    );
    const cluster = category?.clusters.find((item) => item.id === clusterId);

    setSelectedOperationId(cluster?.operations[0]?.id ?? null);

    setExpanded((current) => {
      const next = new Set(current);
      next.add(getNodeKey('root', 0));
      next.add(getNodeKey('group', groupId));
      next.add(getNodeKey('category', categoryId));
      next.add(getNodeKey('cluster', clusterId));
      return next;
    });
  };

  const selectOperation = (
    groupId: number,
    categoryId: number,
    clusterId: number,
    operationId: number
  ) => {
    selectCluster(groupId, categoryId, clusterId);
    setSelectedOperationId(operationId);
  };

  const cluster = selectedData.cluster;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-[1900px] px-5 py-4">
        <div className="grid min-h-[calc(100vh-102px)] grid-cols-1 gap-3 xl:grid-cols-[390px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3">
              <h1 className="text-sm font-semibold text-slate-900">
                Cây cấu trúc cụm công đoạn
              </h1>

              <div className="relative mt-3">
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm kiếm..."
                  className="h-9 w-full rounded-md border border-slate-300 bg-white pl-3 pr-9 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <SearchIcon />
                </div>
              </div>

              <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(event) => setShowInactive(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300"
                />
                Hiển thị cụm ngừng áp dụng
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
              <TreeNodeRow
                depth={0}
                open={isForcedOpen || expanded.has(getNodeKey('root', 0))}
                onToggle={() => toggleNode(getNodeKey('root', 0))}
                icon={<ClusterIcon />}
                label="Nhóm chủng loại"
                strong
              />

              {(isForcedOpen || expanded.has(getNodeKey('root', 0))) &&
                visibleTree.map((group) => {
                  const groupKey = getNodeKey('group', group.id);
                  const groupOpen = isForcedOpen || expanded.has(groupKey);

                  return (
                    <div key={group.id}>
                      <TreeNodeRow
                        depth={1}
                        open={groupOpen}
                        onToggle={() => toggleNode(groupKey)}
                        icon={<FolderIcon />}
                        label={group.name}
                      />

                      {groupOpen &&
                        group.productCategories.map((category) => {
                          const categoryKey = getNodeKey(
                            'category',
                            category.id
                          );
                          const categoryOpen =
                            isForcedOpen || expanded.has(categoryKey);

                          return (
                            <div key={category.id}>
                              <TreeNodeRow
                                depth={2}
                                open={categoryOpen}
                                onToggle={() => toggleNode(categoryKey)}
                                icon={<TagIcon />}
                                label={category.name}
                              />

                              {categoryOpen &&
                                category.clusters.map((treeCluster) => {
                                  const clusterKey = getNodeKey(
                                    'cluster',
                                    treeCluster.id
                                  );
                                  const clusterOpen =
                                    isForcedOpen || expanded.has(clusterKey);
                                  const clusterSelected =
                                    treeCluster.id === selection.clusterId;

                                  return (
                                    <div key={treeCluster.id}>
                                      <TreeNodeRow
                                        depth={3}
                                        open={clusterOpen}
                                        onToggle={() => toggleNode(clusterKey)}
                                        onSelect={() =>
                                          selectCluster(
                                            group.id,
                                            category.id,
                                            treeCluster.id
                                          )
                                        }
                                        icon={<ClusterIcon />}
                                        label={treeCluster.name}
                                        selected={clusterSelected}
                                        status={treeCluster.status}
                                      />

                                      {clusterOpen &&
                                        treeCluster.operations.map(
                                          (operation) => {
                                            const selected =
                                              clusterSelected &&
                                              selectedOperationId ===
                                                operation.id;

                                            return (
                                              <button
                                                key={operation.id}
                                                type="button"
                                                onClick={() =>
                                                  selectOperation(
                                                    group.id,
                                                    category.id,
                                                    treeCluster.id,
                                                    operation.id
                                                  )
                                                }
                                                className={`flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-[13px] transition ${
                                                  selected
                                                    ? 'bg-slate-100 font-medium text-slate-900'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                                style={{
                                                  paddingLeft: `${28 + 4 * 18}px`,
                                                }}
                                              >
                                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                                                <span className="truncate">
                                                  {operation.name}
                                                </span>
                                              </button>
                                            );
                                          }
                                        )}
                                    </div>
                                  );
                                })}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}

              {visibleTree.length === 0 && (
                <div className="px-3 py-8 text-center text-xs text-slate-500">
                  Không tìm thấy dữ liệu phù hợp.
                </div>
              )}
            </div>
          </aside>

          <section className="min-w-0 space-y-3">
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Thông tin cụm
                </h2>

                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-blue-500 bg-white px-3 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                >
                  <EditIcon />
                  Sửa
                </button>
              </div>

              <div className="grid gap-x-8 gap-y-4 px-4 py-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem
                  label="Nhóm chủng loại"
                  value={selectedData.group?.name ?? '-'}
                />

                <InfoItem label="Tên cụm" value={cluster?.name ?? '-'} />

                <InfoItem
                  label="Người phụ trách"
                  value={cluster?.owner ?? 'Chưa khai báo'}
                />

                <InfoItem
                  label="Chủng loại"
                  value={selectedData.category?.name ?? '-'}
                />

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Trạng thái
                  </div>
                  <div className="mt-1.5">
                    {cluster ? (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          cluster.status
                        )}`}
                      >
                        {getStatusLabel(cluster.status)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-700">-</span>
                    )}
                  </div>
                </div>

                <InfoItem label="Ghi chú" value={cluster?.note ?? '-'} />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Thông tin tổng quan
                </h2>

                <span className="text-[11px] text-slate-400">
                  Tính realtime theo các công đoạn trong cụm
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-3 2xl:grid-cols-6">
                <KpiCard
                  label="Tổng SMV điều chỉnh"
                  value={formatNumber(dashboard.totalAdjustedSam)}
                  className="border-blue-100 bg-blue-50/70 text-blue-700"
                />

                <KpiCard
                  label="Tổng SMV"
                  value={formatNumber(dashboard.totalSam)}
                  className="border-emerald-100 bg-emerald-50/70 text-emerald-700"
                />

                <KpiCard
                  label="Tổng bước GSD"
                  value={String(dashboard.totalActions)}
                  className="border-orange-100 bg-orange-50/70 text-orange-700"
                />

                <KpiCard
                  label="Tổng giây GSD"
                  value={formatNumber(dashboard.totalSeconds)}
                  className="border-amber-100 bg-amber-50/70 text-amber-700"
                />

                <KpiCard
                  label="Định mức lao động"
                  value={formatNumber(dashboard.totalManpower)}
                  className="border-violet-100 bg-violet-50/70 text-violet-700"
                />

                <KpiCard
                  label="TB TGCN / cụm"
                  value={formatNumber(dashboard.avgTgcn)}
                  className="border-slate-200 bg-slate-50 text-slate-700"
                />
              </div>
            </section>

            <section className="min-h-[360px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Danh sách công đoạn
                  </h2>

                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {cluster
                      ? `${cluster.operations.length} công đoạn thuộc ${cluster.name}`
                      : 'Chưa chọn cụm'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="h-8 rounded-md bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    + Thêm công đoạn
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <ExcelIcon />
                    Xuất Excel
                  </button>
                </div>
              </div>

              <div className="overflow-auto">
                <table className="min-w-[1120px] w-full border-collapse text-xs">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <TableHeader className="w-14 text-center">STT</TableHeader>
                      <TableHeader className="w-28">Mã công đoạn</TableHeader>
                      <TableHeader className="min-w-[180px]">
                        Tên công đoạn
                      </TableHeader>
                      <TableHeader className="min-w-[190px]">
                        Máy / MMTB
                      </TableHeader>
                      <TableHeader className="w-24 text-center">
                        Bậc thợ
                      </TableHeader>
                      <TableHeader className="w-20 text-right">SMV</TableHeader>
                      <TableHeader className="w-24 text-center">
                        GSD bước
                      </TableHeader>
                      <TableHeader className="w-24 text-right">
                        Giây GSD
                      </TableHeader>
                      <TableHeader className="w-24 text-center">
                        Nhân lực
                      </TableHeader>
                      <TableHeader className="w-32 text-center">
                        Trạng thái
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {cluster?.operations.map((operation, index) => {
                      const selected = selectedOperationId === operation.id;

                      return (
                        <tr
                          key={operation.id}
                          onClick={() => setSelectedOperationId(operation.id)}
                          className={`cursor-pointer border-t border-slate-100 transition ${
                            selected
                              ? 'bg-blue-50/80'
                              : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          <TableCell className="text-center text-slate-500">
                            {index + 1}
                          </TableCell>

                          <TableCell className="font-medium text-slate-700">
                            {operation.code}
                          </TableCell>

                          <TableCell className="font-medium text-slate-800">
                            {operation.name}
                          </TableCell>

                          <TableCell>{operation.machineName}</TableCell>

                          <TableCell className="text-center">
                            {operation.skillLevel}
                          </TableCell>

                          <TableCell className="text-right font-medium">
                            {formatNumber(operation.samGsd)}
                          </TableCell>

                          <TableCell className="text-center">
                            {operation.totalActions}
                          </TableCell>

                          <TableCell className="text-right">
                            {formatNumber(operation.totalActionSeconds)}
                          </TableCell>

                          <TableCell className="text-center">
                            {operation.manpower}
                          </TableCell>

                          <TableCell className="text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${getStatusClasses(
                                operation.status
                              )}`}
                            >
                              {getStatusLabel(operation.status)}
                            </span>
                          </TableCell>
                        </tr>
                      );
                    })}

                    {!cluster || cluster.operations.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="h-36 text-center text-sm text-slate-400"
                        >
                          Cụm chưa có công đoạn.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
                <div>
                  Hiển thị{' '}
                  <span className="font-medium text-slate-700">
                    {cluster?.operations.length ?? 0}
                  </span>{' '}
                  bản ghi
                </div>

                <div className="flex items-center overflow-hidden rounded-md border border-slate-200 bg-white">
                  <button
                    type="button"
                    className="h-8 w-8 text-slate-400 hover:bg-slate-50"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="h-8 w-9 border-x border-slate-200 bg-blue-50 font-medium text-blue-600"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="h-8 w-8 text-slate-400 hover:bg-slate-50"
                  >
                    ›
                  </button>
                </div>
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
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
  status,
}: {
  depth: number;
  open: boolean;
  onToggle: () => void;
  onSelect?: () => void;
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  strong?: boolean;
  status?: OperationStatus;
}) {
  return (
    <div
      className={`group flex min-h-8 items-center rounded-md pr-2 text-[13px] ${
        selected
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-700 hover:bg-slate-50'
      }`}
      style={{ paddingLeft: `${8 + depth * 18}px` }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className="mr-1 flex h-6 w-5 items-center justify-center rounded text-slate-400 hover:bg-white/80 hover:text-slate-700"
        aria-label={open ? 'Thu gọn' : 'Mở rộng'}
      >
        <ChevronIcon open={open} />
      </button>

      <button
        type="button"
        onClick={onSelect ?? onToggle}
        className={`flex min-w-0 flex-1 items-center gap-2 py-1 text-left ${
          strong ? 'font-semibold text-slate-800' : ''
        }`}
      >
        <span className={selected ? 'text-blue-600' : 'text-slate-500'}>
          {icon}
        </span>

        <span className="truncate">{label}</span>

        {status === 'INACTIVE' ? (
          <span className="ml-auto shrink-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">
            Ngừng
          </span>
        ) : null}
      </button>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-slate-800">
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
    <div className={`min-h-[84px] rounded-md border px-3 py-3 ${className}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </div>
      <div className="mt-2 text-[22px] font-medium leading-none">{value}</div>
    </div>
  );
}

function TableHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-r border-slate-200 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide last:border-r-0 ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`border-r border-slate-100 px-3 py-2.5 last:border-r-0 ${className}`}>
      {children}
    </td>
  );
}