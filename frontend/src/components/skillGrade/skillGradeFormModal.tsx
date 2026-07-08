import { useEffect, useState } from 'react';
import { SkillGrade, SkillGradePayload, MasterStatus } from '../../types';

const emptyForm: SkillGradePayload = {
  level: 0,
  note: '',
  status_id: 0,
};

interface SkillGradeFormModalProps {
  item: SkillGrade | null;
  statuses: MasterStatus[];
  onClose: () => void;
  onSubmit: (payload: SkillGradePayload) => Promise<void>;
}

export default function SkillGradeFormModal({
  item,
  statuses,
  onClose,
  onSubmit,
}: SkillGradeFormModalProps) {
  const [form, setForm] = useState<SkillGradePayload>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        level: item.level,
        note: item.note,
        status_id: item.status_id,
      });
    } else {
      setForm(emptyForm);
    }
  }, [item]);

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
            {item ? 'Cập nhật' : 'Thêm mới'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Bậc thợ <span className="text-red-500">*</span>
            </label>
            <input
              value={form.level}
              onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="..."
              maxLength={50}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Ghi chú <span className="text-red-500">*</span>
            </label>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="..."
              maxLength={1000}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Trạng thái
            </label>
            <select
              value={form.status_id}
              onChange={(e) => setForm({ ...form, status_id: Number(e.target.value) })}
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