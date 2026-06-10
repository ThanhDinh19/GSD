import React, { useState, useMemo } from 'react';
import { Style, RoutingStep } from '../types';

interface SamDatabaseViewProps {
  styles: Style[];
  onSelectStyle: (code: string) => void;
  onAddStyle: (newStyle: Style) => void;
  onUpdateStyle: (updatedStyle: Style) => void;
  onDeleteStyle: (code: string) => void;
  onSwitchTab: (tab: string) => void;
}

export default function SamDatabaseView({
  styles,
  onSelectStyle,
  onAddStyle,
  onUpdateStyle,
  onDeleteStyle,
  onSwitchTab
}: SamDatabaseViewProps) {
  // Add style modal/form states
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newStyle, setNewStyle] = useState<Partial<Style>>({
    code: '',
    name: '',
    productType: 'Jacket',
    mainFabric: 'Canvas',
    targetOutput: 1000,
    workingTime: 600,
    historicSam: 15.0,
    historicSmv: 13.8,
    historicEfficiency: 75,
    historicOutput: 980
  });

  // Edit basic style stats state
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);

  // Search input and filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterProduct, setFilterProduct] = useState<string>('All');

  // Compute product type categorizations
  const productTypes = useMemo(() => {
    return ['All', ...Array.from(new Set(styles.map(s => s.productType)))];
  }, [styles]);

  // Handle Search and category filtering
  const filteredStyles = useMemo(() => {
    return styles.filter(s => {
      const matchesSearch = s.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterProduct === 'All' || s.productType === filterProduct;
      return matchesSearch && matchesCategory;
    });
  }, [styles, searchQuery, filterProduct]);

  // Submit handler for adding a style
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStyle.code || !newStyle.name) return;

    // Check if code already exists
    if (styles.some(s => s.code.toUpperCase() === newStyle.code?.toUpperCase())) {
      alert('Mã hàng này đã tồn tại trong cơ sở dữ liệu!');
      return;
    }

    // Assign standard default routings for new item so it is not empty
    const defaultNewRouting: RoutingStep[] = [
      { id: '1', stt: 1, opCode: 'OP010', opName: 'May định hình phom', machineType: '1N', sam: Number(newStyle.historicSam) * 0.4 || 4.5, smv: (Number(newStyle.historicSam) * 0.4) * 0.9, ratio: 40.0, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '2', stt: 2, opCode: 'OP020', opName: 'Lắp ráp chi tiết chính', machineType: '1N', sam: Number(newStyle.historicSam) * 0.4 || 4.5, smv: (Number(newStyle.historicSam) * 0.4) * 0.9, ratio: 40.0, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 3, assignedWorkerIds: [] },
      { id: '3', stt: 3, opCode: 'OP030', opName: 'Kiểm hóa hoàn thiện', machineType: 'Thủ công', sam: Number(newStyle.historicSam) * 0.2 || 2.5, smv: (Number(newStyle.historicSam) * 0.2) * 0.9, ratio: 20.0, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
    ];

    const finalizedStyle: Style = {
      code: newStyle.code.toUpperCase().replace(/\s+/g, '-'),
      name: newStyle.name,
      productType: newStyle.productType || 'T-Shirt',
      mainFabric: newStyle.mainFabric || 'Cotton',
      targetOutput: Number(newStyle.targetOutput) || 1000,
      workingTime: Number(newStyle.workingTime) || 600,
      historicSam: Number(newStyle.historicSam) || 12.00,
      historicSmv: Number(newStyle.historicSmv) || 11.00,
      historicEfficiency: Number(newStyle.historicEfficiency) || 75.0,
      historicOutput: Number(newStyle.historicOutput) || 980,
      routing: defaultNewRouting
    };

    onAddStyle(finalizedStyle);
    setIsAdding(false);
    // Reset state inputs
    setNewStyle({
      code: '',
      name: '',
      productType: 'Jacket',
      mainFabric: 'Canvas',
      targetOutput: 1000,
      workingTime: 600,
      historicSam: 15.0,
      historicSmv: 13.8,
      historicEfficiency: 75,
      historicOutput: 980
    });
  };

  // Submit edit logic
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStyle) return;

    onUpdateStyle(editingStyle);
    setEditingStyle(null);
  };

  return (
    <div className="space-y-6">
      {/* Search and Database Actions header */}
      <section className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1 w-full md:w-auto relative max-w-md">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Tìm mã hàng, tên sản phẩm kỹ thuật..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-slate-400"
          />
        </div>

        <div className="flex w-full md:w-auto gap-3 items-center justify-end">
          <select 
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="border border-slate-300 text-xs rounded py-2 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {productTypes.map(p => (
              <option key={p} value={p}>{p === 'All' ? 'Tất cả loại sản phẩm' : p}</option>
            ))}
          </select>

          <button 
            onClick={() => setIsAdding(true)}
            className="bg-primary hover:bg-opacity-95 text-white text-xs py-2 px-4 rounded font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Đăng ký mã hàng mới
          </button>
        </div>
      </section>

      {/* Grid of Styles */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStyles.map((style) => {
          // Calculate active parameters from children routings
          const totalProcessCount = style.routing.length;
          const currentSamSum = style.routing.reduce((acc, c) => acc + c.sam, 0);

          return (
            <div 
              key={style.code}
              className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header information style */}
              <div className="p-5 border-b border-slate-100 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-bold font-mono text-[10px] uppercase">
                    {style.productType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    {style.mainFabric}
                  </span>
                </div>
                
                <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition-colors">
                  {style.code}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 h-8">
                  {style.name}
                </p>

                {/* Performance characteristics list sheet */}
                <div className="grid grid-cols-3 gap-3 border-t border-slate-50 pt-3 mt-4 text-center">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Quy trình</span>
                    <strong className="block text-sm text-slate-800 mt-0.5">{totalProcessCount} CĐ</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Tổng SAM</span>
                    <strong className="block text-sm text-primary font-mono mt-0.5">{currentSamSum.toFixed(2)}p</strong>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Target Ngày</span>
                    <strong className="block text-sm text-slate-800 font-mono mt-0.5">{style.targetOutput}</strong>
                  </div>
                </div>
              </div>

              {/* Action operations and navigations footer */}
              <div className="px-5 py-3/5 bg-slate-50 border-t border-slate-200/60 flex justify-between items-center gap-2">
                <button
                  onClick={() => {
                    onSelectStyle(style.code);
                    onSwitchTab('gsd-routing');
                  }}
                  className="px-3.5 py-1.5 bg-blue-100 text-blue-800 hover:bg-primary hover:text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Xem Quy Trình GSD
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingStyle(style)}
                    className="p-1.5 hover:bg-slate-200 shrink-0 text-slate-500 hover:text-slate-800 rounded transition-colors"
                    title="Sửa thông số chuẩn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (styles.length <= 1) {
                        alert('Hệ thống yêu cầu duy trì ít nhất 1 mã hàng chính khóa!');
                        return;
                      }
                      if (confirm(`Bạn có chắc chắn muốn xóa mã hàng ${style.code} ra khỏi cơ sở dữ liệu?`)) {
                        onDeleteStyle(style.code);
                      }
                    }}
                    className="p-1.5 hover:bg-rose-100 shrink-0 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Xóa mã hàng"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Add newly simulated style Modal Dialog */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddSubmit}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div>
                <strong className="block text-sm">Khởi tạo &amp; Đăng ký mã sản phẩm hàng kỹ thuật mới</strong>
                <p className="text-xs text-blue-200 mt-1">Định chuẩn cơ sở dữ liệu thời gian SAM &amp; GSD sơ khai</p>
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

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mã sản phẩm (Style Code)</label>
                  <input 
                    type="text" 
                    value={newStyle.code || ''}
                    onChange={(e) => setNewStyle({...newStyle, code: e.target.value.toUpperCase()})}
                    placeholder="e.g. TSHIRT-PL-2026"
                    className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Loại sản phẩm</label>
                  <input 
                    type="text" 
                    value={newStyle.productType || ''}
                    onChange={(e) => setNewStyle({...newStyle, productType: e.target.value})}
                    placeholder="e.g. Jacket, Shirt, Pants, T-Shirt"
                    className="w-full border border-slate-300 rounded p-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tên mô tả sản phẩm may</label>
                <input 
                  type="text" 
                  value={newStyle.name || ''}
                  onChange={(e) => setNewStyle({...newStyle, name: e.target.value})}
                  placeholder="e.g. Áo thun cổ bẻ dệt kim co giãn thể thao"
                  className="w-full border border-slate-300 rounded p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Chất liệu vải chính</label>
                  <input 
                    type="text" 
                    value={newStyle.mainFabric || ''}
                    onChange={(e) => setNewStyle({...newStyle, mainFabric: e.target.value})}
                    placeholder="e.g. Cotton CVC, Nylon Pongee"
                    className="w-full border border-slate-300 rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Độ dài thời gian ca sản xuất (Phút)</label>
                  <input 
                    type="number" 
                    value={newStyle.workingTime}
                    onChange={(e) => setNewStyle({...newStyle, workingTime: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">SAM định mức dự phóng (Tổng phút)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newStyle.historicSam}
                    onChange={(e) => setNewStyle({...newStyle, historicSam: Number(e.target.value), historicSmv: Number(e.target.value) * 0.92})}
                    className="w-full border border-slate-300 rounded p-2 font-bold font-mono text-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-2">SMV giá trị định chuẩn công năng</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newStyle.historicSmv}
                    onChange={(e) => setNewStyle({...newStyle, historicSmv: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 font-mono text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Sản lượng mục tiêu</label>
                  <input 
                    type="number" 
                    value={newStyle.targetOutput}
                    onChange={(e) => setNewStyle({...newStyle, targetOutput: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Hiệu suất định mức (%)</label>
                  <input 
                    type="number" 
                    value={newStyle.historicEfficiency}
                    onChange={(e) => setNewStyle({...newStyle, historicEfficiency: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Sản lượng thực chứng trước</label>
                  <input 
                    type="number" 
                    value={newStyle.historicOutput}
                    onChange={(e) => setNewStyle({...newStyle, historicOutput: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3' py-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-primary text-white rounded hover:bg-opacity-95 font-bold shadow transition-colors cursor-pointer"
              >
                Ghi nhận mã hàng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit existing style statistics Modal */}
      {editingStyle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleEditSubmit}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div>
                <strong className="block text-sm">Hiệu chỉnh sản phẩm cơ sở kỹ thuật</strong>
                <p className="text-xs text-blue-200 mt-1">{editingStyle.code} - {editingStyle.name}</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingStyle(null)}
                className="text-white/80 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tên mô tả kỹ thuật mới</label>
                <input 
                  type="text" 
                  value={editingStyle.name}
                  onChange={(e) => setEditingStyle({...editingStyle, name: e.target.value})}
                  className="w-full border border-slate-300 rounded p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Loại sản phẩm</label>
                  <input 
                    type="text" 
                    value={editingStyle.productType}
                    onChange={(e) => setEditingStyle({...editingStyle, productType: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Chất liệu chính</label>
                  <input 
                    type="text" 
                    value={editingStyle.mainFabric}
                    onChange={(e) => setEditingStyle({...editingStyle, mainFabric: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Ca làm việc (Phút)</label>
                  <input 
                    type="number" 
                    value={editingStyle.workingTime}
                    onChange={(e) => setEditingStyle({...editingStyle, workingTime: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">SAM gốc Lịch Sử</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editingStyle.historicSam}
                    onChange={(e) => setEditingStyle({...editingStyle, historicSam: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 font-mono font-bold text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Target sản lượng</label>
                  <input 
                    type="number" 
                    value={editingStyle.targetOutput}
                    onChange={(e) => setEditingStyle({...editingStyle, targetOutput: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setEditingStyle(null)}
                className="px-3' py-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className="px-5 py-1.5 bg-primary text-white rounded hover:bg-opacity-95 font-bold shadow transition-colors cursor-pointer"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
