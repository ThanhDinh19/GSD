import type {
  ReactNode,
} from 'react';

import {
  usePermissions,
} from '../../auth/hooks/usePermissions';
import {
  SCREEN,
} from '../../auth/constants/permission.constants';

import {
  Button
} from '../../../shared/components';
// ---------------------------------------------------------------------
// import {
//   useOperationClusterEditor,
// } from '../../operation-cluster/hooks/useOperationClusterEditor';
// import {
//   useOperationClusters,
// } from '../../../hooks/useOperationClusters';
import {
  useWorks,
} from '../../../hooks/useWorks';
import {
  useProductCates,
} from '../../../hooks/useProductCate';
import {
  useProductCateGroups,
} from '../../../hooks/useProductCateGroup';
import {
  useOperationClusterWorkflow,
} from '../../operation-cluster/hooks/useOperationClusterWorkflow';
import OperationClusterEditorModal from '../../operation-cluster/components/OperationClusterEditorModal';
import GsdPickerModal from '../../operation-cluster/components/GsdPickerModal';
import type {
  OperationClusterEditorController,
} from '../../operation-cluster/hooks/useOperationClusterEditor';
//-----------------------------------------------------------------------

export type SewingProcessModalMode =
  | 'create'
  | 'view'
  | 'edit';

type SewingProcessModalProps = {
  mode: SewingProcessModalMode;

  savingSweingProcess: boolean;
  calculating: boolean;
  savingOperationCluster: boolean;

  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;

  operationClusterEditor: OperationClusterEditorController;
  operationClusterWorkflow: ReturnType<typeof useOperationClusterWorkflow>;

  children: ReactNode;
};

export function SewingProcessModal({
  mode,
  savingSweingProcess,
  calculating,
  savingOperationCluster,

  onClose,
  onEdit,
  onSave,

  operationClusterEditor,
  operationClusterWorkflow,

  children,
}: SewingProcessModalProps) {

  const permissions = usePermissions(SCREEN.SEWING_PROCESS);
  // -----------------------------------------------------------
  // const {
  //   gsdOptions,
  //   loadGsdActions,
  // } = useOperationClusters();

  // const editor = useOperationClusterEditor({ gsdOptions, loadGsdActions });

  const {
    isGsdPopupOpen,
    gsdSearch,
    checkedGsdIds,
    filteredGsdOptions,
    checkedGsds,
    gsdActionsMap,
    loadingActionIds,
    setGsdSearch,
    handleToggleGsd,
    handleCloseGsdPopup,
    handleConfirmSelectGsd,
  } = operationClusterEditor;

  const {
    works,
    loading: worksLoading,
  } = useWorks();

  const {
    productCates,
    loading: productCatesLoading,
  } = useProductCates();

  const {
    productCateGroups,
    loading: productCateGroupsLoading,
  } = useProductCateGroups();

  // -----------------------------------------------------------

  const isViewMode =
    mode === 'view';

  const title =
    mode === 'create'
      ? 'Thêm mới bảng quy trình may'
      : mode === 'edit'
        ? 'Sửa bảng quy trình may'
        : 'Chi tiết bảng quy trình may';


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[92vh] w-[96vw] max-w-[1600px] flex-col rounded-sm bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-base font-bold uppercase text-slate-800">
              {title}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {isViewMode
                ? 'Đang ở chế độ xem. Bấm Sửa để chỉnh dữ liệu.'
                : 'Nhập thông tin, bấm Tính rồi Lưu chứng từ.'}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-5">
          {children}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          {isViewMode ? (

            permissions.canUpdate && (
              <Button
                variant='warning'
                onClick={onEdit}
                size='sm'
              >
                Sửa
              </Button>
            )

          ) : (
            permissions.canUpdate && (
              <Button
                size='sm'
                variant='success'
                onClick={onSave}
                disabled={
                  savingSweingProcess ||
                  calculating
                }              >
                {savingSweingProcess
                  ? 'Đang lưu...'
                  : 'Lưu'}
              </Button>
            )
          )}

          <Button
            variant="primary"
            onClick={
              operationClusterEditor.handleOpenCreateModal
            }
            size='sm'
          >
            Thêm cụm công đoạn
          </Button>

          <Button
            onClick={onClose}
            size='sm'
          >
            Đóng
          </Button>
        </div>

      </div>

      <OperationClusterEditorModal
        editor={operationClusterEditor}
        saving={savingOperationCluster}
        works={works}
        productCates={productCates}
        productCateGroups={productCateGroups}
        worksLoading={worksLoading}
        productCatesLoading={productCatesLoading}
        productCateGroupsLoading={productCateGroupsLoading}
        onSave={operationClusterWorkflow.handleSave}
        onOpenOperationActions={operationClusterWorkflow.handleOpenOperationActions}
      />

      <GsdPickerModal
        open={isGsdPopupOpen}
        search={gsdSearch}
        checkedIds={checkedGsdIds}
        options={filteredGsdOptions}
        checkedGsds={checkedGsds}
        actionsMap={gsdActionsMap}
        loadingActionIds={loadingActionIds}
        onSearchChange={setGsdSearch}
        onToggle={handleToggleGsd}
        onCancel={handleCloseGsdPopup}
        onConfirm={handleConfirmSelectGsd}
      />

    </div>
  );
}