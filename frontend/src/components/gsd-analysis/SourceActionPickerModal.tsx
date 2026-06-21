import { GsdAnalysisRow, SourceMaster } from '../../types';



interface SourceActionPickerModalProps {
    sources: SourceMaster[];
    popupSourceId: number | null;
    popupRows: GsdAnalysisRow[];
    loadingSourceActions: boolean;
    selectedDraftCount: number;
    onSelectSource: (sourceId: number) => Promise<void>;
    onStepChange: (sourceId: number, rowIndex: number, value: string) => void;
    onFrequencyChange: (sourceId: number, rowIndex: number, value: string) => void;
    onUncheckRow: (sourceId: number, rowIndex: number) => void;
    onTakeData: () => void;
    onClose: () => void;
}

export default function SourceActionPickerModal({
    sources,
    popupSourceId,
    popupRows,
    loadingSourceActions,
    selectedDraftCount,
    onSelectSource,
    onStepChange,
    onFrequencyChange,
    onUncheckRow,
    onTakeData,
    onClose,
}: SourceActionPickerModalProps) {
    return (
        <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl border border-slate-200">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase">
                            Lấy thao tác thuộc source
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Chọn source, nhập số bước cho thao tác cần phân tích. Các bước không được trùng trên tất cả source.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 text-xl"
                    >
                        ×
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Source
                            </label>
                            <select
                                value={popupSourceId ?? ''}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        onSelectSource(Number(e.target.value));
                                    }
                                }}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="">-- Chọn source --</option>
                                {sources.map((source) => (
                                    <option key={source.id} value={source.id}>
                                        {source.sourceCode}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Đã chọn
                            </label>
                            <input
                                value={selectedDraftCount}
                                readOnly
                                className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[460px] overflow-y-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0 z-10">
                  
                                    <tr>
                                        <th className="px-4 py-3 text-center">Chọn</th>
                                        <th className="px-4 py-3 text-left">STT</th>
                                        <th className="px-4 py-3 text-left">Thao tác</th>
                                        <th className="px-4 py-3 text-left">Code</th>
                                        <th className="px-4 py-3 text-left">Bước</th>
                                        <th className="px-4 py-3 text-right">Tần suất</th>
                                        <th className="px-4 py-3 text-right">TMU</th>
                                        <th className="px-4 py-3 text-left">Ghi chú</th>
                                    </tr>
                      
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loadingSourceActions && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                                            Đang tải thao tác...
                                        </td>
                                    </tr>
                                )}

                                {!loadingSourceActions && !popupSourceId && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                                            Vui lòng chọn source.
                                        </td>
                                    </tr>
                                )}

                                {!loadingSourceActions && popupSourceId && popupRows.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                                            Source này chưa có thao tác được khai báo.
                                        </td>
                                    </tr>
                                )}

                                {!loadingSourceActions && popupRows.map((row, index) => {
                                    const isChecked = row.stepNo !== null && row.stepNo !== undefined;

                                    return (
                                        <tr
                                            key={`${row.sourceActionDetailId}-${index}`}
                                            className={isChecked ? 'hover:bg-blue-50' : 'bg-slate-50 text-slate-500'}
                                        >
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        if (!popupSourceId) return;

                                                        if (!e.target.checked) {
                                                            onUncheckRow(popupSourceId, index);
                                                        }
                                                    }}
                                                    title="Nhập bước để chọn thao tác này"
                                                />
                                            </td>

                                            <td className="px-4 py-3 font-mono text-slate-500">
                                                {index + 1}
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {row.actionName}
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {row.gsdCode}
                                            </td>

                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={row.stepNo ?? ''}
                                                    onChange={(e) => {
                                                        if (!popupSourceId) return;

                                                        const value = e.target.value;

                                                        if (!/^\d*$/.test(value)) {
                                                            return;
                                                        }

                                                        onStepChange(popupSourceId, index, value);
                                                    }}
                                                    className="w-24 border border-slate-300 rounded px-2 py-1 text-xs"
                                                    placeholder="Bước"
                                                />
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={row.frequency ?? ''}
                                                    onChange={(e) => {
                                                        if (!popupSourceId) return;
                                                        onFrequencyChange(popupSourceId, index, e.target.value);
                                                    }}
                                                    className="w-20 border border-slate-300 rounded px-2 py-1 text-xs text-right"
                                                />
                                            </td>

                                            <td className="px-4 py-3 text-right font-bold">
                                                {row.tmu}
                                            </td>

                                            <td className="px-4 py-3 text-slate-500">
                                                {row.note}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                        >
                            Hủy
                        </button>

                        <button
                            type="button"
                            onClick={onTakeData}
                            className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800"
                        >
                            Lấy dữ liệu ({selectedDraftCount})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}