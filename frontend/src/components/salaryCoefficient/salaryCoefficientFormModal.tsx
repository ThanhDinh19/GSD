import { useEffect, useState } from 'react';
import { SalaryCoefficient, SalaryCoefficientPayload, MasterStatus, SkillGrade } from '../../types';

const emptyForm: SalaryCoefficientPayload = {
    levelId: 0,
    coefficient: 0,
    statusId: 0,
};

interface SalaryCoefficientFormModalProps {
    item: SalaryCoefficient | null;
    skillGrades: SkillGrade[];
    statuses: MasterStatus[];
    onClose: () => void;
    onSubmit: (payload: SalaryCoefficientPayload) => Promise<void>;
}

export default function SalaryCoefficientFormModal({
    item,
    skillGrades = [],
    statuses,
    onClose,
    onSubmit,
}: SalaryCoefficientFormModalProps) {
    const [form, setForm] = useState<SalaryCoefficientPayload>(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setForm({
                levelId: item.levelId,
                coefficient: item.coefficient,
                statusId: item.statusId,
            });
        } else {
            setForm(emptyForm);
        }
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.levelId) {
            alert('Vui lòng chọn bậc thợ');
            return;
        }

        if (!form.coefficient) {
            alert('Vui lòng nhập hệ số');
            return;
        }

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
                            Bậc thợ
                        </label>
                        <select
                            value={form.levelId}
                            onChange={(e) =>
                                setForm({ ...form, levelId: Number(e.target.value) })
                            }
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value={0}>-- Chọn bậc thợ --</option>

                            {skillGrades
                                .filter((item) => item.status_id === 0)
                                .map((item) => (
                                    <option key={item.id} value={item.id}>
                                        Bậc {item.level}
                                        {item.note ? ` - ${item.note}` : ''}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Hệ số <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.coefficient}
                            onChange={(e) => setForm({ ...form, coefficient: Number(e.target.value) })}
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