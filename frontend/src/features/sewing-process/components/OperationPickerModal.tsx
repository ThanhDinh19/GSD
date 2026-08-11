// import type {
//   ProductCateGroup,
// } from '../../../types';

// import type {
//   SewingProcessLine,
// } from '../types/sewingProcess.types';

// import {
//   formatNumber,
// } from '../utils/sewingProcess.formatters';

// export type OperationClusterItem = {
//   id: number;

//   documentCode?: string | null;
//   document_code?: string | null;

//   categoryGroupName?: string | null;
//   category_group_name?: string | null;

//   productName?: string | null;
//   product_name?: string | null;

//   workName?: string | null;
//   work_name?: string | null;

//   productCategoryName?: string | null;
//   product_category_name?: string | null;

//   productCateName?: string | null;
//   product_cate_name?: string | null;

//   productCategoryGroupId?: number | null;
//   product_category_group_id?: number | null;

//   note?: string | null;

//   statusId?: number | null;
//   status_id?: number | null;
// };

// type OperationPickerModalProps = {
//   productCateGroups: ProductCateGroup[];

//   operationClusters: OperationClusterItem[];

//   productCateGroupId: number | '';

//   operationClusterId: number | '';

//   rows: SewingProcessLine[];

//   selectedMap: Record<
//     string,
//     SewingProcessLine
//   >;

//   selectedCount: number;

//   onProductCateGroupChange: (
//     value: number | ''
//   ) => void;

//   onClusterChange: (
//     value: string
//   ) => void;

//   onToggleRow: (
//     row: SewingProcessLine,
//     checked: boolean
//   ) => void;

//   onToggleAll: (
//     checked: boolean
//   ) => void;

//   onConfirm: () => void;

//   onClose: () => void;
// };

// /**
//  * Key này phải giống chính xác key đang được tạo
//  * trong useOperationPicker.ts.
//  */
// export function getPickerLineKey(
//   row: SewingProcessLine
// ): string {
//   return [
//     row.sourceDocumentCode ?? '',
//     row.sourceLineId ?? '',
//     row.gsdAnalysisId ?? '',
//     row.operationCode ?? '',
//     row.operationName ?? '',
//     row.lineOrder ?? row.lineNo,
//   ].join('|');
// }

// function getDocumentCode(
//   item: OperationClusterItem
// ): string {
//   return (
//     item.documentCode ??
//     item.document_code ??
//     ''
//   );
// }

// function getClusterName(
//   item: OperationClusterItem
// ): string {
//   return (
//     item.categoryGroupName ??
//     item.category_group_name ??
//     item.productName ??
//     item.product_name ??
//     item.workName ??
//     item.work_name ??
//     item.productCategoryName ??
//     item.product_category_name ??
//     item.productCateName ??
//     item.product_cate_name ??
//     item.note ??
//     ''
//   );
// }

// function getStatusId(
//   item: {
//     statusId?: number | null;
//     status_id?: number | null;
//   }
// ): number {
//   return Number(
//     item.statusId ??
//     item.status_id ??
//     0
//   );
// }

// function getProductCateGroupName(
//   item: ProductCateGroup
// ): string {
//   return `${item.cateGroupCode} - ${item.cateGroupName}`;
// }

// export function OperationPickerModal({
//   productCateGroups,
//   operationClusters,
//   productCateGroupId,
//   operationClusterId,
//   rows,
//   selectedMap,
//   selectedCount,
//   onProductCateGroupChange,
//   onClusterChange,
//   onToggleRow,
//   onToggleAll,
//   onConfirm,
//   onClose,
// }: OperationPickerModalProps) {

//   const safeOperationClusters =
//     Array.isArray(operationClusters)
//       ? operationClusters
//       : [];

//   const safeProductCateGroups =
//     Array.isArray(productCateGroups)
//       ? productCateGroups
//       : [];

//   const safeRows =
//     Array.isArray(rows)
//       ? rows
//       : [];

//   const activeProductCateGroups =
//     safeProductCateGroups.filter(
//       (item) =>
//         getStatusId(item) === 0
//     );

//   const allCurrentRowsChecked =
//     safeRows.length > 0 &&
//     safeRows.every((row) => {
//       const key =
//         getPickerLineKey(row);

//       return Boolean(
//         selectedMap[key]
//       );
//     });

//   return (
//     <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
//       <div className="flex h-[78vh] w-[92vw] max-w-[1300px] flex-col rounded-sm bg-white shadow-xl">
//         {/* Header */}
//         <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
//           <div>
//             <h3 className="text-base font-bold uppercase text-slate-800">
//               Chọn công đoạn
//             </h3>

//             <p className="mt-1 text-xs text-slate-500">
//               Lọc theo nhóm chủng loại, chọn chứng từ kho cụm, tick công đoạn rồi xác nhận.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-sm border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
//           >
//             Đóng
//           </button>
//         </div>

//         {/* Bộ lọc */}
//         <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-5 md:grid-cols-3">
//           <div>
//             <label className="mb-1 block text-xs font-bold text-slate-600">
//               Nhóm chủng loại
//             </label>

//             <select
//               value={
//                 productCateGroupId
//               }
//               onChange={(event) => {
//                 const value =
//                   event.target.value;

//                 onProductCateGroupChange(
//                   value
//                     ? Number(value)
//                     : ''
//                 );
//               }}
//               className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm"
//             >
//               <option value="">
//                 -- Tất cả nhóm chủng loại --
//               </option>

//               {activeProductCateGroups.map(
//                 (item) => (
//                   <option
//                     key={item.id}
//                     value={item.id}
//                   >
//                     {getProductCateGroupName(
//                       item
//                     )}
//                   </option>
//                 )
//               )}
//             </select>
//           </div>

//           <div className="md:col-span-2">
//             <label className="mb-1 block text-xs font-bold text-slate-600">
//               Chứng từ kho cụm công đoạn
//             </label>

//             <select
//               value={
//                 operationClusterId
//               }
//               onChange={(event) =>
//                 onClusterChange(
//                   event.target.value
//                 )
//               }
//               className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm"
//             >
//               <option value="">
//                 -- Chọn chứng từ kho cụm --
//               </option>

//               {safeOperationClusters.map(
//                 (item) => {
//                   const documentCode =
//                     getDocumentCode(item);

//                   const clusterName =
//                     getClusterName(item);

//                   return (
//                     <option
//                       key={item.id}
//                       value={item.id}
//                     >
//                       {documentCode}

//                       {clusterName
//                         ? ` - ${clusterName}`
//                         : ''}
//                     </option>
//                   );
//                 }
//               )}
//             </select>
//           </div>
//         </div>

//         {/* Danh sách công đoạn */}
//         <div className="min-h-0 flex-1 overflow-auto p-5">
//           <div className="mb-2 text-xs text-slate-600">
//             Số công đoạn đã chọn:{' '}

//             <span className="font-bold text-blue-700">
//               {selectedCount}
//             </span>
//           </div>

//           <div className="overflow-auto rounded-sm border border-slate-300">
//             <table className="w-full min-w-[1200px] border-collapse text-xs">
//               <thead className="sticky top-0 z-10 bg-slate-50">
//                 <tr>
//                   <th className="border border-slate-300 px-2 py-2 text-center">
//                     <input
//                       type="checkbox"
//                       checked={
//                         allCurrentRowsChecked
//                       }
//                       disabled={
//                         safeRows.length === 0
//                       }
//                       onChange={(event) =>
//                         onToggleAll(
//                           event.target.checked
//                         )
//                       }
//                     />
//                   </th>

//                   <th className="border border-slate-300 px-2 py-2">
//                     STT xếp chuyền
//                   </th>

//                   <th className="border border-slate-300 px-2 py-2">
//                     Tên cụm
//                   </th>

//                   <th className="border border-slate-300 px-2 py-2">
//                     Tên công đoạn
//                   </th>

//                   <th className="border border-slate-300 px-2 py-2">
//                     Bậc thợ
//                   </th>

//                   <th className="border border-slate-300 px-2 py-2">
//                     Code MMTB
//                   </th>

//                   <th className="border border-slate-300 px-2 py-2">
//                     SAM gốc GSD
//                   </th>

//                   <th className="border border-slate-300 px-2 py-2">
//                     Tổng thao tác
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {safeRows.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan={8}
//                       className="border border-slate-300 px-4 py-6 text-center text-slate-400"
//                     >
//                       Chưa có công đoạn. Hãy chọn chứng từ kho cụm.
//                     </td>
//                   </tr>
//                 )}

//                 {rows.map(
//                   (row, index) => {
//                     const rowKey =
//                       getPickerLineKey(
//                         row
//                       );

//                     const checked =
//                       Boolean(
//                         selectedMap[
//                         rowKey
//                         ]
//                       );

//                     return (
//                       <tr key={rowKey}>
//                         <td className="border border-slate-300 px-2 py-2 text-center">
//                           <input
//                             type="checkbox"
//                             checked={
//                               checked
//                             }
//                             onChange={(
//                               event
//                             ) =>
//                               onToggleRow(
//                                 row,
//                                 event
//                                   .target
//                                   .checked
//                               )
//                             }
//                           />
//                         </td>

//                         <td className="border border-slate-300 px-2 py-2 text-right">
//                           {row.lineOrder ??
//                             index + 1}
//                         </td>

//                         <td className="border border-slate-300 px-2 py-2">
//                           {row.clusterName ||
//                             ''}
//                         </td>

//                         <td className="border border-slate-300 px-2 py-2">
//                           {row.operationName ||
//                             ''}
//                         </td>

//                         <td className="border border-slate-300 px-2 py-2 text-right">
//                           {row.skillGradeLevel ??
//                             ''}
//                         </td>

//                         <td className="border border-slate-300 px-2 py-2">
//                           {row.machineCode ||
//                             ''}
//                         </td>

//                         <td className="border border-slate-300 px-2 py-2 text-right">
//                           {formatNumber(
//                             row.samGsd,
//                             4
//                           )}
//                         </td>

//                         <td className="border border-slate-300 px-2 py-2 text-right">
//                           {row.totalActions ||
//                             0}
//                         </td>
//                       </tr>
//                     );
//                   }
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
//           <button
//             type="button"
//             onClick={onClose}
//             className="rounded-sm border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
//           >
//             Hủy
//           </button>

//           <button
//             type="button"
//             onClick={onConfirm}
//             disabled={
//               selectedCount === 0
//             }
//             className="rounded-sm bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             Xác nhận
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import {
  useMemo,
  useState,
} from 'react';

import type {
  ProductCateGroup,
} from '../../../types';

import type {
  SewingProcessLine,
} from '../types/sewingProcess.types';

import {
  formatNumber,
} from '../utils/sewingProcess.formatters';

export type OperationClusterItem = {
  id: number;

  documentCode?: string | null;
  document_code?: string | null;

  categoryGroupName?: string | null;
  category_group_name?: string | null;

  categoryGroupCode?: string | null;
  category_group_code?: string | null;

  productCategoryId?: number | null;
  product_category_id?: number | null;

  productCategoryGroupId?: number | null;
  product_category_group_id?: number | null;

  productCode?: string | null;
  product_code?: string | null;

  productName?: string | null;
  product_name?: string | null;

  workName?: string | null;
  work_name?: string | null;

  productCategoryName?: string | null;
  product_category_name?: string | null;

  productCateName?: string | null;
  product_cate_name?: string | null;

  note?: string | null;

  statusId?: number | null;
  status_id?: number | null;
};

type OperationPickerModalProps = {
  productCateGroups: ProductCateGroup[];

  operationClusters: OperationClusterItem[];

  productCateGroupId: number | '';

  operationClusterId: number | '';

  rows: SewingProcessLine[];

  selectedMap: Record<
    string,
    SewingProcessLine
  >;

  selectedCount: number;

  onProductCateGroupChange: (
    value: number | ''
  ) => void;

  onClusterChange: (
    value: string
  ) => void;

  onToggleRow: (
    row: SewingProcessLine,
    checked: boolean
  ) => void;

  onToggleAll: (
    checked: boolean
  ) => void;

  onConfirm: () => void;

  onClose: () => void;
};

/**
 * Key này phải giống chính xác key đang được tạo
 * trong useOperationPicker.ts.
 */
export function getPickerLineKey(
  row: SewingProcessLine
): string {
  return [
    row.sourceDocumentCode ?? '',
    row.sourceLineId ?? '',
    row.gsdAnalysisId ?? '',
    row.operationCode ?? '',
    row.operationName ?? '',
    row.lineOrder ?? row.lineNo,
  ].join('|');
}

function getDocumentCode(
  item: OperationClusterItem
): string {
  return (
    item.documentCode ??
    item.document_code ??
    ''
  );
}

function getProductCategoryId(
  item: OperationClusterItem
): number {
  return Number(
    item.productCategoryId ??
    item.product_category_id ??
    0
  );
}

function getProductCategoryName(
  item: OperationClusterItem
): string {
  return (
    item.productName ??
    item.product_name ??
    item.productCategoryName ??
    item.product_category_name ??
    item.productCateName ??
    item.product_cate_name ??
    ''
  );
}

function getProductCategoryCode(
  item: OperationClusterItem
): string {
  return (
    item.productCode ??
    item.product_code ??
    ''
  );
}

function getCategoryGroupName(
  item: OperationClusterItem
): string {
  return (
    item.categoryGroupName ??
    item.category_group_name ??
    ''
  );
}

function getStatusId(
  item: {
    statusId?: number | null;
    status_id?: number | null;
  }
): number {
  return Number(
    item.statusId ??
    item.status_id ??
    0
  );
}

export function OperationPickerModal({
  operationClusters,
  operationClusterId,
  rows,
  selectedMap,
  selectedCount,
  onProductCateGroupChange,
  onClusterChange,
  onToggleRow,
  onToggleAll,
  onConfirm,
  onClose,
}: OperationPickerModalProps) {
  const [
    productCategoryId,
    setProductCategoryId,
  ] = useState<number | ''>('');

  const safeOperationClusters =
    Array.isArray(operationClusters)
      ? operationClusters
      : [];

  const safeRows =
    Array.isArray(rows)
      ? rows
      : [];

  const activeOperationClusters =
    useMemo(
      () =>
        safeOperationClusters.filter(
          (item) =>
            getStatusId(item) === 0
        ),
      [safeOperationClusters]
    );

  const productCategories =
    useMemo(() => {
      const categoryMap =
        new Map<
          number,
          {
            id: number;
            code: string;
            name: string;
          }
        >();

      activeOperationClusters.forEach(
        (item) => {
          const id =
            getProductCategoryId(
              item
            );

          if (!id) {
            return;
          }

          if (
            !categoryMap.has(id)
          ) {
            categoryMap.set(
              id,
              {
                id,

                code:
                  getProductCategoryCode(
                    item
                  ),

                name:
                  getProductCategoryName(
                    item
                  ) ||
                  `Chủng loại ${id}`,
              }
            );
          }
        }
      );

      return Array.from(
        categoryMap.values()
      ).sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            'vi'
          )
      );
    }, [
      activeOperationClusters,
    ]);

  const filteredOperationClusters =
    useMemo(() => {
      if (
        !productCategoryId
      ) {
        return [];
      }

      return activeOperationClusters
        .filter(
          (item) =>
            getProductCategoryId(
              item
            ) ===
            Number(
              productCategoryId
            )
        )
        .sort(
          (a, b) =>
            getDocumentCode(
              a
            ).localeCompare(
              getDocumentCode(
                b
              ),
              'vi',
              {
                numeric: true,
              }
            )
        );
    }, [
      activeOperationClusters,
      productCategoryId,
    ]);

  const handleProductCategoryChange =
    (
      value: string
    ) => {
      const nextId =
        value
          ? Number(value)
          : '';

      setProductCategoryId(
        nextId
      );

      /*
       * Bộ lọc cũ dùng productCategoryGroupId.
       * Clear state cũ để parent không tiếp tục lọc operationClusters
       * theo nhóm chủng loại đã chọn trước đó.
       */
      onProductCateGroupChange(
        ''
      );

      /*
       * Đổi Chủng loại thì chứng từ cũ không còn hợp lệ.
       * changeCluster('') đồng thời clear danh sách công đoạn trong hook.
       */
      onClusterChange(
        ''
      );
    };

  const allCurrentRowsChecked =
    safeRows.length > 0 &&
    safeRows.every((row) => {
      const key =
        getPickerLineKey(row);

      return Boolean(
        selectedMap[key]
      );
    });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[78vh] w-[92vw] max-w-[1300px] flex-col rounded-sm bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-base font-bold uppercase text-slate-800">
              Chọn công đoạn
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Chọn chủng loại, sau đó chọn mã chứng từ - tên nhóm chủng loại và tick công đoạn.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="grid grid-cols-1 gap-4 border-b border-slate-200 p-5 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">
              Chủng loại
            </label>

            <select
              value={
                productCategoryId
              }
              onChange={(event) =>
                handleProductCategoryChange(
                  event.target.value
                )
              }
              className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">
                -- Chủng loại --
              </option>

              {productCategories.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.code
                      ? `${item.code} - ${item.name}`
                      : item.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold text-slate-600">
              Nhóm chủng loại
            </label>

            <select
              value={
                operationClusterId
              }
              onChange={(event) =>
                onClusterChange(
                  event.target.value
                )
              }
              disabled={
                !productCategoryId
              }
              className="w-full rounded-sm border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">
                {productCategoryId
                  ? '-- Nhóm chủng loại --'
                  : '-- Chọn chủng loại trước --'}
              </option>

              {filteredOperationClusters.map(
                (item) => {
                  const documentCode =
                    getDocumentCode(
                      item
                    );

                  const groupName =
                    getCategoryGroupName(
                      item
                    );

                  return (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {documentCode}

                      {groupName
                        ? ` - ${groupName}`
                        : ''}
                    </option>
                  );
                }
              )}
            </select>

            {productCategoryId &&
              filteredOperationClusters.length ===
                0 && (
                <div className="mt-1 text-[11px] text-amber-600">
                  Chủng loại này chưa có chứng từ kho cụm đang sử dụng.
                </div>
              )}
          </div>
        </div>

        {/* Danh sách công đoạn */}
        <div className="min-h-0 flex-1 overflow-auto p-5">
          <div className="mb-2 text-xs text-slate-600">
            Số công đoạn đã chọn:{' '}

            <span className="font-bold text-blue-700">
              {selectedCount}
            </span>
          </div>

          <div className="overflow-auto rounded-sm border border-slate-300">
            <table className="w-full min-w-[1200px] border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  <th className="border border-slate-300 px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={
                        allCurrentRowsChecked
                      }
                      disabled={
                        safeRows.length === 0
                      }
                      onChange={(event) =>
                        onToggleAll(
                          event.target.checked
                        )
                      }
                    />
                  </th>

                  <th className="border border-slate-300 px-2 py-2">
                    STT xếp chuyền
                  </th>

                  <th className="border border-slate-300 px-2 py-2">
                    Tên cụm
                  </th>

                  <th className="border border-slate-300 px-2 py-2">
                    Tên công đoạn
                  </th>

                  <th className="border border-slate-300 px-2 py-2">
                    Bậc thợ
                  </th>

                  <th className="border border-slate-300 px-2 py-2">
                    Code MMTB
                  </th>

                  <th className="border border-slate-300 px-2 py-2">
                    SAM gốc GSD
                  </th>

                  <th className="border border-slate-300 px-2 py-2">
                    Tổng thao tác
                  </th>
                </tr>
              </thead>

              <tbody>
                {safeRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="border border-slate-300 px-4 py-6 text-center text-slate-400"
                    >
                      Chưa có công đoạn. Hãy chọn chứng từ kho cụm.
                    </td>
                  </tr>
                )}

                {rows.map(
                  (row, index) => {
                    const rowKey =
                      getPickerLineKey(
                        row
                      );

                    const checked =
                      Boolean(
                        selectedMap[
                        rowKey
                        ]
                      );

                    return (
                      <tr key={rowKey}>
                        <td className="border border-slate-300 px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            onChange={(
                              event
                            ) =>
                              onToggleRow(
                                row,
                                event
                                  .target
                                  .checked
                              )
                            }
                          />
                        </td>

                        <td className="border border-slate-300 px-2 py-2 text-right">
                          {row.lineOrder ??
                            index + 1}
                        </td>

                        <td className="border border-slate-300 px-2 py-2">
                          {row.clusterName ||
                            ''}
                        </td>

                        <td className="border border-slate-300 px-2 py-2">
                          {row.operationName ||
                            ''}
                        </td>

                        <td className="border border-slate-300 px-2 py-2 text-right">
                          {row.skillGradeLevel ??
                            ''}
                        </td>

                        <td className="border border-slate-300 px-2 py-2">
                          {row.machineCode ||
                            ''}
                        </td>

                        <td className="border border-slate-300 px-2 py-2 text-right">
                          {formatNumber(
                            row.samGsd,
                            4
                          )}
                        </td>

                        <td className="border border-slate-300 px-2 py-2 text-right">
                          {row.totalActions ||
                            0}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={
              selectedCount === 0
            }
            className="rounded-sm bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}