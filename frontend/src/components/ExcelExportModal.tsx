interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleCode: string;
  styleName: string;
  routingData: Array<{
    stt: number;
    opCode: string;
    opName: string;
    machineType: string;
    sam: number;
    smv: number;
    ratio: number;
    difficulty: string;
    requiredSkill: string;
  }>;
}

export default function ExcelExportModal({
  isOpen,
  onClose,
  styleCode,
  styleName,
  routingData
}: ExcelExportModalProps) {
  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    // Generate actual CSV content
    const headers = ['STT', 'Ma cong doan', 'Ten cong doan', 'May su dung', 'SAM (Phut)', 'SMV (Phut)', 'Ty le (%)', 'Do kho', 'Ky nang'];
    const rows = routingData.map(row => [
      row.stt,
      row.opCode,
      `"${row.opName.replace(/"/g, '""')}"`,
      row.machineType,
      row.sam,
      row.smv,
      row.ratio,
      row.difficulty,
      row.requiredSkill
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GSD_Routing_${styleCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Xem trước dữ liệu Excel</h3>
            <p className="text-xs text-blue-200 mt-1">{styleCode} - {styleName}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-800 flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold">Hệ thống IE Planning System:</span> Bản xem trước này phản ánh đúng cấu trúc file Excel xuất xưởng (GSD & SAM). Bấm tải về để tải xuống file .csv chính thức để nạp vào hệ thống ERP hoặc phần mềm GSD nâng cao.
            </div>
          </div>

          <div className="border border-slate-200 rounded overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs border-b border-slate-200 flex justify-between select-none">
              <span className="font-mono text-slate-500 font-bold">Sheet1: SAM_Routing_Data</span>
              <span className="text-[10px] text-slate-400">Excel Preview Mode v1.0</span>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-xs text-left font-mono border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 select-none sticky top-0">
                  <tr>
                    <th className="border-r border-slate-200 px-3 py-2 text-slate-500 text-center w-12">A</th>
                    <th className="border-r border-slate-200 px-4 py-2 text-slate-500">B</th>
                    <th className="border-r border-slate-200 px-4 py-2 text-slate-500">C</th>
                    <th className="border-r border-slate-200 px-4 py-2 text-slate-500">D</th>
                    <th className="border-r border-slate-200 px-4 py-2 text-slate-500">E</th>
                    <th className="border-r border-slate-200 px-4 py-2 text-slate-500">F</th>
                    <th className="border-r border-slate-200 px-4 py-2 text-slate-500">G</th>
                    <th className="border-r border-slate-200 px-4 py-2 text-slate-500">H</th>
                    <th className="px-4 py-2 text-slate-500">I</th>
                  </tr>
                  <tr className="bg-slate-200/50 border-b border-slate-200 text-[11px] text-slate-700">
                    <th className="border-r border-slate-200 px-3 py-1.5 text-center">STT</th>
                    <th className="border-r border-slate-200 px-4 py-1.5">Mã công đoạn</th>
                    <th className="border-r border-slate-200 px-4 py-1.5">Tên công đoạn</th>
                    <th className="border-r border-slate-200 px-4 py-1.5">Tiêu chuẩn máy</th>
                    <th className="border-r border-slate-200 px-4 py-1.5 text-right">SAM (phút)</th>
                    <th className="border-r border-slate-200 px-4 py-1.5 text-right">SMV (phút)</th>
                    <th className="border-r border-slate-200 px-4 py-1.5 text-right">Tỷ lệ (%)</th>
                    <th className="border-r border-slate-200 px-4 py-1.5 text-center">Độ khó</th>
                    <th className="px-4 py-1.5 text-center">Kỹ năng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routingData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 bg-white">
                      <td className="border-r border-slate-200 px-3 py-1.5 text-center text-slate-400 font-bold">{row.stt}</td>
                      <td className="border-r border-slate-200 px-4 py-1.5 text-blue-800 font-bold">{row.opCode}</td>
                      <td className="border-r border-slate-200 px-4 py-1.5 text-slate-800 font-sans">{row.opName}</td>
                      <td className="border-r border-slate-200 px-4 py-1.5 text-slate-600">{row.machineType}</td>
                      <td className="border-r border-slate-200 px-4 py-1.5 text-right font-bold text-slate-900">{row.sam.toFixed(2)}</td>
                      <td className="border-r border-slate-200 px-4 py-1.5 text-right text-slate-600">{row.smv.toFixed(2)}</td>
                      <td className="border-r border-slate-200 px-4 py-1.5 text-right font-medium text-emerald-700">{row.ratio.toFixed(2)}%</td>
                      <td className="border-r border-slate-200 px-4 py-1.5 text-center text-indigo-700 font-bold">{row.difficulty}</td>
                      <td className="px-4 py-1.5 text-center text-purple-700 font-bold">{row.requiredSkill}</td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-slate-50 font-bold border-t border-slate-300">
                    <td className="border-r border-slate-200 px-3 py-2 text-center text-slate-400">★</td>
                    <td className="border-r border-slate-200 px-4 py-2 text-slate-500 uppercase">TỔNG</td>
                    <td className="border-r border-slate-200 px-4 py-2 font-sans font-normal text-slate-400 text-[10px]">Tính toán tự động từ hệ thống</td>
                    <td className="border-r border-slate-200 px-4 py-2 text-slate-400">-</td>
                    <td className="border-r border-slate-200 px-4 py-2 text-right text-primary font-mono text-xs">{routingData.reduce((acc, curr) => acc + curr.sam, 0).toFixed(2)}</td>
                    <td className="border-r border-slate-200 px-4 py-2 text-right text-slate-700 font-mono text-xs">{routingData.reduce((acc, curr) => acc + curr.smv, 0).toFixed(2)}</td>
                    <td className="border-r border-slate-200 px-4 py-2 text-right text-emerald-800 font-mono text-xs">100.00%</td>
                    <td className="border-r border-slate-200 px-4 py-2">-</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors"
          >
            Đóng lại
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Tải File Excel (.csv)
          </button>
        </div>
      </div>
    </div>
  );
}
