import { useEffect, useState } from 'react';
import { BalanceType, BalanceTypePayload, MasterStatus } from '../../types';

const emptyForm: BalanceTypePayload = {
    balanceTypeCode: '',
    balanceTypeName: '',
    statusId: 0,
};

interface BalanceTypeFormModalProps {
    balanceType: BalanceType | null;
    statuses: MasterStatus[];
    onClose: () => void;
    onSubmit: (payload: BalanceTypePayload) => Promise<void>;
}

export default function BalanceTypeFormModal({
    balanceType,
    statuses,
    onClose,
    onSubmit,
}: BalanceTypeFormModalProps) {
    const [form, setForm] = useState<BalanceTypePayload>(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (balanceType) {
            setForm({
                balanceTypeCode: balanceType.balanceTypeCode,
                balanceTypeName: balanceType.balanceTypeName,
                statusId: balanceType.statusId,
            });
        } else {
            setForm(emptyForm);
        }
    }, [balanceType]);

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
                        {balanceType ? 'Cập nhật' : 'Thêm mới'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Mã loại cân bằng<span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.balanceTypeCode}
                            onChange={(e) => setForm({ ...form, balanceTypeCode: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="VD: CB01"
                            maxLength={50}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Tên loại cân bằng <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.balanceTypeName}
                            onChange={(e) => setForm({ ...form, balanceTypeName: e.target.value })}
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
