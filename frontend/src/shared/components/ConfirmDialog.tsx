import type {
  ReactNode,
} from 'react';

type ConfirmDialogVariant =
  | 'default'
  | 'danger';

export type ConfirmDialogProps = {
  open: boolean;

  title: string;
  message: ReactNode;

  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;

  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Popup xác nhận gọn, thay cho window.confirm() của trình duyệt.
 * Bấm ra ngoài overlay tương đương bấm Hủy.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  const isDanger =
    variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] rounded-lg bg-white p-5 shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold ${
              isDanger
                ? 'bg-red-100 text-red-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {isDanger ? '!' : '?'}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-sm font-bold text-slate-800">
              {title}
            </h3>

            <div className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {message}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-sm px-4 py-2 text-sm font-semibold text-white ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
