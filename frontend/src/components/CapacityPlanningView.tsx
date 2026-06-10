import React, { useState, useMemo } from 'react';
import { Style, OrderCapacity } from '../types';
import { defaultMockOrders } from '../data';

interface CapacityPlanningViewProps {
  styles: Style[];
  currentStyle: Style;
}

export default function CapacityPlanningView({ styles, currentStyle }: CapacityPlanningViewProps) {
  // Local state for orders
  const [orders, setOrders] = useState<OrderCapacity[]>(defaultMockOrders);

  // New order form inputs
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newOrder, setNewOrder] = useState<Partial<OrderCapacity>>({
    styleCode: currentStyle.code,
    customerName: '',
    qty: 10000,
    deliveryDate: '20/06/2026',
    targetDate: '15/06/2026',
    lineCount: 2,
    allocEfficiency: 75
  });

  // Calculate stats
  const totalOrderedQty = useMemo(() => orders.reduce((acc, o) => acc + o.qty, 0), [orders]);
  const activeLinesInUse = useMemo(() => orders.reduce((acc, o) => acc + o.lineCount, 0), [orders]);

  // Handler to add order
  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerName || !newOrder.styleCode) return;

    const generatedId = `ORD-${(orders.length + 1).toString().padStart(3, '0')}`;
    const formatted: OrderCapacity = {
      orderId: generatedId,
      customerName: newOrder.customerName,
      styleCode: newOrder.styleCode,
      qty: Number(newOrder.qty) || 5000,
      deliveryDate: newOrder.deliveryDate || '30/06/2026',
      targetDate: newOrder.targetDate || '25/06/2026',
      lineCount: Number(newOrder.lineCount) || 1,
      allocEfficiency: Number(newOrder.allocEfficiency) || 75
    };

    setOrders([...orders, formatted]);
    setIsAdding(false);
    setNewOrder({
      styleCode: currentStyle.code,
      customerName: '',
      qty: 10000,
      deliveryDate: '20/06/2026',
      targetDate: '15/06/2026',
      lineCount: 2,
      allocEfficiency: 75
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(orders.filter(o => o.orderId !== orderId));
  };

  return (
    <div className="space-y-6">
      <section className="bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm uppercase">KẾ HOẠCH NĂNG LỰC SẢN XUẤT (CAPACITY PLANNING)</h2>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Bản đồ phân phối đơn hàng và tính toán thời hạn dập chuyền may</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary hover:bg-opacity-95 text-white text-xs font-bold py-2.5 px-4 rounded shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Phân công Đơn hàng mới
        </button>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" id="capacity-stats">
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tổng Sản lượng Đơn hàng đặt</span>
          <strong className="block text-xl font-mono font-black text-slate-800 mt-1">
            {totalOrderedQty.toLocaleString()} <span className="text-xs font-medium text-slate-400">sản phẩm</span>
          </strong>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Số chuyền may phân bổ</span>
          <strong className="block text-xl font-mono font-black text-primary mt-1">
            {activeLinesInUse} / 8 <span className="text-xs font-medium text-slate-400">chuyền may</span>
          </strong>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Năng lực tải đỉnh</span>
          <strong className="block text-xl font-mono font-black text-emerald-600 mt-1">
            {Math.round((activeLinesInUse / 8) * 100)}% <span className="text-xs font-medium text-slate-400">Định lượng</span>
          </strong>
        </div>
      </section>

      {/* Orders planning table with calculations */}
      <section className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase">
          Danh sách điều động đơn hàng và phân tích ngày chạy chuyền (IE Calculations)
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100/50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Mã đơn</th>
                <th className="px-5 py-3">Khách hàng</th>
                <th className="px-5 py-3">Mã hàng</th>
                <th className="px-5 py-3 text-right">Số lượng (Pcs)</th>
                <th className="px-5 py-3 text-center">Chuyền May</th>
                <th className="px-5 py-3 text-right">SAM Định mức</th>
                <th className="px-5 py-3 text-right font-bold text-primary">Ngày phân bổ chạy</th>
                <th className="px-5 py-3 text-center">Bàn giao</th>
                <th className="px-5 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.map((o) => {
                const targetStyle = styles.find(s => s.code === o.styleCode) || currentStyle;
                const styleSam = targetStyle.routing.reduce((acc, step) => acc + step.sam, 0);

                // Production calculations (IE formulas):
                // Total required minutes = Qty * SAM
                // Capacity per day per line = (Working time * allocated Efficiency / 100) * (Allocated Workers per line)
                // Let's assume standard line has 25 workers
                const lineWorkersCount = 25;
                const dailyCapacityPerLine = (targetStyle.workingTime * (o.allocEfficiency / 100)) * (lineWorkersCount / styleSam);
                const totalDailyCapacity = dailyCapacityPerLine * o.lineCount;
                const requiredDays = totalDailyCapacity > 0 ? Math.ceil(o.qty / totalDailyCapacity) : 0;

                return (
                  <tr key={o.orderId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold font-mono text-primary text-xs shrink-0">{o.orderId}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{o.customerName}</td>
                    <td className="px-5 py-3.5 font-mono font-medium">{o.styleCode}</td>
                    <td className="px-5 py-3.5 text-right font-mono font-extrabold text-slate-900">{o.qty.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-center font-bold">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px]">
                        {o.lineCount} chuyền
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono text-slate-500">{styleSam.toFixed(2)} phút</td>
                    <td className="px-5 py-3.5 text-right font-bold text-primary font-mono text-xs">
                      {requiredDays} ngày
                      <span className="block text-[9px] font-normal text-slate-400">
                        (~{(totalDailyCapacity).toFixed(0)} pcs/ngày)
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center text-[11px] font-medium text-slate-500">
                      {o.targetDate}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleDeleteOrder(o.orderId)}
                        className="px-2 py-1 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-700 transition-all font-semibold font-sans cursor-pointer text-[10px]"
                      >
                        Hủy điều phối
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add newly assigned order dialog Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddOrder}
            className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
          >
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div>
                <strong className="block text-sm">Điều động Đơn hàng vào Sản xuất</strong>
                <p className="text-xs text-blue-200 mt-0.5">Lên tiến độ chạy chuyền động lực</p>
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
                <label className="block font-semibold text-slate-600 mb-1">Khách hàng đặt hàng</label>
                <input 
                  type="text"
                  placeholder="e.g. Decathlon, Nike"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                  className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mã hàng may</label>
                  <select
                    value={newOrder.styleCode}
                    onChange={(e) => setNewOrder({...newOrder, styleCode: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    {styles.map(s => (
                      <option key={s.code} value={s.code}>{s.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Tổng sản lượng (Pcs)</label>
                  <input 
                    type="number"
                    value={newOrder.qty}
                    onChange={(e) => setNewOrder({...newOrder, qty: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Hiệu suất cam kết (%)</label>
                  <input 
                    type="number"
                    value={newOrder.allocEfficiency}
                    onChange={(e) => setNewOrder({...newOrder, allocEfficiency: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Số Chuyền May phân công</label>
                  <input 
                    type="number"
                    min="1"
                    max="8"
                    value={newOrder.lineCount}
                    onChange={(e) => setNewOrder({...newOrder, lineCount: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 text-center"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Ngày xuất kho xuất khẩu</label>
                  <input 
                    type="text"
                    value={newOrder.deliveryDate}
                    onChange={(e) => setNewOrder({...newOrder, deliveryDate: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Hạn dập hoàn thiện chuyền</label>
                  <input 
                    type="text"
                    value={newOrder.targetDate}
                    onChange={(e) => setNewOrder({...newOrder, targetDate: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 text-center"
                    required
                  />
                </div>
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
                Duyệt Điều Phối
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
