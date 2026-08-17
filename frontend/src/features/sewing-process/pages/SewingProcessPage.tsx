import {
    Button,
} from '../../../shared/components';


import {
    OperationClusterTreePickerModal
} from '../components/OperationClusterTreePickerModal'

import {
    Plus,
    Edit,
    Import,
    FileDown,
    RefreshCcw,
} from 'lucide-react';

import {
    SewingProcessListTable,
} from '../components/SewingProcessListTable';

import {
    SewingProcessModal,
} from '../components/SewingProcessModal';

import {
    SewingProcessForm,
} from '../components/SewingProcessForm';

import {
    OperationPickerModal,
} from '../components/OperationPickerModal';

import {
    OperationActionsModal,
} from '../components/OperationActionsModal';

import {
    ImagePreviewModal,
} from '../../../shared/components/ImagePreviewModal';

import SewingProcessImportModal
    from '../components/SewingProcessImportModal';

import {
    useOperationClusters,
} from '../../../hooks/useOperationClusters';

import {
    useOperationClusterEditor,
} from '../../operation-cluster/hooks/useOperationClusterEditor';

import {
    useOperationClusterWorkflow,
} from '../../operation-cluster/hooks/useOperationClusterWorkflow';

import {
    useSewingProcessPageController,
} from '../hooks/useSewingProcessPageController';


export default function SewingProcessPage() {
    /*
     * Kho cụm công đoạn vẫn giữ riêng tại Page
     * vì SewingProcessModal đang cần editor + workflow.
     */
    const {
        loading:
        loadingOperationCluster,

        gsdOptions,

        saving:
        savingOperationCluster,

        createItem,
        copyItem,
        updateItem,

        loadItems,
        loadDetail,
        setSelectedDetail,
        loadGsdActions,
    } = useOperationClusters();


    const editor =
        useOperationClusterEditor({
            gsdOptions,
            loadGsdActions,
        });


    const workflow =
        useOperationClusterWorkflow({
            form:
                editor.form,

            groups:
                editor.groups,

            requiredEfficiency:
                editor.requiredEfficiency,

            formMode:
                editor.formMode,

            editingId:
                editor.editingId,

            loadItems,
            loadDetail,
            loadGsdActions,

            createItem,
            updateItem,
            copyItem,

            setSelectedDetail,

            openEditFromDetail:
                editor.openEditFromDetail,

            openCopyFromDetail:
                editor.openCopyFromDetail,

            closeEditorAfterSave:
                editor.closeEditorAfterSave,
        });


    /*
     * Toàn bộ logic chính của Sewing Process
     * đã đưa vào controller.
     */
    const page =
        useSewingProcessPageController();


    const {
        permissions,

        items,
        form,
        result,

        loading,
        calculating,
        saving,

        selectedId,
        modalMode,
        activeTab,

        previewImageUrl,
        previewGsdImageUrl,

        imageUploading,
        importModalOpen,

        activeCustomers,
        activeMachines,

        mainImageFileName,
        mainImageSrc,

        productCateGroups,
        // filteredOperationClusters,

        operationPicker,
        operationActions,

        canModify,
        canCalculate,
        canUploadImage,

        setSelectedId,
        setModalMode,
        setActiveTab,

        setPreviewImageUrl,
        setPreviewGsdImageUrl,

        refresh,

        updateForm,
        updateLine,
        removeLine,

        calculate,

        handleCustomerChange,
        handleMachineChange,

        handleUploadMainImage,
        handleRemoveMainImage,

        openCreate,
        openImport,
        openDetail,
        openEdit,

        save,

        handleExportExcel,
        handleApplyImportedLines,

        closeMainModal,
        closeImportModal,

        operationClusterTreePickerOpen,

        openOperationClusterTreePicker,
        closeOperationClusterTreePicker,
        handleConfirmOperationClusterTree,
    } = page;


    if (!permissions.canView) {
        return (
            <div className='p-6 text-sm text-red-600'>
                Bạn không có quyền xem màn hình này.
            </div>
        );
    }


    return (
        <div className='h-full min-h-0 overflow-auto bg-white p-4'>
            {/* TOOLBAR + LIST */}
            <div className='mx-auto space-y-4'>
                <div className='mb-4 flex items-center justify-between'>
                    <div className='flex gap-2'>
                        {permissions.canCreate && (
                            <Button
                                variant='primary'
                                onClick={openCreate}
                                size='sm'
                                leftIcon={
                                    <Plus className='h-4 w-4' />
                                }
                            >
                                New
                            </Button>
                        )}


                        {permissions.canUpdate && (
                            <Button
                                variant='warning'
                                onClick={openEdit}
                                disabled={!selectedId}
                                size='sm'
                                leftIcon={
                                    <Edit className='h-4 w-4' />
                                }
                            >
                                Edit
                            </Button>
                        )}


                        {permissions.canCreate && (
                            <Button
                                onClick={openImport}
                                size='sm'
                                leftIcon={
                                    <Import className='h-4 w-4' />
                                }
                            >
                                Import
                            </Button>
                        )}


                        {permissions.canExport && (
                            <Button
                                onClick={
                                    handleExportExcel
                                }
                                size='sm'
                                leftIcon={
                                    <FileDown className='h-4 w-4' />
                                }
                            >
                                Export
                            </Button>
                        )}


                        <Button
                            onClick={() => {
                                void refresh();
                            }}
                            loading={loading}
                            loadingText='Loading...'
                            size='sm'
                            leftIcon={
                                <RefreshCcw className='h-4 w-4' />
                            }
                        >
                            Refresh
                        </Button>
                    </div>
                </div>


                <SewingProcessListTable
                    items={items}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onOpenDetail={openDetail}
                    onPreviewImage={
                        setPreviewImageUrl
                    }
                />
            </div>


            {/* SEWING PROCESS MODAL */}
            {modalMode && (
                <SewingProcessModal
                    mode={modalMode}
                    savingSweingProcess={
                        saving
                    }
                    calculating={
                        calculating
                    }
                    onClose={
                        closeMainModal
                    }
                    onEdit={() => {
                        setModalMode(
                            'edit'
                        );
                    }}
                    onSave={
                        save
                    }
                    operationClusterEditor={
                        editor
                    }
                    operationClusterWorkflow={
                        workflow
                    }
                    savingOperationCluster={
                        savingOperationCluster
                    }
                >
                    <SewingProcessForm
                        form={form}
                        result={result}
                        customers={
                            activeCustomers
                        }
                        machines={
                            activeMachines
                        }
                        readOnly={
                            modalMode ===
                            'view' ||
                            !canModify
                        }
                        canCalculate={
                            canCalculate
                        }
                        canUploadImage={
                            canUploadImage
                        }
                        activeTab={
                            activeTab
                        }
                        calculating={
                            calculating
                        }
                        imageSrc={
                            mainImageSrc
                        }
                        imageFileName={
                            mainImageFileName
                        }
                        imageUploading={
                            imageUploading
                        }
                        onUpdateForm={
                            updateForm
                        }
                        onUpdateLine={
                            updateLine
                        }
                        onCustomerChange={
                            handleCustomerChange
                        }
                        onMachineChange={
                            handleMachineChange
                        }
                        onRemoveLine={
                            removeLine
                        }
                        onOpenActions={
                            operationActions
                                .open
                        }
                        onPreviewImage={
                            setPreviewGsdImageUrl
                        }
                        onUploadImage={
                            handleUploadMainImage
                        }
                        onRemoveImage={
                            handleRemoveMainImage
                        }
                        onOpenOperationPicker={
                            openOperationClusterTreePicker
                        }
                        onCalculate={
                            calculate
                        }
                        onActiveTabChange={
                            setActiveTab
                        }
                    />
                </SewingProcessModal>
            )}


            {/* IMPORT EXCEL */}
            {importModalOpen && (
                <SewingProcessImportModal
                    open={
                        importModalOpen
                    }
                    header={
                        form
                    }
                    onClose={
                        closeImportModal
                    }
                    onApply={
                        handleApplyImportedLines
                    }
                />
            )}


            {/* OPERATION PICKER */}
            {/* {operationPicker.state.isOpen && (
                <OperationPickerModal
                    productCateGroups={
                        productCateGroups
                    }
                    operationClusters={
                        filteredOperationClusters
                    }
                    productCateGroupId={
                        operationPicker
                            .state
                            .productCategoryGroupId
                    }
                    operationClusterId={
                        operationPicker
                            .state
                            .operationClusterId
                    }
                    rows={
                        operationPicker
                            .state
                            .rows
                    }
                    selectedMap={
                        operationPicker
                            .state
                            .selectedMap
                    }
                    selectedCount={
                        operationPicker
                            .state
                            .selectedCount
                    }
                    onProductCateGroupChange={
                        operationPicker
                            .actions
                            .changeProductCategoryGroup
                    }
                    onClusterChange={
                        operationPicker
                            .actions
                            .changeCluster
                    }
                    onToggleRow={
                        operationPicker
                            .actions
                            .toggleRow
                    }
                    onToggleAll={
                        operationPicker
                            .actions
                            .toggleAll
                    }
                    onConfirm={
                        operationPicker
                            .actions
                            .confirm
                    }
                    onClose={
                        operationPicker
                            .actions
                            .close
                    }
                />
            )} */}
            {/* OPERATION CLUSTER TREE PICKER */}
            {operationClusterTreePickerOpen && (
                <OperationClusterTreePickerModal
                    open={
                        operationClusterTreePickerOpen
                    }
                    onClose={
                        closeOperationClusterTreePicker
                    }
                    onConfirm={
                        handleConfirmOperationClusterTree
                    }
                />
            )}


            {/* OPERATION ACTIONS */}
            {operationActions.modal && (
                <OperationActionsModal
                    title={
                        operationActions
                            .modal
                            .title
                    }
                    loading={
                        operationActions
                            .modal
                            .loading
                    }
                    rows={
                        operationActions
                            .modal
                            .rows
                    }
                    onClose={
                        operationActions
                            .close
                    }
                />
            )}


            {/* PREVIEW MAIN IMAGE */}
            {previewImageUrl && (
                <ImagePreviewModal
                    imageUrl={
                        previewImageUrl
                    }
                    onClose={() => {
                        setPreviewImageUrl(
                            ''
                        );
                    }}
                />
            )}


            {/* PREVIEW GSD IMAGE */}
            {previewGsdImageUrl && (
                <ImagePreviewModal
                    imageUrl={
                        previewGsdImageUrl
                    }
                    onClose={() => {
                        setPreviewGsdImageUrl(
                            ''
                        );
                    }}
                />
            )}
        </div>
    );
}
