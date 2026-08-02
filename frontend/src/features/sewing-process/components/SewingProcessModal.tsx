import type {
  ReactNode,
} from 'react';

import {
  usePermissions,
} from '../../auth/hooks/usePermissions';
import {
  SCREEN,
} from '../../auth/constants/permission.constants';

export type SewingProcessModalMode =
  | 'create'
  | 'view'
  | 'edit';

type SewingProcessModalProps = {
  mode: SewingProcessModalMode;

  saving: boolean;
  calculating: boolean;

  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;

  children: ReactNode;
};

export function SewingProcessModal({
  mode,
  saving,
  calculating,
  onClose,
  onEdit,
  onSave,
  children,
}: SewingProcessModalProps) {
  const permissions = usePermissions(SCREEN.SEWING_PROCESS);
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
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Đóng
          </button>


          {isViewMode ? (

            permissions.canUpdate && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-sm bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
              >
                Sửa
              </button>
            )

          ) : (
            permissions.canUpdate && (
              <button
                type="button"
                onClick={onSave}
                disabled={
                  saving ||
                  calculating
                }
                className="rounded-sm bg-green-700 px-4 py-2 text-xs font-bold text-white hover:bg-green-800 disabled:opacity-50"
              >
                {saving
                  ? 'Đang lưu...'
                  : 'Lưu'}
              </button>
            )
          )}


        </div>
      </div>
    </div>
  );
}