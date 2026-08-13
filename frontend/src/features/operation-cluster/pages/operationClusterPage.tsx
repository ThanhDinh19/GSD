import {
    useOperationClusters,
} from '../hooks/useOperationClusters';
import {
    useOperationClusterEditor,
} from '../hooks/useOperationClusterEditor';
import {
    useOperationClusterWorkflow,
} from '../hooks/useOperationClusterWorkflow';

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
    useSalaryCoefficients,
} from '../../../hooks/useSalaryCoefficient';

import {
    usePermissions,
} from '../../auth/hooks/usePermissions';
import {
    SCREEN,
} from '../../auth/constants/permission.constants';

import OperationClusterToolbar from '../components/OperationClusterToolbar';
import OperationClusterListTable from '../components/OperationClusterListTable';
import OperationClusterEditorModal from '../components/OperationClusterEditorModal';
import SalaryCoefficientModal from '../components/SalaryCoefficientModal';
import OperationActionsModal from '../components/OperationActionsModal';
import GsdPickerModal from '../components/GsdPickerModal';
import OperationClusterDetailModal from '../components/OperationClusterDetailModal';
import GroupOverviewModal from '../components/GroupOverviewModal';

export default function OperationClusterPage() {
    const permissions = usePermissions(SCREEN.OPERATION_CLUSTER);

    const {
        items,
        loading,
        gsdOptions,
        saving,
        createItem,
        copyItem,
        updateItem,
        loadItems,
        loadDetail,
        selectedDetail,
        setSelectedDetail,
        loadGsdActions,
    } = useOperationClusters();

    const editor =
        useOperationClusterEditor({
            gsdOptions,
            loadGsdActions,
        });

    const {
        formMode,
        editingId,

        form,
        groups,
        requiredEfficiency,
        enrichedGroups,

        isGroupOverviewOpen,

        isGsdPopupOpen,
        gsdSearch,
        checkedGsdIds,
        gsdActionsMap,
        loadingActionIds,
        filteredGsdOptions,
        checkedGsds,

        coefficientPopup,
        coefficientSearch,

        handleOpenCreateModal,
        closeEditorAfterSave,
        openEditFromDetail,
        openCopyFromDetail,

        handleCloseGroupOverview,

        setGsdSearch,
        handleCloseGsdPopup,
        handleToggleGsd,
        handleConfirmSelectGsd,

        setCoefficientSearch,
        handleSelectSalaryCoefficient,
        handleCloseCoefficientPopup,
    } = editor;

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

    const {
        salaryCoefficients,
        skillGrades,
        loading: salaryCoefficientLoading,
    } = useSalaryCoefficients();

    const workflow =
        useOperationClusterWorkflow({
            form,
            groups,
            requiredEfficiency,
            formMode,
            editingId,

            loadItems,
            loadDetail,
            loadGsdActions,

            createItem,
            updateItem,
            copyItem,

            setSelectedDetail,

            openEditFromDetail,
            openCopyFromDetail,
            closeEditorAfterSave,
        });

    const {
        selectedSavedId,
        setSelectedSavedId,

        isSavedDetailOpen,
        previewImageUrl,

        operationActionPopup,
        operationActions,
        loadingOperationActions,

        handleExportExcel,
        handleEdit,
        handleCopy,
        handleSave,
        handleViewSavedDocument,

        handleOpenOperationActions,
        handleCloseOperationActions,

        handleCloseSavedDetail,
        handlePreviewImage,
        handleClosePreview,
    } = workflow;

    const getSkillLevelText = (
        levelId: number | null | undefined
    ) => {
        const skill = skillGrades.find(
            (item) =>
                item.id === levelId
        );

        return skill
            ? skill.level
            : levelId || '-';
    };

    if (!permissions.canView) {
        return (
            <div className="p-6 text-sm text-red-600">
                Bạn không có quyền xem màn hình này.
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 bg-slate-50 p-4 overflow-auto bg-white">
            <div className="max-w-[1720px] mx-auto space-y-4">
                <OperationClusterToolbar
                    canCreate={permissions.canCreate}
                    canUpdate={permissions.canUpdate}
                    canExport={permissions.canExport}
                    selectedId={selectedSavedId}
                    loading={loading}
                    onNew={handleOpenCreateModal}
                    onEdit={handleEdit}
                    onCopy={handleCopy}
                    onExport={handleExportExcel}
                    onRefresh={loadItems}
                />

                <OperationClusterListTable
                    items={items}
                    loading={loading}
                    selectedId={selectedSavedId}
                    onSelect={setSelectedSavedId}
                    onView={handleViewSavedDocument}
                />

                <OperationClusterEditorModal
                    editor={editor}
                    saving={saving}
                    works={works}
                    productCates={productCates}
                    productCateGroups={productCateGroups}
                    worksLoading={worksLoading}
                    productCatesLoading={productCatesLoading}
                    productCateGroupsLoading={productCateGroupsLoading}
                    onSave={handleSave}
                    onOpenOperationActions={handleOpenOperationActions}
                />
            </div>

            <OperationClusterDetailModal
                open={isSavedDetailOpen}
                detail={selectedDetail}
                previewImageUrl={previewImageUrl}
                onEdit={handleEdit}
                onClose={handleCloseSavedDetail}
                onPreviewImage={handlePreviewImage}
                onClosePreview={handleClosePreview}
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

            <SalaryCoefficientModal
                open={Boolean(coefficientPopup)}
                search={coefficientSearch}
                loading={salaryCoefficientLoading}
                items={salaryCoefficients}
                getSkillLevelText={getSkillLevelText}
                onSearchChange={setCoefficientSearch}
                onSelect={handleSelectSalaryCoefficient}
                onClose={handleCloseCoefficientPopup}
            />

            <OperationActionsModal
                popup={operationActionPopup}
                actions={operationActions}
                loading={loadingOperationActions}
                onClose={handleCloseOperationActions}
            />

            <GroupOverviewModal
                open={isGroupOverviewOpen}
                groups={enrichedGroups}
                requiredEfficiency={requiredEfficiency}
                onClose={handleCloseGroupOverview}
            />
        </div>
    );
}