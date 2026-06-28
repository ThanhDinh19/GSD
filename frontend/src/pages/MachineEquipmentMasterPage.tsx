import { useState } from 'react';
import { MachineEquipment, MachineEquipment_test, MachineEquipmentPayload } from '../types';
import { useMachineEquipments } from '../hooks/useMachineEquipments';

const emptyForm: MachineEquipmentPayload = {
  machineCode: '',
  machineName: '',
  clusterId: null,
  codeMmtb: '',
  allowance: null,
  attachedActionTime: null,
  stitchCount: null,
  machineSpeed: null,
  defaultSmv: null,
  skillGrade: '',
  note: '',
  statusId: 0,
};

export default function MachineEquipmentMasterPage() {
  const {
    machineEquipments,
    machineEquiments_test,
    clusters,
    statuses,
    loading,
    createMachineEquipment,
    updateMachineEquipment,
  } = useMachineEquipments();

  const [selectedItem, setSelectedItem] = useState<MachineEquipment | null>(null);
  const [form, setForm] = useState<MachineEquipmentPayload>(emptyForm);


  // Dinh, 28/06/2026
  const [selectedItem_test, setSelectedItem_test] = useState<MachineEquipment_test | null>(null);
  

  const [isFormOpen, setIsFormOpen] = useState(false);

  const openCreateForm = () => {
    setSelectedItem(null);
    setSelectedItem_test(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (item: MachineEquipment_test) => {
    setSelectedItem_test(item);
    setForm({
      machineCode: item.machineCode,
      machineName: item.machineName,
      clusterId: item.clusterId || null,
      codeMmtb: item.codeMmtb || '',
      allowance: item.allowance ?? null,
      attachedActionTime: item.attachedActionTime ?? null,
      stitchCount: item.stitchCount ?? null,
      machineSpeed: item.machineSpeed ?? null,
      defaultSmv: item.defaultSmv ?? null,
      skillGrade: item.skillGrade || '',
      note: item.note || '',
      statusId: item.statusId,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setSelectedItem(null);
    setSelectedItem_test(null);
    setForm(emptyForm);
    setIsFormOpen(false);
  };

  const handleNumberChange = (
    key: keyof MachineEquipmentPayload,
    value: string
  ) => {
    setForm({
      ...form,
      [key]: value === '' ? null : Number(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (selectedItem_test) {
        await updateMachineEquipment(selectedItem_test.id, form);
      } else {
        await createMachineEquipment(form);
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
              Danh mục MMTB
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý máy móc thiết bị. Click vào một dòng để cập nhật.
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
                <th className="px-4 py-3 text-left">Code MMTB</th>
                <th className="px-4 py-3 text-left">Tên MMTB</th>
        
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-right">Hao phí</th>
                <th className="px-4 py-3 text-left">Thao tác kèm theo</th>
                <th className="px-4 py-3 text-right">Số mũi chỉ</th>
                <th className="px-4 py-3 text-right">Tốc độ máy</th>
                <th className="px-4 py-3 text-right">SMV</th>
                <th className="px-4 py-3 text-left">Bậc CĐ</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={11} className="px-4 py-6 text-center text-slate-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && machineEquiments_test.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-6 text-center text-slate-400">
                    Chưa có dữ liệu MMTB.
                  </td>
                </tr>
              )}

              {!loading && machineEquiments_test.map((item, index) => (
                <tr
                  key={item.id}
                  onClick={() => openEditForm(item)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{item.machineCode}</td>
                  <td className="px-4 py-3 text-slate-700">{item.machineName}</td>
                  <td className="px-4 py-3 text-slate-700">{item.codeMmtb || ''}</td>
                  <td className="px-4 py-3 text-right">{item.allowance ?? ''}</td>
                  <td className="px-4 py-3 text-slate-700">{item.attachedActionTime || ''}</td>
                  <td className="px-4 py-3 text-right">{item.stitchCount ?? ''}</td>
                  <td className="px-4 py-3 text-right">{item.machineSpeed ?? ''}</td>
                  <td className="px-4 py-3 text-right font-bold">{item.defaultSmv ?? ''}</td>
                  <td className="px-4 py-3 text-slate-700">{item.skillGrade || ''}</td>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase">
                {selectedItem_test ? 'Cập nhật MMTB' : 'Thêm mới MMTB'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Mã MMTB <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.machineCode}
                    onChange={(e) => setForm({ ...form, machineCode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    maxLength={16}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Tên MMTB <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.machineName}
                    onChange={(e) => setForm({ ...form, machineName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    maxLength={256}
                    required
                  />
                </div>

                {/* <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Cụm
                  </label>
                  <select
                    value={form.clusterId ?? ''}
                    onChange={(e) => setForm({ ...form, clusterId: e.target.value === '' ? null : Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Chọn cụm --</option>
                    {clusters.map(cluster => (
                      <option key={cluster.id} value={cluster.id}>
                        {cluster.clusterName}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Code
                  </label>
                  <input
                    value={form.codeMmtb || ''}
                    onChange={(e) => setForm({ ...form, codeMmtb: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    maxLength={16}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Bậc CĐ
                  </label>
                  <input
                    value={form.skillGrade || ''}
                    onChange={(e) => setForm({ ...form, skillGrade: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    maxLength={1}
                    placeholder="A/B/C..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Hao phí
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.allowance ?? ''}
                    onChange={(e) => handleNumberChange('allowance', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Thao tác kèm theo
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={form.attachedActionTime ?? ''}
                    onChange={(e) => handleNumberChange('attachedActionTime', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Số mũi chỉ
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.stitchCount ?? ''}
                    onChange={(e) => handleNumberChange('stitchCount', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Tốc độ máy
                  </label>
                  <input
                    type="number"
                    value={form.machineSpeed ?? ''}
                    onChange={(e) => handleNumberChange('machineSpeed', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    SMV
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.defaultSmv ?? ''}
                    onChange={(e) => handleNumberChange('defaultSmv', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
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

                <div className="md:col-span-3">
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