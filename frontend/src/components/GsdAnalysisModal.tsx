import GsdAnalysisPage from '../pages/GsdAnalysisPage';

type GsdAnalysisModalProps = {
  open: boolean;

  editAnalysisId?: number | null;
  copyAnalysisId?: number | null;

  onClose: () => void;
  onSaveSuccess?: () => void;
};

export default function GsdAnalysisModal({
  open,
  editAnalysisId = null,
  copyAnalysisId = null,
  onClose,
  onSaveSuccess,
}: GsdAnalysisModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3">
      <div className="flex h-[94vh] w-[98vw] max-w-[1800px] flex-col overflow-hidden rounded-sm bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-bold uppercase text-slate-800">
            Phân tích công đoạn GSD
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-4">
          <GsdAnalysisPage
            editAnalysisId={editAnalysisId}
            copyAnalysisId={copyAnalysisId}
            onSaveSuccess={onSaveSuccess}
            onCancel={onClose}
          />
        </div>

      </div>
    </div>
  );
}