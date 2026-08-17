import {
    useRef,
    useState,
} from 'react';

import {
    Maximize2,
    Minimize2,
    X,
} from 'lucide-react';

import type {
    OperationClusterOperationView,
} from '../types/operationCluster.types';

import type {
    OperationClusterEditorController,
} from '../hooks/useOperationClusterEditor';

import OperationClusterDashboard
    from './OperationClusterDashboard';

import OperationClusterHeaderForm
    from './OperationClusterHeaderForm';

import OperationClusterGroupPanel
    from './OperationClusterGroupPanel';

import OperationClusterOperationPanel
    from './OperationClusterOperationPanel';


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
    editor:
        OperationClusterEditorController;

    saving:
        boolean;

    works:
        WorkOption[];

    productCates:
        ProductCateOption[];

    productCateGroups:
        ProductCateGroupOption[];

    worksLoading:
        boolean;

    productCatesLoading:
        boolean;

    productCateGroupsLoading:
        boolean;

    onSave:
        () => void;

    onOpenOperationActions:
        (
            operation:
                OperationClusterOperationView
        ) => void;
};


type ResizeDirection =
    | 'nw'
    | 'ne'
    | 'sw'
    | 'se';


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


    const [
        isMaximized,
        setIsMaximized,
    ] = useState(false);


    const [
        windowRect,
        setWindowRect,
    ] = useState(() => ({
        x: 12,
        y: 12,

        width:
            Math.max(
                1000,
                window.innerWidth - 24
            ),

        height:
            Math.max(
                650,
                window.innerHeight - 24
            ),
    }));


    const restoreRectRef =
        useRef(
            windowRect
        );


    const dragRef =
        useRef<{
            pointerId:
                number;

            startX:
                number;

            startY:
                number;

            startLeft:
                number;

            startTop:
                number;
        } | null>(
            null
        );


    const resizeRef =
        useRef<{
            pointerId:
                number;

            startX:
                number;

            startY:
                number;

            startLeft:
                number;

            startTop:
                number;

            startWidth:
                number;

            startHeight:
                number;

            direction:
                ResizeDirection;
        } | null>(
            null
        );


    if (
        !isCreateModalOpen
    ) {
        return null;
    }


    const toggleMaximize =
        () => {
            if (
                isMaximized
            ) {
                setWindowRect(
                    restoreRectRef.current
                );

                setIsMaximized(
                    false
                );

                return;
            }


            restoreRectRef.current =
                windowRect;


            setWindowRect({
                x: 4,
                y: 4,

                width:
                    window.innerWidth -
                    8,

                height:
                    window.innerHeight -
                    8,
            });


            setIsMaximized(
                true
            );
        };


    const handleTitlePointerDown =
        (
            event:
                React.PointerEvent<HTMLDivElement>
        ) => {
            if (
                isMaximized
            ) {
                return;
            }


            dragRef.current = {
                pointerId:
                    event.pointerId,

                startX:
                    event.clientX,

                startY:
                    event.clientY,

                startLeft:
                    windowRect.x,

                startTop:
                    windowRect.y,
            };


            event.currentTarget
                .setPointerCapture(
                    event.pointerId
                );
        };


    const handleTitlePointerMove =
        (
            event:
                React.PointerEvent<HTMLDivElement>
        ) => {
            const drag =
                dragRef.current;


            if (
                !drag ||
                drag.pointerId !==
                event.pointerId
            ) {
                return;
            }


            const nextX =
                drag.startLeft +
                event.clientX -
                drag.startX;


            const nextY =
                drag.startTop +
                event.clientY -
                drag.startY;


            setWindowRect(
                (
                    previous
                ) => ({
                    ...previous,

                    x:
                        Math.min(
                            Math.max(
                                nextX,
                                0
                            ),

                            Math.max(
                                window.innerWidth -
                                120,
                                0
                            )
                        ),

                    y:
                        Math.min(
                            Math.max(
                                nextY,
                                0
                            ),

                            Math.max(
                                window.innerHeight -
                                40,
                                0
                            )
                        ),
                })
            );
        };


    const handleTitlePointerUp =
        (
            event:
                React.PointerEvent<HTMLDivElement>
        ) => {
            if (
                dragRef.current
                    ?.pointerId !==
                event.pointerId
            ) {
                return;
            }


            dragRef.current =
                null;


            event.currentTarget
                .releasePointerCapture(
                    event.pointerId
                );
        };


    const handleResizePointerDown =
        (
            event:
                React.PointerEvent<HTMLDivElement>,

            direction:
                ResizeDirection
        ) => {
            if (
                isMaximized
            ) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            resizeRef.current = {
                pointerId:
                    event.pointerId,

                startX:
                    event.clientX,

                startY:
                    event.clientY,

                startLeft:
                    windowRect.x,

                startTop:
                    windowRect.y,

                startWidth:
                    windowRect.width,

                startHeight:
                    windowRect.height,

                direction,
            };


            event.currentTarget
                .setPointerCapture(
                    event.pointerId
                );
        };


    const handleResizePointerMove =
        (
            event:
                React.PointerEvent<HTMLDivElement>
        ) => {
            const resize =
                resizeRef.current;


            if (
                !resize ||
                resize.pointerId !==
                event.pointerId
            ) {
                return;
            }


            const deltaX =
                event.clientX -
                resize.startX;


            const deltaY =
                event.clientY -
                resize.startY;


            const minWidth =
                Math.min(
                    900,
                    window.innerWidth -
                    16
                );


            const minHeight =
                Math.min(
                    600,
                    window.innerHeight -
                    16
                );


            let left =
                resize.startLeft;

            let top =
                resize.startTop;

            let right =
                resize.startLeft +
                resize.startWidth;

            let bottom =
                resize.startTop +
                resize.startHeight;


            if (
                resize.direction.includes(
                    'e'
                )
            ) {
                right =
                    Math.min(
                        window.innerWidth,

                        Math.max(
                            left +
                            minWidth,

                            resize.startLeft +
                            resize.startWidth +
                            deltaX
                        )
                    );
            }


            if (
                resize.direction.includes(
                    'w'
                )
            ) {
                left =
                    Math.max(
                        0,

                        Math.min(
                            right -
                            minWidth,

                            resize.startLeft +
                            deltaX
                        )
                    );
            }


            if (
                resize.direction.includes(
                    's'
                )
            ) {
                bottom =
                    Math.min(
                        window.innerHeight,

                        Math.max(
                            top +
                            minHeight,

                            resize.startTop +
                            resize.startHeight +
                            deltaY
                        )
                    );
            }


            if (
                resize.direction.includes(
                    'n'
                )
            ) {
                top =
                    Math.max(
                        0,

                        Math.min(
                            bottom -
                            minHeight,

                            resize.startTop +
                            deltaY
                        )
                    );
            }


            setWindowRect({
                x:
                    left,

                y:
                    top,

                width:
                    right -
                    left,

                height:
                    bottom -
                    top,
            });
        };


    const handleResizePointerUp =
        (
            event:
                React.PointerEvent<HTMLDivElement>
        ) => {
            if (
                resizeRef.current
                    ?.pointerId !==
                event.pointerId
            ) {
                return;
            }


            resizeRef.current =
                null;


            event.currentTarget
                .releasePointerCapture(
                    event.pointerId
                );
        };


    return (
        <div className='fixed inset-0 z-[80] bg-slate-900/40'>
            <div
                className='absolute flex flex-col overflow-hidden border border-slate-400 bg-white shadow-2xl'
                style={{
                    left:
                        windowRect.x,

                    top:
                        windowRect.y,

                    width:
                        windowRect.width,

                    height:
                        windowRect.height,
                }}
            >
                {/* TITLE BAR */}
                <div
                    onDoubleClick={
                        toggleMaximize
                    }
                    onPointerDown={
                        handleTitlePointerDown
                    }
                    onPointerMove={
                        handleTitlePointerMove
                    }
                    onPointerUp={
                        handleTitlePointerUp
                    }
                    className='flex h-11 shrink-0 cursor-default select-none items-center justify-between border-b border-slate-300 bg-slate-100 pl-4'
                >
                    <div className='min-w-0'>
                        <h2 className='truncate text-sm font-bold text-slate-800'>
                            {editingId
                                ? 'Sửa cụm công đoạn'
                                : 'Khai báo cụm công đoạn'}
                        </h2>

                        <p className='truncate text-[11px] text-slate-500'>
                            Nhập thông tin chứng từ, tạo cụm và chọn công đoạn GSD.
                        </p>
                    </div>


                    <div className='flex h-full shrink-0 items-center'>
                        <button
                            type='button'
                            onPointerDown={(
                                event
                            ) =>
                                event.stopPropagation()
                            }
                            onClick={
                                toggleMaximize
                            }
                            className='flex h-full w-11 items-center justify-center text-slate-600 hover:bg-slate-200'
                            title={
                                isMaximized
                                    ? 'Khôi phục'
                                    : 'Phóng to'
                            }
                        >
                            {isMaximized ? (
                                <Minimize2 className='h-4 w-4' />
                            ) : (
                                <Maximize2 className='h-4 w-4' />
                            )}
                        </button>


                        <button
                            type='button'
                            onPointerDown={(
                                event
                            ) =>
                                event.stopPropagation()
                            }
                            onClick={
                                handleCancelEditor
                            }
                            className='flex h-full w-11 items-center justify-center text-slate-600 hover:bg-red-500 hover:text-white'
                            title='Đóng'
                        >
                            <X className='h-4 w-4' />
                        </button>
                    </div>
                </div>


                {/* BODY */}
                <div className='min-h-0 flex-1 overflow-hidden bg-slate-50 p-3'>
                    <div className='mx-auto flex h-full min-h-0 max-w-[1760px] flex-col gap-3'>
                        <OperationClusterDashboard
                            data={
                                dashboard
                            }
                        />


                        <OperationClusterHeaderForm
                            form={
                                form
                            }
                            works={
                                works
                            }
                            productCates={
                                productCates
                            }
                            productCateGroups={
                                productCateGroups
                            }
                            worksLoading={
                                worksLoading
                            }
                            productCatesLoading={
                                productCatesLoading
                            }
                            productCateGroupsLoading={
                                productCateGroupsLoading
                            }
                            onDocumentCodeChange={
                                handleDocumentCodeChange
                            }
                            onWorkIdChange={
                                handleWorkIdChange
                            }
                            onProductCategoryIdChange={
                                handleProductCategoryIdChange
                            }
                            onProductCategoryGroupIdChange={
                                handleProductCategoryGroupIdChange
                            }
                            onEfficiencyChange={
                                handleChangeHeaderEfficiency
                            }
                            onStatusChange={
                                handleStatusChange
                            }
                            onPriceMethodChange={
                                handlePriceMethodChange
                            }
                            onNoteChange={
                                handleNoteChange
                            }
                        />


                        <div className='grid min-h-0 flex-1 grid-cols-[400px_minmax(0,1fr)] gap-3'>
                            <OperationClusterGroupPanel
                                groups={
                                    enrichedGroups
                                }
                                activeGroupIndex={
                                    activeGroupIndex
                                }
                                viewAllGroups={
                                    viewAllGroups
                                }
                                contextMenu={
                                    groupContextMenu
                                }
                                onAddGroup={
                                    handleAddGroup
                                }
                                onSelectGroup={
                                    handleSelectGroup
                                }
                                onOpenContextMenu={
                                    handleOpenGroupContextMenu
                                }
                                onCloseContextMenu={
                                    handleCloseGroupContextMenu
                                }
                                onInsertGroupBelow={
                                    handleInsertGroupBelow
                                }
                                onDeleteGroup={
                                    handleDeleteGroup
                                }
                                onChangeGroupName={
                                    handleChangeGroupName
                                }
                            />


                            <OperationClusterOperationPanel
                                operations={
                                    visibleOperations
                                }
                                viewAllGroups={
                                    viewAllGroups
                                }
                                activeGroupName={
                                    enrichedGroups[
                                        activeGroupIndex
                                    ]?.cluster_name ||
                                    ''
                                }
                                formRequiredEfficiency={
                                    form.required_efficiency
                                }
                                onOpenOverview={
                                    handleOpenGroupOverview
                                }
                                onOpenGsd={
                                    handleOpenGsdPopup
                                }
                                onOpenOperationActions={
                                    onOpenOperationActions
                                }
                                onOpenCoefficientPopup={
                                    handleOpenCoefficientPopup
                                }
                                onChangeLineBalanceNo={
                                    handleChangeLineBalanceNo
                                }
                                onChangeManpower={
                                    handleChangeManpower
                                }
                                onChangeEfficiency={
                                    handleChangeOperationEfficiency
                                }
                                onRemoveOperation={
                                    handleRemoveOperation
                                }
                            />
                        </div>
                    </div>
                </div>


                {/* FOOTER */}
                <div className='flex h-12 shrink-0 items-center justify-end gap-2 border-t border-slate-300 bg-white px-4'>
                    <button
                        type='button'
                        onClick={
                            handleCancelEditor
                        }
                        className='h-8 rounded border border-rose-200 bg-rose-50 px-4 text-sm text-rose-700 hover:bg-rose-100'
                    >
                        Hủy
                    </button>


                    <button
                        type='button'
                        onClick={
                            onSave
                        }
                        disabled={
                            saving
                        }
                        className='h-8 rounded bg-blue-600 px-5 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        {saving
                            ? 'Đang lưu...'
                            : editingId
                                ? 'Cập nhật'
                                : 'Lưu'}
                    </button>
                </div>


                {/* RESIZE HANDLES */}
                {!isMaximized && (
                    <>
                        <div
                            onPointerDown={(
                                event
                            ) =>
                                handleResizePointerDown(
                                    event,
                                    'nw'
                                )
                            }
                            onPointerMove={
                                handleResizePointerMove
                            }
                            onPointerUp={
                                handleResizePointerUp
                            }
                            className='absolute left-0 top-0 z-50 h-3 w-3 cursor-nw-resize'
                        >
                            <div className='absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-slate-400' />
                        </div>


                        <div
                            onPointerDown={(
                                event
                            ) =>
                                handleResizePointerDown(
                                    event,
                                    'ne'
                                )
                            }
                            onPointerMove={
                                handleResizePointerMove
                            }
                            onPointerUp={
                                handleResizePointerUp
                            }
                            className='absolute right-0 top-0 z-50 h-3 w-3 cursor-ne-resize'
                        >
                            <div className='absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-slate-400' />
                        </div>


                        <div
                            onPointerDown={(
                                event
                            ) =>
                                handleResizePointerDown(
                                    event,
                                    'sw'
                                )
                            }
                            onPointerMove={
                                handleResizePointerMove
                            }
                            onPointerUp={
                                handleResizePointerUp
                            }
                            className='absolute bottom-0 left-0 z-50 h-3 w-3 cursor-sw-resize'
                        >
                            <div className='absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-slate-400' />
                        </div>


                        <div
                            onPointerDown={(
                                event
                            ) =>
                                handleResizePointerDown(
                                    event,
                                    'se'
                                )
                            }
                            onPointerMove={
                                handleResizePointerMove
                            }
                            onPointerUp={
                                handleResizePointerUp
                            }
                            className='absolute bottom-0 right-0 z-50 h-3 w-3 cursor-se-resize'
                        >
                            <div className='absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-slate-400' />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}