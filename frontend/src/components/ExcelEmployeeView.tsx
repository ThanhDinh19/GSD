import React, { useState, useEffect, useRef } from 'react';
import { 
  SpreadsheetComponent, 
  SheetsDirective, 
  SheetDirective, 
  RangesDirective, 
  RangeDirective, 
  ColumnsDirective, 
  ColumnDirective 
} from '@syncfusion/ej2-react-spreadsheet';
import { registerLicense } from '@syncfusion/ej2-base';

// Register Syncfusion trial license key from environment or fallback
const SYNCFUSION_LICENSE = (import.meta as any).env?.VITE_SYNCFUSION_LICENSE || 'Ngo9BigBOggjHTQxAR8/V1JHaF1cXmhPYVFxWmFZfVhgdVVMYVxbR3VPMyBoS35RcEVmW3dfcHVVRWdVUkR2VEFe';
registerLicense(SYNCFUSION_LICENSE);

const getBackendUrl = () => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_API_URL !== undefined) return metaEnv.VITE_API_URL;
  return '';
};
const API_BASE_URL = getBackendUrl();

interface ExcelEmployeeViewProps {
  onRefreshData?: () => void;
}

interface ColumnMapItem {
  excelColumn: string;
  dbColumn: string;
}

export default function ExcelEmployeeView({ onRefreshData }: ExcelEmployeeViewProps) {
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [saveMsg, setSaveMsg] = useState<string>('');
  const [key, setKey] = useState<number>(1);
  const spreadsheetRef = useRef<SpreadsheetComponent | null>(null);

  // Dynamic Structure Declaration State (Popup Form)
  const [showMappingModal, setShowMappingModal] = useState<boolean>(false);
  const [sheetNames, setSheetNames] = useState<string[]>(['Sheet1']);
  const [selectedSheet, setSelectedSheet] = useState<string>('Employee Database');
  const [tableName, setTableName] = useState<string>('employees');
  const [startRow, setStartRow] = useState<number>(2);
  const [endRow, setEndRow] = useState<number>(4);
  
  // Dynamic column mapping key-value items
  const [mappingItems, setMappingItems] = useState<ColumnMapItem[]>([
    { excelColumn: 'Tên nhân viên', dbColumn: 'name' },
    { excelColumn: 'Email', dbColumn: 'email' },
    { excelColumn: 'Số điện thoại', dbColumn: 'phone' },
    { excelColumn: 'Địa chỉ', dbColumn: 'address' }
  ]);

  // Validation status
  const [validatedOnce, setValidatedOnce] = useState<boolean>(false);

  const fetchEmployees = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/data`)
      .then(res => {
        if (!res.ok) throw new Error('Yêu cầu dữ liệu Nhân sự thất bại');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setEmployeeData(data);
        }
        setLoading(false);
        setKey(prev => prev + 1);
      })
      .catch(err => {
        console.error('Lỗi tải dữ liệu nhân viên:', err);
        setLoading(false);
      });
  };

  const fetchMappingConfig = () => {
    fetch(`${API_BASE_URL}/api/mapping-config/employees`)
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải cấu hình ánh xạ');
        return res.json();
      })
      .then(config => {
        if (config.tableName) setTableName(config.tableName);
        if (config.sheetName) setSelectedSheet(config.sheetName);
        if (config.startRow) setStartRow(config.startRow);
        if (config.endRow) setEndRow(config.endRow);
        if (Array.isArray(config.mappingItems)) setMappingItems(config.mappingItems);
      })
      .catch(err => {
        console.error('Lỗi tải cấu hình:', err);
      });
  };

  useEffect(() => {
    fetchEmployees();
    fetchMappingConfig();
  }, []);

  const getCellValue = (row: any, colIdx: number): string => {
    if (!row || !row.cells || !row.cells[colIdx]) return '';
    const cell = row.cells[colIdx];
    if (cell.value === undefined || cell.value === null) return '';
    return String(cell.value).trim();
  };

  // Convert Excel column letters (A, B, C...) to 0-indexed column index
  const letterToColumnIndex = (letter: string): number => {
    const clean = letter.trim().toUpperCase();
    if (!/^[A-Z]+$/.test(clean)) return -1;
    let index = 0;
    for (let i = 0; i < clean.length; i++) {
      index = index * 26 + (clean.charCodeAt(i) - 64);
    }
    return index - 1;
  };

  // Extract column index based on column letter or first row header name matching
  const getColumnIndex = (colInput: string): number => {
    const trimmed = colInput.trim();
    if (!trimmed) return -1;

    // 1. First, search for matching header text in Row 1 (case-insensitive)
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      try {
        const activeSheet = spreadsheet.getActiveSheet();
        const headerRow = activeSheet.rows[0];
        if (headerRow && headerRow.cells) {
          for (let c = 0; c < 50; c++) {
            const cellVal = getCellValue(headerRow, c);
            if (cellVal.toLowerCase() === trimmed.toLowerCase()) {
              return c;
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    // 2. If no header matches, check if it's a valid column letter (A, B, C... up to 3 chars)
    if (/^[A-Za-z]{1,3}$/.test(trimmed)) {
      const idx = letterToColumnIndex(trimmed);
      if (idx !== -1 && idx < 16384) {
        return idx;
      }
    }

    return -1;
  };

  const handleDataBound = () => {
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      const names = spreadsheet.sheets.map((s: any) => s.name);
      setSheetNames(names);
    }
  };

  // Dynamic rows methods
  const addMappingItem = () => {
    setMappingItems(prev => [...prev, { excelColumn: '', dbColumn: '' }]);
  };

  const removeMappingItem = (index: number) => {
    setMappingItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateMappingItem = (index: number, key: keyof ColumnMapItem, value: string) => {
    setMappingItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, [key]: value };
      }
      return item;
    }));
  };

  const handleSaveData = async () => {
    setValidatedOnce(true);

    const isInvalid = mappingItems.some(item => !item.excelColumn.trim() || !item.dbColumn.trim()) || !tableName.trim();
    if (isInvalid) return;

    const spreadsheet = spreadsheetRef.current;
    if (!spreadsheet) return;

    setShowMappingModal(false);
    setSaveStatus('loading');
    setSaveMsg(`Đang trích xuất và đồng bộ dữ liệu vào bảng [${tableName}]...`);

    try {
      // Save mapping configuration to database first
      await fetch(`${API_BASE_URL}/api/mapping-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configKey: 'employees',
          tableName: tableName.trim(),
          sheetName: selectedSheet,
          startRow,
          endRow,
          mappingItems
        })
      });

      const activeSheet = spreadsheet.getActiveSheet();
      const payload: any[] = [];

      const startIdx = Math.max(1, startRow) - 1;
      const endIdx = Math.max(1, endRow) - 1;

      for (let r = startIdx; r <= endIdx; r++) {
        const row = activeSheet.rows[r];
        if (!row) continue;

        const rowObj: Record<string, string> = {};
        let hasData = false;

        mappingItems.forEach(item => {
          const colIdx = getColumnIndex(item.excelColumn);
          if (colIdx !== -1) {
            const val = getCellValue(row, colIdx);
            rowObj[item.dbColumn] = val;
            if (val) hasData = true;
          }
        });

        if (hasData) {
          payload.push(rowObj);
        }
      }

      // Sync through generic dynamic backend API
      const res = await fetch(`${API_BASE_URL}/api/generic/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: tableName.trim(),
          data: payload
        })
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Lưu thất bại');

      setSaveStatus('success');
      setSaveMsg(result.message);
      
      if (onRefreshData) {
        onRefreshData();
      }

      setTimeout(() => {
        fetchEmployees();
      }, 500);
    } catch (err: any) {
      console.error(err);
      setSaveStatus('error');
      setSaveMsg(`Lỗi đồng bộ: ${err.message}`);
    }
  };

  const handleDirectSave = () => {
    const isInvalid = mappingItems.some(item => !item.excelColumn.trim() || !item.dbColumn.trim()) || !tableName.trim();
    if (isInvalid) {
      alert("Cấu trúc lưu chưa được khai báo đầy đủ. Vui lòng cấu hình cấu trúc lưu trước!");
      setValidatedOnce(true);
      setShowMappingModal(true);
      return;
    }
    
    const spreadsheet = spreadsheetRef.current;
    if (spreadsheet && (spreadsheet as any).endEdit) {
      (spreadsheet as any).endEdit();
    }
    
    handleSaveData();
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 flex flex-col space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="text-xl">👥</span> Bảng tính Excel: Quản lý Thông tin Nhân sự
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Khai báo cấu trúc lưu dữ liệu để hệ thống tự động ghi nhận các dòng và cột Excel tương ứng vào bảng CSDL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDirectSave}
            className="bg-[#28a745] hover:bg-[#218838] text-white font-semibold text-xs px-4 py-2 rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            disabled={saveStatus === 'loading'}
          >
            💾 Lưu vào CSDL
          </button>

          <button
            onClick={() => {
              setValidatedOnce(false);
              setShowMappingModal(true);
            }}
            className="bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold text-xs px-4 py-2 rounded transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            📋 Khai báo cấu trúc lưu
          </button>

          <button
            onClick={fetchEmployees}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            disabled={loading}
          >
            🔄 Tải lại từ CSDL
          </button>
          
          {saveStatus !== 'idle' && (
            <div className={`text-xs px-3 py-1.5 rounded flex items-center gap-1.5 ${
              saveStatus === 'loading' ? 'bg-blue-50 text-blue-700' :
              saveStatus === 'success' ? 'bg-emerald-50 text-emerald-700' :
              'bg-rose-50 text-rose-700'
            }`}>
              {saveStatus === 'loading' && <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>}
              {saveStatus === 'success' && <span>✓</span>}
              {saveStatus === 'error' && <span>✗</span>}
              <span>{saveMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Declared Saving Structure Popup Modal (Exactly matching the screenshot) */}
      {showMappingModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 backdrop-blur-xs transition-opacity">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-200 max-w-3xl w-full p-6 mx-4 relative flex flex-col max-h-[92vh] animate-fadeIn">
            
            {/* Modal Close Button */}
            <button 
              onClick={() => setShowMappingModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-bold p-1 text-sm rounded cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Title */}
            <h3 className="text-base font-bold text-slate-800 pb-4 border-b border-slate-100 shrink-0">
              Khai báo cấu trúc lưu
            </h3>

            {/* Modal Body Container */}
            <div className="py-4 overflow-y-auto space-y-5 flex-1 pr-1">
              
              {/* Row 1 Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                
                {/* Choose Sheet */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Chọn sheet <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    className="text-xs border border-slate-300 rounded bg-white p-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {sheetNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Target DB Table */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Nhập bảng lưu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    placeholder="Nhập tên bảng lưu"
                    onChange={(e) => setTableName(e.target.value)}
                    className="text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  {validatedOnce && !tableName.trim() && (
                    <span className="text-[10px] text-rose-500 mt-0.5">Tên bảng không được để trống.</span>
                  )}
                </div>

                {/* Start Row Spinner */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Nhập dòng bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center border border-slate-300 rounded overflow-hidden h-9">
                    <button
                      type="button"
                      onClick={() => setStartRow(prev => Math.max(1, prev - 1))}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold px-3.5 h-full transition-colors cursor-pointer"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={startRow}
                      onChange={(e) => setStartRow(Math.max(1, Number(e.target.value)))}
                      className="w-full text-center text-xs h-full border-none focus:outline-none focus:ring-0 focus:border-transparent py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setStartRow(prev => prev + 1)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold px-3.5 h-full transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* End Row Spinner */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Nhập dòng kết thúc <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center border border-slate-300 rounded overflow-hidden h-9">
                    <button
                      type="button"
                      onClick={() => setEndRow(prev => Math.max(1, prev - 1))}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold px-3.5 h-full transition-colors cursor-pointer"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={endRow}
                      onChange={(e) => setEndRow(Math.max(1, Number(e.target.value)))}
                      className="w-full text-center text-xs h-full border-none focus:outline-none focus:ring-0 focus:border-transparent py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setEndRow(prev => prev + 1)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold px-3.5 h-full transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Faint Divider */}
              <div className="border-t border-slate-100 my-4 shrink-0"></div>

              {/* Dynamic Mapping List */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 shrink-0">
                  <div>
                    Cột trong file Excel <span className="text-rose-500">*</span>
                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                      (Nhập ký hiệu cột như A, B, C... hoặc tiêu đề ở dòng 1)
                    </span>
                  </div>
                  <div>
                    Cột trong bảng <span className="text-rose-500">*</span>
                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                      (Tên trường trong CSDL tương ứng)
                    </span>
                  </div>
                </div>

                {mappingItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-start">
                    
                    {/* Excel column name/letter */}
                    <div className="col-span-5 flex flex-col">
                      <input
                        type="text"
                        value={item.excelColumn}
                        placeholder="Nhập tên cột file Excel"
                        onChange={(e) => updateMappingItem(idx, 'excelColumn', e.target.value)}
                        className="text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-primary focus:outline-none w-full"
                      />
                      {validatedOnce && !item.excelColumn.trim() && (
                        <span className="text-[10px] text-rose-500 mt-1">Tên cột file Excel không được để trống.</span>
                      )}
                    </div>

                    {/* DB column name */}
                    <div className="col-span-6 flex flex-col">
                      <input
                        type="text"
                        value={item.dbColumn}
                        placeholder="Nhập tên cột trong bảng"
                        onChange={(e) => updateMappingItem(idx, 'dbColumn', e.target.value)}
                        className="text-xs border border-slate-300 rounded p-2 focus:ring-1 focus:ring-primary focus:outline-none w-full"
                      />
                      {validatedOnce && !item.dbColumn.trim() && (
                        <span className="text-[10px] text-rose-500 mt-1">Tên cột trong bảng không được để trống.</span>
                      )}
                    </div>

                    {/* Delete button */}
                    <div className="col-span-1 flex items-center justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => removeMappingItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors font-bold text-xs p-1 rounded hover:bg-slate-100 cursor-pointer"
                        title="Xóa dòng ánh xạ"
                      >
                        ✕
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Dynamic Mapping List Add Item Button */}
              <div className="flex shrink-0">
                <button
                  type="button"
                  onClick={addMappingItem}
                  className="w-7 h-7 bg-[#28a745] hover:bg-[#218838] text-white rounded-full flex items-center justify-center shadow transition-all cursor-pointer font-bold"
                  title="Thêm cột ánh xạ mới"
                >
                  +
                </button>
              </div>

            </div>

            {/* Modal Footer (Matching save style from screenshot) */}
            <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={handleSaveData}
                className="bg-[#007bff] hover:bg-[#0069d9] text-white text-xs font-semibold px-6 py-2.5 rounded transition-all shadow cursor-pointer flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M15.003 3h2.997v5h-2.997v-5zm8.997 1v20h-24v-24h20l4 4zm-19 5h14v-7h-14v7zm16 4h-18v9h18v-9z"/>
                </svg>
                Lưu
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="h-[550px] border border-slate-200 rounded overflow-hidden bg-slate-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
            <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs font-medium">Đang nạp danh sách nhân viên từ SQL Server...</span>
          </div>
        ) : (
          <SpreadsheetComponent 
            key={key}
            ref={(ref) => { spreadsheetRef.current = ref; }}
            allowOpen={true}
            allowSave={true}
            showRibbon={true}
            showFormulaBar={true}
            height="100%"
            dataBound={handleDataBound}
          >
            <SheetsDirective>
              <SheetDirective name="Employee Database">
                <RangesDirective>
                  <RangeDirective dataSource={employeeData}></RangeDirective>
                </RangesDirective>
                <ColumnsDirective>
                  <ColumnDirective width={180}></ColumnDirective>
                  <ColumnDirective width={220}></ColumnDirective>
                  <ColumnDirective width={150}></ColumnDirective>
                  <ColumnDirective width={300}></ColumnDirective>
                </ColumnsDirective>
              </SheetDirective>
            </SheetsDirective>
          </SpreadsheetComponent>
        )}
      </div>

      <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded border border-slate-100 select-none">
        <strong>Mẹo:</strong> Nhấp vào nút <strong>"📋 Khai báo cấu trúc lưu"</strong> để xác định phạm vi lưu dòng Excel, chọn bảng lưu và gán ánh xạ các cột Excel với cột tương ứng trong CSDL.
      </div>
    </div>
  );
}
