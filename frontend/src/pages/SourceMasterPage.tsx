import { useState } from 'react';
import { SourceMaster, SourceMasterPayload } from '../types';
import { useSources } from '../hooks/useSources';

const emptyForm: SourceMasterPayload = {
  sourceCode: '',
  sourceName: '',
  note: '',
  statusId: 0,
};

export default function SourceMasterPage() {
  const {
    sources,
    statuses,
    loading,
    createSource,
    updateSource,
  } = useSources();

  const [selectedItem, setSelectedItem] = useState<SourceMaster | null>(null);
  const [form, setForm] = useState<SourceMasterPayload>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openCreateForm = () => {
    setSelectedItem(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (item: SourceMaster) => {
    setSelectedItem(item);
    setForm({
      sourceCode: item.sourceCode,
      sourceName: item.sourceName || '',
      note: item.note || '',
      statusId: item.statusId,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedItem(null);
    setForm(emptyForm);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedItem) {
        await updateSource(selectedItem.id, form);
      } else {
        await createSource(form);
      }

      closeForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lưu dữ liệu thất bại.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Danh mục source
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý source dùng để khai báo bộ thao tác GSD. Click vào một dòng để cập nhật.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
          >
            + Thêm mới
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">STT</th>
                <th className="px-4 py-3 text-left">Mã source</th>
                <th className="px-4 py-3 text-left">Tên source</th>
                <th className="px-4 py-3 text-left">Ghi chú</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && sources.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Chưa có dữ liệu source.
                  </td>
                </tr>
              )}

              {!loading && sources.map((item, index) => (
                <tr
                  key={item.id}
                  onClick={() => openEditForm(item)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3 font-bold text-slate-700">
                    {item.sourceCode}
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {item.sourceName || ''}
                  </td>

                  <td className="px-4 py-3 text-slate-500">
                    {item.note || ''}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        item.statusId === 0
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.statusName || 'Không rõ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase">
                {selectedItem ? 'Cập nhật source' : 'Thêm mới source'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Mã source <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.sourceCode}
                  onChange={(e) => setForm({ ...form, sourceCode: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  maxLength={100}
                  required
                  placeholder="VD: 100-MidieuBTP-2K"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Tên source
                </label>
                <input
                  value={form.sourceName || ''}
                  onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  maxLength={100}
                  placeholder="VD: Midieu BTP 2 kim"
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

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={form.note || ''}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  maxLength={256}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}