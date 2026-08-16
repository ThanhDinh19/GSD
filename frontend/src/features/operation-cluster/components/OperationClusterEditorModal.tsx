import type {
    OperationClusterOperationView,
} from '../types/operationCluster.types';
import type {
    OperationClusterEditorController,
} from '../hooks/useOperationClusterEditor';

import OperationClusterDashboard from './OperationClusterDashboard';
import OperationClusterHeaderForm from './OperationClusterHeaderForm';
import OperationClusterGroupPanel from './OperationClusterGroupPanel';
import OperationClusterOperationPanel from './OperationClusterOperationPanel';

type WorkOption = {
    id: number;
    workCode: string;
    workName: string;
    statusId: number;
};

type ProductCateOption = {
    id: number;
    productCode: string;
    productName: string;
    statusId: number;
};

type ProductCateGroupOption = {
    id: number;
    cateGroupCode: string;
    cateGroupName: string;
    statusId: number;
};

type OperationClusterEditorModalProps = {
    editor: OperationClusterEditorController;
    saving: boolean;

    works: WorkOption[];
    productCates: ProductCateOption[];
    productCateGroups: ProductCateGroupOption[];

    worksLoading: boolean;
    productCatesLoading: boolean;
    productCateGroupsLoading: boolean;

    onSave: () => void;
    onOpenOperationActions: (
        operation: OperationClusterOperationView
    ) => void;
};

export default function OperationClusterEditorModal({
    editor,
    saving,

    works,
    productCates,
    productCateGroups,

    worksLoading,
    productCatesLoading,
    productCateGroupsLoading,

    onSave,
    onOpenOperationActions,
}: OperationClusterEditorModalProps) {
    const {
        isCreateModalOpen,
        editingId,

        form,
        activeGroupIndex,
        viewAllGroups,
        enrichedGroups,
        visibleOperations,
        dashboard,
        groupContextMenu,

        handleCancelEditor,

        handleDocumentCodeChange,
        handleWorkIdChange,
        handleProductCategoryIdChange,
        handleProductCategoryGroupIdChange,
        handleChangeHeaderEfficiency,
        handleStatusChange,
        handlePriceMethodChange,
        handleNoteChange,

        handleAddGroup,
        handleSelectGroup,
        handleOpenGroupContextMenu,
        handleCloseGroupContextMenu,
        handleInsertGroupBelow,
        handleDeleteGroup,
        handleChangeGroupName,

        handleOpenGroupOverview,
        handleOpenGsdPopup,
        handleOpenCoefficientPopup,

        handleChangeLineBalanceNo,
        handleChangeManpower,
        handleChangeOperationEfficiency,
        handleRemoveOperation,
    } = editor;

    if (!isCreateModalOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[80] bg-slate-900/40 flex items-center justify-center p-3">
            <div className="w-[98vw] h-[94vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            {editingId
                                ? 'Sửa cụm công đoạn'
                                : 'Khai báo cụm công đoạn'}
                        </h2>

                        <p className="text-xs text-slate-500 mt-0.5">
                            Nhập thông tin chứng từ, tạo cụm và chọn công đoạn GSD.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleCancelEditor}
                            className="px-4 py-2 rounded-sm border border-rose-200 bg-rose-50 text-sm text-rose-700 hover:bg-rose-100"
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving}
                            className="px-5 py-2 rounded-sm bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving
                                ? 'Đang lưu...'
                                : editingId
                                  ? 'Cập nhật'
                                  : 'Lưu'}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancelEditor}
                            className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 bg-slate-50 p-3 overflow-hidden">
                    <div className="max-w-[1760px] mx-auto h-full min-h-0 flex flex-col gap-3">
                        <OperationClusterDashboard
                            data={dashboard}
                        />

                        <OperationClusterHeaderForm
                            form={form}
                            works={works}
                            productCates={productCates}
                            productCateGroups={productCateGroups}
                            worksLoading={worksLoading}
                            productCatesLoading={productCatesLoading}
                            productCateGroupsLoading={productCateGroupsLoading}
                            onDocumentCodeChange={handleDocumentCodeChange}
                            onWorkIdChange={handleWorkIdChange}
                            onProductCategoryIdChange={handleProductCategoryIdChange}
                            onProductCategoryGroupIdChange={handleProductCategoryGroupIdChange}
                            onEfficiencyChange={handleChangeHeaderEfficiency}
                            onStatusChange={handleStatusChange}
                            onPriceMethodChange={handlePriceMethodChange}
                            onNoteChange={handleNoteChange}
                        />

                        <div className="grid grid-cols-[400px_minmax(0,1fr)] gap-3 flex-1 min-h-0">
                            <OperationClusterGroupPanel
                                groups={enrichedGroups}
                                activeGroupIndex={activeGroupIndex}
                                viewAllGroups={viewAllGroups}
                                contextMenu={groupContextMenu}
                                onAddGroup={handleAddGroup}
                                onSelectGroup={handleSelectGroup}
                                onOpenContextMenu={handleOpenGroupContextMenu}
                                onCloseContextMenu={handleCloseGroupContextMenu}
                                onInsertGroupBelow={handleInsertGroupBelow}
                                onDeleteGroup={handleDeleteGroup}
                                onChangeGroupName={handleChangeGroupName}
                            />

                            <OperationClusterOperationPanel
                                operations={visibleOperations}
                                viewAllGroups={viewAllGroups}
                                activeGroupName={
                                    enrichedGroups[
                                        activeGroupIndex
                                    ]?.cluster_name || ''
                                }
                                formRequiredEfficiency={
                                    form.required_efficiency
                                }
                                onOpenOverview={handleOpenGroupOverview}
                                onOpenGsd={handleOpenGsdPopup}
                                onOpenOperationActions={onOpenOperationActions}
                                onOpenCoefficientPopup={handleOpenCoefficientPopup}
                                onChangeLineBalanceNo={handleChangeLineBalanceNo}
                                onChangeManpower={handleChangeManpower}
                                onChangeEfficiency={handleChangeOperationEfficiency}
                                onRemoveOperation={handleRemoveOperation}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}