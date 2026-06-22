import { useMemo, useState } from 'react';
import { GsdAnalysisPayload } from '../types';
import { useGsdAnalysis } from '../hooks/useGsdAnalysis';
import SourceActionPickerModal from '../components/gsd-analysis/SourceActionPickerModal';

const initialForm: Omit<GsdAnalysisPayload, 'sourceId' | 'details'> = {
    machineId: null,
    operationName: '',
    seamLength: 0,
    attachedActionTime: 0,
    difficultyPercent: 0,
    productMultiplier: 1,
    note: '',
};

function formatNumber(value: number | null | undefined, digits = 4) {
    const numberValue = Number(value || 0);
    return numberValue.toFixed(digits);
}

function formatDateTime(value?: string) {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString('vi-VN');
}

function getLaborGradeByDifficulty(value: number | null | undefined) {
    if (value === null || value === undefined || value === 0) return 2;
    if (Number(value) === 5) return 3;
    if (Number(value) === 10) return 4;
    if (Number(value) === 15) return 5;
    return 6;
}


export default function GsdAnalysisPage() {
    const {
        sources,
        machines,

        popupSourceId,
        popupRows,
        selectedDraftRows,
        analysisRows,

        loadingSourceActions,
        calculating,
        saving,
        result,

        selectPopupSource,
        updatePopupStepNo,
        uncheckPopupRow,
        takeSelectedActionsToAnalysis,
        clearAnalysisRows,

        calculate,
        save,
        updatePopupFrequency,

        analyses,
        loadingAnalyses,
        loadAnalyses,
        togglePopupActionRow,

    } = useGsdAnalysis();

    const [form, setForm] = useState(initialForm);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const selectedMachine = useMemo(() => {
        return machines.find((item) => item.id === Number(form.machineId)) || null;
    }, [machines, form.machineId]);

    const previewLaborGrade = getLaborGradeByDifficulty(
        form.difficultyPercent === null || form.difficultyPercent === undefined
            ? null
            : Number(form.difficultyPercent)
    );

    const selectedRows = analysisRows;

    const previewTotalTmu = analysisRows.reduce((sum, item) => {
        return sum + Number(item.tmu || 0) * Number(item.frequency || 0);
    }, 0);

    const previewManualSeconds = analysisRows.reduce((sum, item) => {
        return sum + (Number(item.tmu || 0) * Number(item.frequency || 0)) / 27.8;
    }, 0);

    const handleNumberChange = (
        key: keyof Omit<GsdAnalysisPayload, 'sourceId' | 'details'>,
        value: string
    ) => {
        setForm({
            ...form,
            [key]: value === '' ? null : Number(value),
        });
    };

    const validateBeforeCalculate = () => {


        if (!form.operationName?.trim()) {
            alert('Vui lòng nhập Tên công đoạn.');
            return false;
        }

        if (selectedRows.length === 0) {
            alert('Vui lòng nhập Bước cho ít nhất một thao tác.');
            return false;
        }

        const stepNumbers = selectedRows.map((row) => Number(row.stepNo));
        const uniqueStepNumbers = new Set(stepNumbers);

        if (stepNumbers.length !== uniqueStepNumbers.size) {
            alert('Số bước không được nhập trùng.');
            return false;
        }

        return true;
    };

    const handleCalculate = async () => {
        if (!validateBeforeCalculate()) return;

        try {
            await calculate(form);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Tính phân tích thất bại.');
        }
    };

    const handleSave = async () => {
        if (!validateBeforeCalculate()) return;

        try {
            const response = await save(form);
            alert(`${response.message}\nMã phân tích: ${response.data.analysisNo}`);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Lưu phân tích thất bại.');
        }
    };



    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl border-slate-200 p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            Phân tích công đoạn
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Bấm “Lấy thao tác” để chọn source và các bước thao tác, sau đó phân tích TMU/SMV.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsPickerOpen(true)}
                            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
                        >
                            Lấy thao tác
                        </button>

                        <button
                            onClick={clearAnalysisRows}
                            disabled={analysisRows.length === 0}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 disabled:opacity-50"
                        >
                            Xóa thao tác
                        </button>

                        <button
                            onClick={handleCalculate}
                            disabled={calculating}
                            className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-50 disabled:opacity-50"
                        >
                            {calculating ? 'Đang tính...' : 'Phân tích'}
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 bg-green-700 text-white rounded-lg text-xs font-bold hover:bg-green-800 disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu phân tích'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">


                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Tên công đoạn <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={form.operationName}
                            onChange={(e) => setForm({ ...form, operationName: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            placeholder="VD: Ráp"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Loại máy / MMTB
                        </label>
                        <select
                            value={form.machineId ?? ''}
                            onChange={(e) => {
                                setForm({
                                    ...form,
                                    machineId: e.target.value ? Number(e.target.value) : null,
                                });
                            }}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">-- Chọn máy --</option>
                            {machines.map((machine) => (
                                <option key={machine.id} value={machine.id}>
                                    {machine.machineCode} - {machine.machineName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Mức độ phức tạp (%)
                        </label>
                        <select
                            value={form.difficultyPercent ?? 0}
                            onChange={(e) => handleNumberChange('difficultyPercent', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={10}>10%</option>
                            <option value={15}>15%</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Đường may
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.seamLength ?? ''}
                            onChange={(e) => handleNumberChange('seamLength', e.target.value)}
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
                            Hệ số nhân SP
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.productMultiplier ?? 1}
                            onChange={(e) => handleNumberChange('productMultiplier', e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Ghi chú
                        </label>
                        <input
                            value={form.note || ''}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                {selectedMachine && (
                    <div className="mb-5 grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Số mũi chỉ</div>
                            <div className="font-bold text-slate-800">{selectedMachine.stitchCount ?? 0}</div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Tốc độ máy</div>
                            <div className="font-bold text-slate-800">{selectedMachine.machineSpeed ?? 0}</div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Vận tốc máy</div>
                            <div className="font-bold text-slate-800">
                                {result
                                    ? Number(result.machineVelocity || 0).toFixed(4)
                                    : selectedMachine.machineSpeed
                                        ? (((Number(selectedMachine.stitchCount || 0) / Number(selectedMachine.machineSpeed || 1)) * 60)).toFixed(4)
                                        : '0.0000'}
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Hao phí</div>
                            <div className="font-bold text-slate-800">{selectedMachine.allowance ?? 0}</div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Bậc tay nghề</div>
                            <div className="font-bold text-slate-800">
                                {previewLaborGrade}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-5 text-xs">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="text-blue-600">Tổng thao tác</div>
                        <div className="font-black text-blue-900 text-lg">{selectedRows.length}</div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="text-blue-600">Tổng TMU</div>
                        <div className="font-black text-blue-900 text-lg">
                            {result ? formatNumber(result.totalTmu, 2) : formatNumber(previewTotalTmu, 2)}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="text-blue-600">Giây thao tác</div>
                        <div className="font-black text-blue-900 text-lg">
                            {result ? formatNumber(result.totalManualSeconds, 4) : formatNumber(previewManualSeconds, 4)}
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                        <div className="text-orange-600">Thời gian MMTB</div>
                        <div className="font-black text-orange-900 text-lg">
                            {result ? formatNumber(result.machineSeconds, 4) : '0.0000'}
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <div className="text-amber-600">Thời gian mức độ</div>
                        <div className="font-black text-amber-900 text-lg">
                            {result ? formatNumber(result.difficultySeconds, 4) : '0.0000'}
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <div className="text-green-600">SMV cuối</div>
                        <div className="font-black text-green-900 text-lg">
                            {result ? formatNumber(result.finalSmv, 0) : '-'}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">STT</th>
                                <th className="px-4 py-3 text-left">Source</th>
                                <th className="px-4 py-3 text-left">Bước</th>
                                <th className="px-4 py-3 text-left">Code</th>
                                <th className="px-4 py-3 text-left">Thao tác</th>
                                <th className="px-4 py-3 text-right">TMU</th>
                                <th className="px-4 py-3 text-right">Lặp lại</th>
                                <th className="px-4 py-3 text-right">Giây</th>
                                <th className="px-4 py-3 text-left">Ghi chú</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {analysisRows.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                                        Chưa có thao tác. Bấm “Lấy thao tác” để chọn thao tác từ source.
                                    </td>
                                </tr>
                            )}

                            {analysisRows.map((row, index) => {
                                const seconds = (Number(row.tmu || 0) * Number(row.frequency || 0)) / 27.8;

                                return (
                                    <tr key={`${row.sourceId}-${row.sourceActionDetailId}-${index}`}>
                                        <td className="px-4 py-3 font-mono text-slate-500">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-3 text-slate-700">
                                            {row.sourceCode}
                                        </td>

                                        <td className="px-4 py-3 font-bold text-blue-700">
                                            {row.stepNo}
                                        </td>

                                        <td className="px-4 py-3 text-slate-700">
                                            {row.gsdCode}
                                        </td>

                                        <td className="px-4 py-3 text-slate-700">
                                            {row.actionName}
                                        </td>

                                        <td className="px-4 py-3 text-right font-bold">
                                            {row.tmu}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            {row.frequency}
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            {formatNumber(seconds, 4)}
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
            </div>

            {/* <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            Danh sách công đoạn đã phân tích
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Các công đoạn đã được lưu sau khi bấm “Lưu phân tích”.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadAnalyses}
                        disabled={loadingAnalyses}
                        className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-50 disabled:opacity-50"
                    >
                        {loadingAnalyses ? 'Đang tải...' : 'Tải lại'}
                    </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">STT</th>
                                <th className="px-4 py-3 text-left">Mã phân tích</th>
                                <th className="px-4 py-3 text-left">Tên công đoạn</th>
                                <th className="px-4 py-3 text-left">Source</th>
                                <th className="px-4 py-3 text-left">Máy</th>
                                <th className="px-4 py-3 text-right">Tổng TMU</th>
                                <th className="px-4 py-3 text-right">Giây thao tác</th>
                                <th className="px-4 py-3 text-right">Thời gian MMTB</th>
                                <th className="px-4 py-3 text-right">Bậc tay nghề</th>
                                <th className="px-4 py-3 text-right">SMV cuối</th>
                                <th className="px-4 py-3 text-left">Ngày tạo</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loadingAnalyses && (
                                <tr>
                                    <td colSpan={11} className="px-4 py-6 text-center text-slate-400">
                                        Đang tải danh sách công đoạn đã phân tích...
                                    </td>
                                </tr>
                            )}

                            {!loadingAnalyses && analyses.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="px-4 py-6 text-center text-slate-400">
                                        Chưa có công đoạn nào được phân tích.
                                    </td>
                                </tr>
                            )}

                            {!loadingAnalyses && analyses.map((item, index) => (
                                <tr key={item.id} className="hover:bg-blue-50">
                                    <td className="px-4 py-3 font-mono text-slate-500">
                                        {index + 1}
                                    </td>

                                    <td className="px-4 py-3 font-bold text-slate-700">
                                        {item.analysisNo}
                                    </td>

                                    <td className="px-4 py-3 text-slate-700">
                                        {item.operationName}
                                    </td>

                                    <td className="px-4 py-3 text-slate-700">
                                        {item.sourceCode || '-'}
                                    </td>

                                    <td className="px-4 py-3 text-slate-700">
                                        {item.machineCode
                                            ? `${item.machineCode}${item.machineName ? ` - ${item.machineName}` : ''}`
                                            : '-'}
                                    </td>

                                    <td className="px-4 py-3 text-right font-bold">
                                        {Number(item.totalTmu || 0).toFixed(2)}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        {Number(item.totalManualSeconds || 0).toFixed(4)}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        {Number(item.machineSeconds || 0).toFixed(4)}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        {item.skillGrade ?? '-'}
                                    </td>

                                    <td className="px-4 py-3 text-right font-black text-green-700">
                                        {Number(item.finalSmv || 0).toFixed(0)}
                                    </td>

                                    <td className="px-4 py-3 text-slate-500">
                                        {formatDateTime(item.createdAt || item.analysisDate)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div> */}



            {isPickerOpen && (
                <SourceActionPickerModal
                    sources={sources}
                    popupSourceId={popupSourceId}
                    popupRows={popupRows}
                    loadingSourceActions={loadingSourceActions}
                    selectedDraftCount={selectedDraftRows.length}
                    onSelectSource={selectPopupSource}
                    onStepChange={updatePopupStepNo}
                    onFrequencyChange={updatePopupFrequency}
                    onUncheckRow={uncheckPopupRow}
                    onToggleRowSelection={togglePopupActionRow}
                    onTakeData={() => {
                        const count = takeSelectedActionsToAnalysis();
                        if (count > 0) {
                            setIsPickerOpen(false);
                        }
                    }}
                    onClose={() => setIsPickerOpen(false)}
                />
            )}
        </div>
    );
}