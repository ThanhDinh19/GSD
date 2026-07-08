import { useEffect, useState } from 'react';
import { Work, WorkPayload, MasterStatus } from '../../types';

const emptyForm: WorkPayload = {
  workCode: '',
  workName: '',
  statusId: 0,
};

interface WorkFormModalProps {
  work: Work | null;
  statuses: MasterStatus[];
  onClose: () => void;
  onSubmit: (payload: WorkPayload) => Promise<void>;
}

export default function WorkFormModal({
  work,
  statuses,
  onClose,
  onSubmit,
}: WorkFormModalProps) {
  const [form, setForm] = useState<WorkPayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (work) {
      setForm({
        workCode: work.workCode,
        workName: work.workName,
        statusId: work.statusId,
      });
    } else {
      setForm(emptyForm);
    }
  }, [work]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await onSubmit(form);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lưu dữ liệu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-800 uppercase">
            {work ? 'Cập nhật' : 'Thêm mới'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Mã công việc <span className="text-red-500">*</span>
            </label>
            <input
              value={form.workCode}
              onChange={(e) => setForm({ ...form, workCode: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="VD: LR"
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Tên cụm <span className="text-red-500">*</span>
            </label>
            <input
              value={form.workName}
              onChange={(e) => setForm({ ...form, workName: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="..."
              maxLength={255}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Trạng thái
            </label>
            <select
              value={form.statusId}
              onChange={(e) => setForm({ ...form, statusId: Number(e.target.value) })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.statusName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}