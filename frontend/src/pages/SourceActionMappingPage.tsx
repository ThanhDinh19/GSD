import { useMemo, useState } from 'react';
import { GsdCode } from '../types';
import { useSourceActionMapping } from '../hooks/useSourceActionMapping';

export default function SourceActionMappingPage() {
    const {
        sources,
        gsdCodes,
        selectedSourceId,
        details,
        loading,
        totalActions,
        totalTmu,
        selectSource,
        addGsdCodesToDetails,
        removeDetail,
        clearDetails,
        saveMapping,
    } = useSourceActionMapping();

    const selectedDetailGsdIds = useMemo(() => {
        return new Set(
            details
                .map((item) => item.gsdCodeId)
                .filter((id): id is number => id !== null && id !== undefined)
        );
    }, [details]);

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedGsdIds, setSelectedGsdIds] = useState<number[]>([]);
    const [hasChanged, setHasChanged] = useState(false);

    const filteredGsdCodes = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();

        const activeGsdCodes = gsdCodes.filter((item) => item.statusId === 0);

        if (!keyword) return activeGsdCodes;

        return activeGsdCodes.filter((item) => {
            return (
                item.actionName.toLowerCase().includes(keyword) ||
                String(item.gsdCode || '').toLowerCase().includes(keyword) ||
                String(item.codeNew || '').toLowerCase().includes(keyword)
            );
        });
    }, [gsdCodes, searchText]);

    const selectedSource = sources.find(item => item.id === selectedSourceId);

    const toggleGsdCode = (id: number) => {
        if (selectedDetailGsdIds.has(id)) {
            return;
        }

        setSelectedGsdIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter(item => item !== id);
            }

            return [...prev, id];
        });
    };

    const handleTakeData = () => {
        const selectedItems = gsdCodes.filter((item) => {
            return selectedGsdIds.includes(item.id) && !selectedDetailGsdIds.has(item.id);
        });

        if (selectedItems.length === 0) {
            alert('Không có thao tác mới để lấy dữ liệu.');
            return;
        }

        addGsdCodesToDetails(selectedItems);
        setHasChanged(true);
        setSelectedGsdIds([]);
        setSearchText('');
        setIsPopupOpen(false);
    };

    const handleSave = async () => {
        try {
            await saveMapping();
            setHasChanged(false);
            alert('Đã lưu khai báo thao tác thuộc source.');
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
                            Khai báo thao tác thuộc source
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Chọn source, thêm thao tác chuẩn từ kho GSD, sau đó lưu mapping.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setSelectedGsdIds([]);
                                setIsPopupOpen(true);
                            }}
                            disabled={!selectedSourceId}
                            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 disabled:opacity-50"
                        >
                            + Thêm thao tác
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const ok = confirm('Xóa tất cả thao tác khỏi source này?');
                                if (!ok) return;

                                clearDetails();
                                setHasChanged(true);
                            }}
                            disabled={!selectedSourceId || details.length === 0}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 disabled:opacity-50"
                        >
                            Xóa tất cả
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={!selectedSourceId}
                            className="px-4 py-2 bg-green-700 text-white rounded-lg text-xs font-bold hover:bg-green-800 disabled:opacity-50"
                        >
                            Lưu
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Source name
                        </label>
                        <select
                            value={selectedSourceId ?? ''}
                            onChange={async (e) => {
                                if (!e.target.value) return;

                                if (hasChanged) {
                                    const ok = confirm('Bạn có thay đổi chưa lưu. Đổi source sẽ mất thay đổi hiện tại. Tiếp tục?');
                                    if (!ok) return;
                                }

                                await selectSource(Number(e.target.value));
                                setHasChanged(false);
                            }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">-- Chọn source --</option>
                            {sources.map(source => (
                                <option key={source.id} value={source.id}>
                                    {source.sourceCode}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Tổng thao tác
                        </label>
                        <input
                            value={totalActions}
                            readOnly
                            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Tổng TMU
                        </label>
                        <input
                            value={totalTmu}
                            readOnly
                            className="w-full border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm font-bold"
                        />
                    </div>
                </div>

                {selectedSource && (
                    <div className="mb-3 text-xs text-slate-500">
                        {hasChanged && (
                            <div className="mb-3 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">
                                Bạn có thay đổi chưa lưu. Bấm “Lưu” để cập nhật dữ liệu.
                            </div>
                        )}
                        Đang khai báo cho source:
                        <span className="ml-1 font-bold text-slate-700">
                            {selectedSource.sourceCode}
                        </span>
                    </div>
                )}

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">STT</th>
                                <th className="px-4 py-3 text-left">Source</th>
                                <th className="px-4 py-3 text-left">Thao tác</th>
                                <th className="px-4 py-3 text-left">Code</th>
                                <th className="px-4 py-3 text-left">Code mới</th>
                                <th className="px-4 py-3 text-right">Tần suất</th>
                                <th className="px-4 py-3 text-right">TMU</th>
                                <th className="px-4 py-3 text-left">Ghi chú</th>
                                <th className="px-4 py-3 text-center">Xóa</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            )}

                            {!loading && details.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                                        Chưa có thao tác. Hãy chọn source và bấm Thêm thao tác.
                                    </td>
                                </tr>
                            )}

                            {!loading && details.map((item, index) => (
                                <tr key={`${item.gsdCodeId}-${index}`} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-mono text-slate-500">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-3 text-slate-700">
                                        {selectedSource?.sourceCode || ''}
                                    </td>

                                    <td className="px-4 py-3 text-slate-700">
                                        {item.actionName}
                                    </td>

                                    <td className="px-4 py-3 text-slate-700">
                                        {item.gsdCode}
                                    </td>

                                    <td className="px-4 py-3 text-slate-700">
                                        {item.codeNew}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        {item.frequency}
                                    </td>

                                    <td className="px-4 py-3 text-right font-bold">
                                        {item.tmu}
                                    </td>

                                    <td className="px-4 py-3 text-slate-500">
                                        {item.note}
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const ok = confirm(`Xóa thao tác "${item.actionName}" khỏi source này?`);
                                                if (!ok) return;

                                                removeDetail(index);
                                                setHasChanged(true);
                                            }}
                                            className="text-red-600 hover:underline"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isPopupOpen && (
                <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl border border-slate-200">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black text-slate-800 uppercase">
                                    Chọn thao tác chuẩn
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Tìm kiếm và chọn nhiều thao tác từ kho thao tác chuẩn.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsPopupOpen(false)}
                                className="text-slate-400 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <input
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="Tìm theo tên thao tác, code, code mới..."
                            />

                            <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-[420px] overflow-y-auto">
                                <table className="min-w-full text-xs">
                                    <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-center w-32">Chọn</th>
                                            <th className="px-4 py-3 text-left">STT</th>
                                            <th className="px-4 py-3 text-left">Thao tác</th>
                                            <th className="px-4 py-3 text-left">Code</th>
                                            <th className="px-4 py-3 text-left">Code mới</th>
                                            <th className="px-4 py-3 text-right">Tần suất</th>
                                            <th className="px-4 py-3 text-right">TMU</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {filteredGsdCodes.map((item, index) => {
                                            const isAlreadySelected = selectedDetailGsdIds.has(item.id);
                                            const isChecked = isAlreadySelected || selectedGsdIds.includes(item.id);

                                            return (
                                                <tr
                                                    key={item.id}
                                                    onClick={() => {
                                                        if (!isAlreadySelected) {
                                                            toggleGsdCode(item.id);
                                                        }
                                                    }}
                                                    className={`transition-colors ${isAlreadySelected
                                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        : 'hover:bg-blue-50 cursor-pointer'
                                                        }`}
                                                    title={isAlreadySelected ? 'Thao tác này đã được chọn' : 'Click để chọn thao tác'}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                disabled={isAlreadySelected}
                                                                onChange={() => toggleGsdCode(item.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />

                                                            {isAlreadySelected && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 whitespace-nowrap">
                                                                    Đã chọn
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3 font-mono text-slate-500">
                                                        {index + 1}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {item.actionName}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {item.gsdCode}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {item.codeNew}
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        {item.frequency}
                                                    </td>

                                                    <td className="px-4 py-3 text-right font-bold">
                                                        {item.tmu}
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
                                    onClick={() => setIsPopupOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="button"
                                    onClick={handleTakeData}
                                    disabled={selectedGsdIds.length === 0}
                                    className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 disabled:opacity-50"
                                >
                                    Lấy dữ liệu ({selectedGsdIds.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}