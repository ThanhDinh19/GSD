import {
  useRef,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import {
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';

import {
  usePermissions,
} from '../../auth/hooks/usePermissions';

import {
  SCREEN,
} from '../../auth/constants/permission.constants';

import {
  Button,
} from '../../../shared/components';

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

import OperationClusterEditorModal
  from '../../operation-cluster/components/OperationClusterEditorModal';

import GsdPickerModal
  from '../../operation-cluster/components/GsdPickerModal';

import type {
  OperationClusterEditorController,
} from '../../operation-cluster/hooks/useOperationClusterEditor';


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

  operationClusterEditor:
    OperationClusterEditorController;

  operationClusterWorkflow:
    ReturnType<
      typeof useOperationClusterWorkflow
    >;

  children: ReactNode;
};


type ResizeDirection =
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se';


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
  const permissionSewingProcess =
    usePermissions(
      SCREEN.SEWING_PROCESS
    );

  const permissionOperationCluster =
    usePermissions(
      SCREEN.OPERATION_CLUSTER
    );


  const [
    isMaximized,
    setIsMaximized,
  ] = useState(false);


  const [
    windowRect,
    setWindowRect,
  ] = useState(() => ({
    x: 8,
    y: 8,

    width:
      Math.max(
        900,
        window.innerWidth - 16
      ),

    height:
      Math.max(
        600,
        window.innerHeight - 16
      ),
  }));


  const restoreRectRef =
    useRef(
      windowRect
    );


  const dragRef =
    useRef<{
      pointerId: number;

      startX: number;
      startY: number;

      startLeft: number;
      startTop: number;
    } | null>(
      null
    );


  const resizeRef =
    useRef<{
      pointerId: number;

      startX: number;
      startY: number;

      startLeft: number;
      startTop: number;

      startWidth: number;
      startHeight: number;

      direction:
        ResizeDirection;
    } | null>(
      null
    );


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
    loading:
      worksLoading,
  } = useWorks();


  const {
    productCates,
    loading:
      productCatesLoading,
  } = useProductCates();


  const {
    productCateGroups,
    loading:
      productCateGroupsLoading,
  } = useProductCateGroups();


  const isViewMode =
    mode === 'view';


  const title =
    mode === 'create'
      ? 'Thêm mới bảng quy trình may'
      : mode === 'edit'
        ? 'Sửa bảng quy trình may'
        : 'Chi tiết bảng quy trình may';


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
          window.innerWidth - 8,

        height:
          window.innerHeight - 8,
      });


      setIsMaximized(
        true
      );
    };


  const handleTitlePointerDown = (
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


  const handleTitlePointerMove = (
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
      (previous) => ({
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


  const handleTitlePointerUp = (
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


  const handleResizePointerDown = (
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


  const handleResizePointerMove = (
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
        850,
        window.innerWidth - 16
      );


    const minHeight =
      Math.min(
        550,
        window.innerHeight - 16
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


  const handleResizePointerUp = (
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
    <div className='fixed inset-0 z-50 bg-black/25'>
      {/* MAIN WINDOW */}
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
          className='flex h-10 shrink-0 cursor-default select-none items-center justify-between border-b border-slate-300 bg-slate-100 pl-4'
        >
          <div className='min-w-0'>
            <h3 className='truncate text-sm font-bold uppercase text-slate-800'>
              {title}
            </h3>

            <p className='truncate text-[11px] text-slate-500'>
              {isViewMode
                ? 'Đang ở chế độ xem. Bấm Sửa để chỉnh dữ liệu.'
                : 'Nhập thông tin, bấm Tính rồi Lưu chứng từ.'}
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
                onClose
              }
              className='flex h-full w-11 items-center justify-center text-slate-600 hover:bg-red-500 hover:text-white'
              title='Đóng'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        </div>


        {/* BODY */}
        <div className='min-h-0 flex-1 overflow-auto bg-slate-50 p-5'>
          {children}
        </div>


        {/* FOOTER */}
        <div className='flex h-12 shrink-0 items-center justify-end gap-2 border-t border-slate-300 bg-white px-4'>
          {isViewMode ? (
            permissionSewingProcess.canUpdate && (
              <Button
                variant='warning'
                onClick={
                  onEdit
                }
                size='sm'
              >
                Sửa
              </Button>
            )
          ) : (
            (
              permissionSewingProcess.canUpdate ||
              permissionSewingProcess.canCreate
            ) && (
              <Button
                size='sm'
                variant='success'
                onClick={
                  onSave
                }
                disabled={
                  savingSweingProcess ||
                  calculating
                }
              >
                {savingSweingProcess
                  ? 'Đang lưu...'
                  : 'Lưu'}
              </Button>
            )
          )}


          {permissionOperationCluster.canCreate && (
            <Button
              variant='primary'
              onClick={
                operationClusterEditor
                  .handleOpenCreateModal
              }
              size='sm'
            >
              Thêm cụm công đoạn
            </Button>
          )}


          <Button
            onClick={
              onClose
            }
            size='sm'
          >
            Đóng
          </Button>
        </div>


        {/* RESIZE HANDLES */}
        {!isMaximized && (
          <>
            {/* TOP LEFT */}
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
              title='Resize'
            >
              <div className='absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-slate-400' />
            </div>


            {/* TOP RIGHT */}
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
              title='Resize'
            >
              <div className='absolute right-0 top-0 h-2 w-2 border-r-2 border-t-2 border-slate-400' />
            </div>


            {/* BOTTOM LEFT */}
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
              title='Resize'
            >
              <div className='absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 border-slate-400' />
            </div>


            {/* BOTTOM RIGHT */}
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
              title='Resize'
            >
              <div className='absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-slate-400' />
            </div>
          </>
        )}
      </div>


      {/* OPERATION CLUSTER EDITOR */}
      <OperationClusterEditorModal
        editor={
          operationClusterEditor
        }
        saving={
          savingOperationCluster
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
        onSave={
          operationClusterWorkflow
            .handleSave
        }
        onOpenOperationActions={
          operationClusterWorkflow
            .handleOpenOperationActions
        }
      />


      {/* GSD PICKER */}
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
          handleCloseGsdPopup
        }
        onConfirm={
          handleConfirmSelectGsd
        }
      />
    </div>
  );
}



// import type {
//   ReactNode,
// } from 'react';

// import {
//   usePermissions,
// } from '../../auth/hooks/usePermissions';
// import {
//   SCREEN,
// } from '../../auth/constants/permission.constants';

// import {
//   Button
// } from '../../../shared/components';
// // ---------------------------------------------------------------------
// // import {
// //   useOperationClusterEditor,
// // } from '../../operation-cluster/hooks/useOperationClusterEditor';
// // import {
// //   useOperationClusters,
// // } from '../../../hooks/useOperationClusters';
// import {
//   useWorks,
// } from '../../../hooks/useWorks';
// import {
//   useProductCates,
// } from '../../../hooks/useProductCate';
// import {
//   useProductCateGroups,
// } from '../../../hooks/useProductCateGroup';
// import {
//   useOperationClusterWorkflow,
// } from '../../operation-cluster/hooks/useOperationClusterWorkflow';
// import OperationClusterEditorModal from '../../operation-cluster/components/OperationClusterEditorModal';
// import GsdPickerModal from '../../operation-cluster/components/GsdPickerModal';
// import type {
//   OperationClusterEditorController,
// } from '../../operation-cluster/hooks/useOperationClusterEditor';
// //-----------------------------------------------------------------------

// export type SewingProcessModalMode =
//   | 'create'
//   | 'view'
//   | 'edit';

// type SewingProcessModalProps = {
//   mode: SewingProcessModalMode;

//   savingSweingProcess: boolean;
//   calculating: boolean;
//   savingOperationCluster: boolean;

//   onClose: () => void;
//   onEdit: () => void;
//   onSave: () => void;

//   operationClusterEditor: OperationClusterEditorController;
//   operationClusterWorkflow: ReturnType<typeof useOperationClusterWorkflow>;

//   children: ReactNode;
// };

// export function SewingProcessModal({
//   mode,
//   savingSweingProcess,
//   calculating,
//   savingOperationCluster,

//   onClose,
//   onEdit,
//   onSave,

//   operationClusterEditor,
//   operationClusterWorkflow,

//   children,
// }: SewingProcessModalProps) {

//   const permissionSewingProcess = usePermissions(SCREEN.SEWING_PROCESS);
//   const permissionOperationCluster = usePermissions(SCREEN.OPERATION_CLUSTER);
//   // -----------------------------------------------------------
//   // const {
//   //   gsdOptions,
//   //   loadGsdActions,
//   // } = useOperationClusters();

//   // const editor = useOperationClusterEditor({ gsdOptions, loadGsdActions });

//   const {
//     isGsdPopupOpen,
//     gsdSearch,
//     checkedGsdIds,
//     filteredGsdOptions,
//     checkedGsds,
//     gsdActionsMap,
//     loadingActionIds,
//     setGsdSearch,
//     handleToggleGsd,
//     handleCloseGsdPopup,
//     handleConfirmSelectGsd,
//   } = operationClusterEditor;

//   const {
//     works,
//     loading: worksLoading,
//   } = useWorks();

//   const {
//     productCates,
//     loading: productCatesLoading,
//   } = useProductCates();

//   const {
//     productCateGroups,
//     loading: productCateGroupsLoading,
//   } = useProductCateGroups();

//   // -----------------------------------------------------------

//   const isViewMode =
//     mode === 'view';

//   const title =
//     mode === 'create'
//       ? 'Thêm mới bảng quy trình may'
//       : mode === 'edit'
//         ? 'Sửa bảng quy trình may'
//         : 'Chi tiết bảng quy trình may';


//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//       <div className="flex h-[92vh] w-[96vw] max-w-[1600px] flex-col rounded-sm bg-white shadow-xl">
//         <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
//           <div>
//             <h3 className="text-base font-bold uppercase text-slate-800">
//               {title}
//             </h3>

//             <p className="mt-1 text-xs text-slate-500">
//               {isViewMode
//                 ? 'Đang ở chế độ xem. Bấm Sửa để chỉnh dữ liệu.'
//                 : 'Nhập thông tin, bấm Tính rồi Lưu chứng từ.'}
//             </p>
//           </div>
//         </div>

//         <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-5">
//           {children}
//         </div>

//         <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
//           {isViewMode ? (

//             permissionSewingProcess.canUpdate && (
//               <Button
//                 variant='warning'
//                 onClick={onEdit}
//                 size='sm'
//               >
//                 Sửa
//               </Button>
//             )

//           ) : (
//             (permissionSewingProcess.canUpdate || permissionSewingProcess.canCreate ) && (
//               <Button
//                 size='sm'
//                 variant='success'
//                 onClick={onSave}
//                 disabled={
//                   savingSweingProcess ||
//                   calculating
//                 }              >
//                 {savingSweingProcess
//                   ? 'Đang lưu...'
//                   : 'Lưu'}
//               </Button>
//             )
//           )}

//           {permissionOperationCluster.canCreate && (
//             <Button
//               variant="primary"
//               onClick={
//                 operationClusterEditor.handleOpenCreateModal
//               }
//               size='sm'
//             >
//               Thêm cụm công đoạn
//             </Button>
//           )}


//           <Button
//             onClick={onClose}
//             size='sm'
//           >
//             Đóng
//           </Button>
//         </div>

//       </div>

//       <OperationClusterEditorModal
//         editor={operationClusterEditor}
//         saving={savingOperationCluster}
//         works={works}
//         productCates={productCates}
//         productCateGroups={productCateGroups}
//         worksLoading={worksLoading}
//         productCatesLoading={productCatesLoading}
//         productCateGroupsLoading={productCateGroupsLoading}
//         onSave={operationClusterWorkflow.handleSave}
//         onOpenOperationActions={operationClusterWorkflow.handleOpenOperationActions}
//       />

//       <GsdPickerModal
//         open={isGsdPopupOpen}
//         search={gsdSearch}
//         checkedIds={checkedGsdIds}
//         options={filteredGsdOptions}
//         checkedGsds={checkedGsds}
//         actionsMap={gsdActionsMap}
//         loadingActionIds={loadingActionIds}
//         onSearchChange={setGsdSearch}
//         onToggle={handleToggleGsd}
//         onCancel={handleCloseGsdPopup}
//         onConfirm={handleConfirmSelectGsd}
//       />

//     </div>
//   );
// }


