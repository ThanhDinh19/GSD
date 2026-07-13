
import {useState } from 'react';

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
    onToggleRowSelection: (
        sourceId: number,
        rowIndex: number,
        checked: boolean
    ) => void;
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
    onToggleRowSelection,
}: SourceActionPickerModalProps) {

    const [keyword, setKeyword] = useState("");

    const filteredSources = keyword.trim() 
        ? sources.filter((item) => {
            return item.note?.toLowerCase().includes(keyword.toLowerCase()) || item.sourceName?.toLowerCase().includes(keyword.toLowerCase());
        }) : sources;

     
    return (
        <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-[1500px] max-w-[96vw] h-[820px] max-h-[92vh] border border-slate-200 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase">
                            Lấy thao tác thuộc source
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Chọn source ở danh sách bên trái, nhập bước cho thao tác cần phân tích.
                            Các bước không được trùng trên tất cả source.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 min-h-0 overflow-hidden">
                    <div className="grid grid-cols-[360px_1fr] gap-5 h-full min-h-0">
                        {/* LEFT: Source list */}
                        <div className="h-full min-h-0">
                            <div className="border border-slate-200 rounded-xl overflow-hidden h-full flex flex-col">
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                    <div className="text-sm font-bold text-slate-700">Source</div>
                                </div>

                                <div className="px-4 py-3 ">
                                    <div className="text-sm font-bold text-slate-700">Tìm kiếm</div>
                                    <input 
                                        type="text"
                                        placeholder='Nhập tên source, ghi chú'
                                        value={keyword}
                                        onChange={(e) => {
                                            setKeyword(e.target.value),
                                            console.log("Giá trị vừa nhập: ", e.target.value)
                                        }}
                                        style={{
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                <div className="flex-1 min-h-0 overflow-y-auto">
                                    {filteredSources.length === 0 ? (
                                        <div className="px-4 py-6 text-sm text-slate-400 text-center">
                                            Không có source
                                        </div>
                                    ) : (
                                        <div className="p-2 space-y-2">
                                            {filteredSources.map((source) => {
                                                const isActive = popupSourceId === source.id;
                                                return (
                                                    <button
                                                        key={source.id}
                                                        type="button"
                                                        onClick={() => onSelectSource(source.id)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition
                                                            ${isActive
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <div className="font-semibold">
                                                            {source.sourceName}
                                                        </div>
                                                        {source.note && (
                                                            <div
                                                                className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-slate-400'
                                                                    }`}
                                                            >
                                                                {source.note}
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Actions */}
                        <div className="h-full min-h-0 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="text-sm font-bold text-slate-700">
                                        {popupSourceId
                                            ? `Thao tác của source đang chọn`
                                            : 'Danh sách thao tác'}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        Tick chọn thao tác, hệ thống sẽ tự đánh số bước theo thứ tự chọn.
                                    </div>
                                </div>

                                <div className="w-44">
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

                            <div className="flex-1 min-h-0 overflow-auto border border-slate-200 rounded-xl">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-600 uppercase sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-[80px]">Chọn</th>
                                            <th className="px-4 py-3 text-left w-[80px]">STT</th>
                                            <th className="px-4 py-3 text-left">Thao tác</th>
                                            <th className="px-4 py-3 text-left w-[120px]">Code</th>
                                            <th className="px-4 py-3 text-left w-[120px]">Bước</th>
                                            <th className="px-4 py-3 text-left w-[120px]">Tần suất</th>
                                            <th className="px-4 py-3 text-right w-[100px]">TMU</th>
                                            <th className="px-4 py-3 text-left">Ghi chú</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {loadingSourceActions && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                                                    Đang tải thao tác...
                                                </td>
                                            </tr>
                                        )}

                                        {!loadingSourceActions && !popupSourceId && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                                                    Vui lòng chọn source ở cột bên trái.
                                                </td>
                                            </tr>
                                        )}

                                        {!loadingSourceActions && popupSourceId && popupRows.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                                                    Source này chưa có thao tác được khai báo.
                                                </td>
                                            </tr>
                                        )}

                                        {!loadingSourceActions &&
                                            popupRows.map((row, index) => {
                                                const isChecked =
                                                    row.stepNo !== null &&
                                                    row.stepNo !== undefined &&
                                                    String(row.stepNo).trim() !== '';

                                                return (
                                                    <tr
                                                        key={`${row.sourceActionDetailId}-${index}`}
                                                        className={isChecked ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                                                    >
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                    if (!popupSourceId) return;

                                                                    onToggleRowSelection(
                                                                        popupSourceId,
                                                                        index,
                                                                        e.target.checked
                                                                    );
                                                                }}
                                                                title="Tick để tự đánh số bước"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-3 text-slate-500">{index + 1}</td>

                                                        <td className="px-4 py-3 text-slate-700">
                                                            {row.actionName}
                                                        </td>

                                                        <td className="px-4 py-3 text-slate-700">
                                                            {row.gsdCode}
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={row.stepNo ?? ''}
                                                                readOnly
                                                                className="w-24 border border-slate-200 bg-slate-50 rounded px-2 py-1 text-sm text-center font-bold text-blue-700"
                                                                placeholder="-"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={row.frequency ?? 1}
                                                                onChange={(e) => {
                                                                    if (!popupSourceId) return;
                                                                    onFrequencyChange(popupSourceId, index, e.target.value);
                                                                }}
                                                                className="w-24 border border-slate-300 rounded px-2 py-1 text-sm"
                                                            />
                                                        </td>

                                                        <td className="px-4 py-3 text-right font-bold text-slate-800">
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

                            <div className="shrink-0 flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="button"
                                    onClick={onTakeData}
                                    className="px-5 py-2 rounded-lg bg-blue-700 text-white text-sm font-bold hover:bg-blue-800"
                                >
                                    Lấy dữ liệu ({selectedDraftCount})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}