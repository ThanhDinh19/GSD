import React, { useState, useMemo } from 'react';
import { Worker, SkillLevel, WorkRole } from '../types';

interface ManpowerViewProps {
  workers: Worker[];
  onAddWorker: (newWorker: Worker) => void;
  onUpdateWorker: (updatedWorker: Worker) => void;
  onDeleteWorker: (id: string) => void;
}

export default function ManpowerView({
  workers,
  onAddWorker,
  onUpdateWorker,
  onDeleteWorker
}: ManpowerViewProps) {
  // Modal toggle state for adding workers
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newWorker, setNewWorker] = useState<Partial<Worker>>({
    name: '',
    role: 'Operator',
    skillLevel: 'B',
    efficiency: 75
  });

  // Edit worker state
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Filter state
  const [roleFilter, setRoleFilter] = useState<'All' | WorkRole>('All');
  const [skillFilter, setSkillFilter] = useState<'All' | SkillLevel>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Overall statistics
  const stats = useMemo(() => {
    const totalCount = workers.length;
    const operators = workers.filter(w => w.role === 'Operator').length;
    const helpers = workers.filter(w => w.role === 'Helper').length;
    
    const skillA = workers.filter(w => w.skillLevel === 'A').length;
    const skillB = workers.filter(w => w.skillLevel === 'B').length;
    const skillC = workers.filter(w => w.skillLevel === 'C').length;
    const skillD = workers.filter(w => w.skillLevel === 'D').length;

    const assignedCount = workers.filter(w => w.assignedOpId).length;

    return {
      totalCount,
      operators,
      helpers,
      skillA,
      skillB,
      skillC,
      skillD,
      assignedCount,
      unassignedCount: totalCount - assignedCount
    };
  }, [workers]);

  // Filter workers based on filters & search string
  const filteredWorkers = useMemo(() => {
    return workers.filter(w => {
      const matchesRole = roleFilter === 'All' || w.role === roleFilter;
      const matchesSkill = skillFilter === 'All' || w.skillLevel === skillFilter;
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            w.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesSkill && matchesSearch;
    });
  }, [workers, roleFilter, skillFilter, searchQuery]);

  // Add Worker Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name) return;

    const nextIdNumber = workers.length + 1;
    const generatedId = `W${nextIdNumber.toString().padStart(3, '0')}`;

    const created: Worker = {
      id: generatedId,
      name: newWorker.name,
      role: (newWorker.role as WorkRole) || 'Operator',
      skillLevel: (newWorker.skillLevel as SkillLevel) || 'B',
      efficiency: Number(newWorker.efficiency) || 75,
      assignedOpId: null
    };

    onAddWorker(created);
    setIsAdding(false);
    setNewWorker({
      name: '',
      role: 'Operator',
      skillLevel: 'B',
      efficiency: 75
    });
  };

  // Edit Worker submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    onUpdateWorker(editingWorker);
    setEditingWorker(null);
  };

  return (
    <div className="space-y-6">
      {/* High density statistics banner */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4" id="manpower-stats">
        <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">Nhân sự nhà máy</span>
          <div className="flex justify-between items-baseline mt-1">
            <strong className="text-2xl font-black font-mono text-slate-800">{stats.totalCount}</strong>
            <span className="text-[10px] text-slate-400 font-bold">{stats.operators} Thợ may / {stats.helpers} Phụ trợ</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">Trạng thái phân việc</span>
          <div className="flex justify-between items-baseline mt-1">
            <strong className="text-2xl font-black font-mono text-primary">{stats.assignedCount}</strong>
            <span className="text-[10px] text-slate-400 font-bold">Rảnh rỗi: {stats.unassignedCount} nhân sự</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded shadow-sm">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">Tay nghề thợ cứng (C-D)</span>
          <div className="flex justify-between items-baseline mt-1">
            <strong className="text-2xl font-black font-mono text-indigo-700">{stats.skillC + stats.skillD}</strong>
            <span className="text-[10px] text-slate-400 font-bold">Skill D (Mặt máy cứng): {stats.skillD} người</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded shadow-sm flex items-center justify-center">
          <button
            onClick={() => setIsAdding(true)}
            className="w-full bg-primary hover:bg-opacity-95 text-white text-xs font-bold py-2.5 px-3 rounded shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Khai báo thêm công nhân mới
          </button>
        </div>
      </section>

      {/* Grid containing employees search filtering panel and matching directories lists */}
      <section className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden flex flex-col">
        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 w-full md:max-w-md relative">
            <span className="absolute left-3 top-2 text-slate-400 font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Nhập mã nhân sự, họ tên thợ may..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-slate-400 bg-white"
            />
          </div>

          <div className="flex gap-2.5 items-center w-full md:w-auto text-xs">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="border border-slate-300 rounded py-1.5 px-3 bg-white focus:outline-none"
            >
              <option value="All">Phân loại vai trò</option>
              <option value="Operator">Operator (Thợ may đứng máy)</option>
              <option value="Helper">Helper (Phụ trợ)</option>
            </select>

            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value as any)}
              className="border border-slate-300 rounded py-1.5 px-3 bg-white focus:outline-none"
            >
              <option value="All">Phân nhóm tay nghề</option>
              <option value="A">Cấp độ A (Sơ cấp)</option>
              <option value="B">Cấp độ B (Trung cấp)</option>
              <option value="C">Cấp độ C (Cứng tay)</option>
              <option value="D">Cấp độ D (Chuyên gia/Tổ trưởng)</option>
            </select>
          </div>
        </div>

        {/* Directory spreadsheet table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 select-none">
              <tr>
                <th className="px-6 py-3 w-28">Mã thợ</th>
                <th className="px-6 py-3">Họ và Tên công nhân</th>
                <th className="px-6 py-3">Phân loại vai trò</th>
                <th className="px-6 py-3 text-center">Tay nghề bậc</th>
                <th className="px-6 py-3 text-right">Hiệu suất gốc (%)</th>
                <th className="px-6 py-3">Trạm công việc phụ trách</th>
                <th className="px-6 py-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-bold font-mono text-primary text-xs">{worker.id}</td>
                  <td className="px-6 py-3 font-semibold text-slate-800">{worker.name}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      worker.role === 'Operator' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {worker.role === 'Operator' ? 'Operator' : 'Helper'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center font-black">
                    <span className={`px-2 py-0.5 rounded-sm border text-[10px] ${
                      worker.skillLevel === 'D' ? 'bg-red-50 text-red-700 border-red-200' :
                      worker.skillLevel === 'C' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      worker.skillLevel === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {worker.skillLevel}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-bold text-slate-900">{worker.efficiency}%</td>
                  <td className="px-6 py-3 font-semibold">
                    {worker.assignedOpId ? (
                      <span className="px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded text-[10px] font-mono">
                        {worker.assignedOpId}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Sẵn sàng điều chuyển</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="inline-flex gap-1.5">
                      <button
                        onClick={() => setEditingWorker(worker)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Sửa lý lịch thợ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn chắc chắn muốn khai trừ nhân lực ${worker.id} out of database?`)) {
                            onDeleteWorker(worker.id);
                          }
                        }}
                        className="p-1 hover:bg-rose-50 rounded text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Sa thải/Xóa thợ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add newly simulated worker dialog Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddSubmit}
            className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
          >
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div>
                <strong className="block text-sm">Khai báo Hồ sơ nhân sự mới</strong>
                <p className="text-xs text-blue-200 mt-0.5">Nhập tay nghề, bộ dập chuẩn nòng, hiệu suất cá nhân</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-white/80 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Họ và Tên công nhân</label>
                <input 
                  type="text"
                  placeholder="e.g. Hoàng Thị Cúc"
                  value={newWorker.name || ''}
                  onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Phân loại vai trò</label>
                  <select
                    value={newWorker.role}
                    onChange={(e) => setNewWorker({...newWorker, role: e.target.value as WorkRole})}
                    className="w-full border border-slate-300 rounded p-2"
                  >
                    <option value="Operator">Operator (Thợ may)</option>
                    <option value="Helper">Helper (Phụ trợ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Thời điểm xếp bậc (Skills)</label>
                  <select
                    value={newWorker.skillLevel}
                    onChange={(e) => setNewWorker({...newWorker, skillLevel: e.target.value as SkillLevel})}
                    className="w-full border border-slate-300 rounded p-2"
                  >
                    <option value="A">Bậc A (Tập sự)</option>
                    <option value="B">Bậc B (Trung bình)</option>
                    <option value="C">Bậc C (Cứng tay)</option>
                    <option value="D">Bậc D (Chuyên gia/Tổ trưởng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Chỉ số hiệu suất tự nhiên (%)</label>
                <input 
                  type="number"
                  min="30"
                  max="120"
                  value={newWorker.efficiency}
                  onChange={(e) => setNewWorker({...newWorker, efficiency: Number(e.target.value)})}
                  className="w-full border border-slate-300 rounded p-2"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3' py-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-primary text-white font-bold rounded hover:bg-opacity-95 shadow transition-colors cursor-pointer"
              >
                Ghi chép lý lịch
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Worker details dialog Modal */}
      {editingWorker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleEditSubmit}
            className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
          >
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div>
                <strong className="block text-sm">Chỉnh sửa Hồ sơ {editingWorker.id}</strong>
                <p className="text-xs text-blue-200 mt-0.5">{editingWorker.name}</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingWorker(null)}
                className="text-white/80 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Họ và Tên công nhân</label>
                <input 
                  type="text"
                  value={editingWorker.name}
                  onChange={(e) => setEditingWorker({...editingWorker, name: e.target.value})}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Phân loại vai trò</label>
                  <select
                    value={editingWorker.role}
                    onChange={(e) => setEditingWorker({...editingWorker, role: e.target.value as WorkRole})}
                    className="w-full border border-slate-300 rounded p-2"
                  >
                    <option value="Operator">Operator (Thợ may)</option>
                    <option value="Helper">Helper (Phụ trợ)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Thời điểm xếp bậc (Skills)</label>
                  <select
                    value={editingWorker.skillLevel}
                    onChange={(e) => setEditingWorker({...editingWorker, skillLevel: e.target.value as SkillLevel})}
                    className="w-full border border-slate-300 rounded p-2"
                  >
                    <option value="A">Bậc A (Tập sự)</option>
                    <option value="B">Bậc B </option>
                    <option value="C">Bậc C </option>
                    <option value="D">Bậc D (Tổ trưởng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Chỉ số hiệu suất tự nhiên (%)</label>
                <input 
                  type="number"
                  min="30"
                  max="120"
                  value={editingWorker.efficiency}
                  onChange={(e) => setEditingWorker({...editingWorker, efficiency: Number(e.target.value)})}
                  className="w-full border border-slate-300 rounded p-2"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setEditingWorker(null)}
                className="px-3' py-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-primary text-white font-bold rounded hover:bg-opacity-95 shadow transition-colors cursor-pointer"
              >
                Lưu lý lịch
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
