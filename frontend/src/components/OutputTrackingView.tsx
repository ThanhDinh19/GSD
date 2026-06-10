import React, { useState } from 'react';
import { Style } from '../types';

interface OutputTrackingViewProps {
  currentStyle: Style;
}

export default function OutputTrackingView({ currentStyle }: OutputTrackingViewProps) {
  // Let's create an hourly representation of a standard 8-hour shift with realistic variations
  const [hourlyRecords, setHourlyRecords] = useState([
    { hourNum: 1, label: '07:30 - 08:30', target: 150, actual: 142, defects: 2, status: 'Ổn định', delayReason: 'Không có' },
    { hourNum: 2, label: '08:30 - 09:30', target: 150, actual: 148, defects: 1, status: 'Ổn định', delayReason: 'Không có' },
    { hourNum: 3, label: '09:30 - 10:30', target: 150, actual: 135, defects: 3, status: 'Trễ nhịp', delayReason: 'Đứt chỉ, chỉnh cụm kim OP040' },
    { hourNum: 4, label: '10:30 - 11:30', target: 150, actual: 151, defects: 0, status: 'Tăng tốc', delayReason: 'Không có' },
    { hourNum: 5, label: '13:00 - 14:00', target: 150, actual: 145, defects: 2, status: 'Ổn định', delayReason: 'Không có' },
    { hourNum: 6, label: '14:00 - 15:00', target: 150, actual: 120, defects: 4, status: 'Đình trệ', delayReason: 'Kẹt phôi, thiếu lông vũ nạp đầu OP120' },
    { hourNum: 7, label: '15:00 - 16:00', target: 150, actual: 155, defects: 1, status: 'Tăng tốc', delayReason: 'Không có' },
    { hourNum: 8, label: '16:00 - 17:00', target: 150, actual: 149, defects: 1, status: 'Ổn định', delayReason: 'Không có' },
  ]);

  // Calculations
  const totalTarget = hourlyRecords.reduce((acc, curr) => acc + curr.target, 0);
  const totalActual = hourlyRecords.reduce((acc, curr) => acc + curr.actual, 0);
  const totalDefects = hourlyRecords.reduce((acc, curr) => acc + curr.defects, 0);
  
  const overallEfficiency = Number(((totalActual / totalTarget) * 100).toFixed(1));
  const defectRate = totalActual > 0 ? Number(((totalDefects / totalActual) * 105).toFixed(1)) : 0;

  // Handle manual adjustments
  const handleActualChange = (hourNum: number, value: number) => {
    setHourlyRecords(hourlyRecords.map(h => 
      h.hourNum === hourNum ? { ...h, actual: Math.max(0, value), status: value >= h.target ? 'Tăng tốc' : value >= h.target - 15 ? 'Ổn định' : 'Trễ nhịp' } : h
    ));
  };

  const handleDefectChange = (hourNum: number, value: number) => {
    setHourlyRecords(hourlyRecords.map(h => 
      h.hourNum === hourNum ? { ...h, defects: Math.max(0, value) } : h
    ));
  };

  const handleReasonChange = (hourNum: number, text: string) => {
    setHourlyRecords(hourlyRecords.map(h => 
      h.hourNum === hourNum ? { ...h, delayReason: text } : h
    ));
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <section className="bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="font-extrabold text-slate-800 text-sm uppercase">GIÁM SÁT SẢN LƯỢNG GIỜ (OUTPUT TRACKING BOARD)</h2>
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Bảng theo dõi nhịp độ sản xuất thực tế từng giờ của phân xưởng may áo phao</p>
        </div>
        <div className="bg-slate-50 border px-3 py-1.5 rounded text-xs text-slate-600 font-mono font-bold select-none">
          Mã hàng nạp: {currentStyle.code}
        </div>
      </section>

      {/* Production Telemetries statistics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4" id="output-stats">
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">Lũy kế sản lượng (Shift Output)</span>
          <div className="flex justify-between items-baseline mt-1 select-none">
            <strong className="text-2xl font-black font-mono text-slate-800">{totalActual} / {totalTarget}</strong>
            <span className="text-[10px] text-slate-400 font-bold">mục tiêu: {totalTarget} pcs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">Hiệu suất ca thực tế</span>
          <div className="flex justify-between items-baseline mt-1 select-none">
            <strong className="text-2xl font-black font-mono text-primary">{overallEfficiency}%</strong>
            <span className={`text-[10px] font-extrabold ${overallEfficiency >= 95 ? 'text-emerald-600' : 'text-orange-500'}`}>
              {overallEfficiency >= 95 ? 'Độ phủ Đạt chỉ tiêu' : 'Cần tăng tốc nòng'}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">Độ lỗi tỉ vết QC</span>
          <div className="flex justify-between items-baseline mt-1 select-none">
            <strong className="text-2xl font-black font-mono text-rose-500">{totalDefects} pcs</strong>
            <span className="text-[10px] text-slate-400 font-bold">Tỷ lệ hỏng: {defectRate}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex items-center justify-center select-none">
          <div className="text-center w-full">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái chuyền may</span>
            <span className="mt-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs inline-block animate-pulse">
              ● ĐANG CHẠY CHUYỀN
            </span>
          </div>
        </div>
      </section>

      {/* Hourly table controls */}
      <section className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase select-none">
          Cập nhật sản lượng may từng giờ &amp; Ghi nhận nguyên nhân ách tắc băng chuyền (QC &amp; Line monitoring)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 select-none">
              <tr>
                <th className="px-5 py-3 w-16 text-center">Giờ</th>
                <th className="px-5 py-3">Khung giờ làm việc</th>
                <th className="px-5 py-3 text-right">Target cấu định</th>
                <th className="px-5 py-3 text-right">Thực tế sản xuất (Pcs)</th>
                <th className="px-5 py-3 text-right">Lỗi ráp QC (Pcs)</th>
                <th className="px-5 py-3 text-center">Trạng thái chuyền</th>
                <th className="px-5 py-3">Báo cáo lý do ách tắc thiết bị / Sự cố</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {hourlyRecords.map((h) => (
                <tr key={h.hourNum} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3 text-center text-slate-400 font-extrabold">{h.hourNum}</td>
                  <td className="px-5 py-3 font-semibold text-slate-600">{h.label}</td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-slate-500">{h.target}</td>
                  <td className="px-5 py-3 text-right">
                    <input 
                      type="number"
                      value={h.actual}
                      onChange={(e) => handleActualChange(h.hourNum, Number(e.target.value))}
                      className="w-16 border rounded text-right font-mono font-extrabold text-slate-900 border-slate-300 p-1"
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <input 
                      type="number"
                      value={h.defects}
                      onChange={(e) => handleDefectChange(h.hourNum, Number(e.target.value))}
                      className="w-16 border border-slate-300 rounded text-right font-mono text-rose-600 p-1 font-bold"
                    />
                  </td>
                  <td className="px-5 py-3 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      h.status === 'Tăng tốc' ? 'bg-emerald-100 text-emerald-800' :
                      h.status === 'Ổn định' ? 'bg-blue-100 text-blue-800' :
                      h.status === 'Trễ nhịp' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <input 
                      type="text"
                      value={h.delayReason}
                      onChange={(e) => handleReasonChange(h.hourNum, e.target.value)}
                      placeholder="Ghi nhận lỗi ách tắc sườn máy..."
                      className="w-full text-xs font-semibold text-slate-600 bg-transparent hover:bg-slate-100/50 focus:bg-white focus:outline-none border-b border-transparent focus:border-slate-300 py-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
