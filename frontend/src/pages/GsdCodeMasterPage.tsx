import { useRef, useState } from 'react';
import { GsdCode, GsdCodePayload } from '../types';
import { useGsdCodes } from '../hooks/useGsdCodes';
import { gsdCodeService } from '../services/gsdCode.service';

const emptyForm: GsdCodePayload = {
    actionCode: '',
    actionName: '',
    gsdCode: '',
    codeNew: '',
    frequency: 1,
    tmu: 0,
    note: '',
    statusId: 0,
};

export default function GsdCodeMasterPage() {
    const {
        gsdCodes,
        statuses,
        loading,
        loadGsdCodes,
        createGsdCode,
        updateGsdCode,
    } = useGsdCodes();

    const [selectedItem, setSelectedItem] = useState<GsdCode | null>(null);
    const [form, setForm] = useState<GsdCodePayload>(emptyForm);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [importing, setImporting] = useState(false);


    const openCreateForm = () => {
        setSelectedItem(null);
        setForm(emptyForm);
        setIsFormOpen(true);
    };

    const openEditForm = (item: GsdCode) => {
        setSelectedItem(item);
        setForm({
            actionCode: item.actionCode,
            actionName: item.actionName,
            gsdCode: item.gsdCode || '',
            codeNew: item.codeNew || '',
            frequency: item.frequency || 1,
            tmu: item.tmu || 0,
            note: item.note || '',
            statusId: item.statusId,
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setSelectedItem(null);
        setForm(emptyForm);
        setIsFormOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (selectedItem) {
                await updateGsdCode(selectedItem.id, form);
            } else {
                await createGsdCode(form);
            }

            closeForm();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Lưu dữ liệu thất bại.');
        }
    };

    // const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];

    //     if (!file) return;

    //     try {
    //         setImporting(true);

    //         const result = await gsdCodeService.importGsdCodesFromExcel(file);

    //         alert(
    //             `${result.message}\n` +
    //             `Tổng dòng đọc: ${result.totalRead}\n` +
    //             `Thêm mới: ${result.inserted}\n` +
    //             `Bỏ qua trùng: ${result.skippedDuplicate}\n` +
    //             `Bỏ qua rỗng: ${result.skippedEmpty}`
    //         );
    //     } catch (err) {
    //         alert(err instanceof Error ? err.message : 'Import Excel thất bại.');
    //     } finally {
    //         setImporting(false);

    //         if (fileInputRef.current) {
    //             fileInputRef.current.value = '';
    //         }
    //     }
    // };

    const handleImportExcel = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        setImporting(true);

        try {
            const response = await gsdCodeService.importGsdCodesExcel(file);
            const result = response.data;

            alert(
                [
                    response.message,
                    `Sheet: ${result.sheetName}`,
                    `Tổng dòng: ${result.totalRows}`,
                    `Thêm mới: ${result.inserted}`,
                    `Cập nhật: ${result.updated}`,
                    `Bỏ qua: ${result.skipped}`,
                    result.errors?.length
                        ? `Lỗi:\n${result.errors.slice(0, 10).join('\n')}`
                        : '',
                ]
                    .filter(Boolean)
                    .join('\n')
            );

            await loadGsdCodes();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Import Excel thất bại.');
        } finally {
            setImporting(false);

            if (event.target) {
                event.target.value = '';
            }
        }
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xlsm,.xls"
                            onChange={handleImportExcel}
                            className="hidden"
                        />

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={handleImportExcel}
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={importing}
                            className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-50 disabled:opacity-50"
                        >
                            {importing ? 'Đang import...' : 'Import Excel'}
                        </button>

                        <button
                            onClick={openCreateForm}
                            className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
                        >
                            + Thêm mới
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">STT</th>
                                <th className="px-4 py-3 text-left">Mã thao tác</th>
                                <th className="px-4 py-3 text-left">Tên thao tác</th>
                                <th className="px-4 py-3 text-left">Code</th>
                                <th className="px-4 py-3 text-left">Code mới</th>
                                <th className="px-4 py-3 text-right">Tần suất</th>
                                <th className="px-4 py-3 text-right">TMU</th>
                                <th className="px-4 py-3 text-right">Giây</th>
                                <th className="px-4 py-3 text-left">Trạng thái</th>
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

                            {!loading && gsdCodes.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                                        Chưa có dữ liệu thao tác chuẩn.
                                    </td>
                                </tr>
                            )}

                            {!loading && gsdCodes.map((item, index) => (
                                <tr
                                    key={item.id}
                                    onClick={() => openEditForm(item)}
                                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3 font-mono text-slate-500">{index + 1}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700">{item.actionCode}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.actionName}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.gsdCode}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.codeNew}</td>
                                    <td className="px-4 py-3 text-right">{item.frequency}</td>
                                    <td className="px-4 py-3 text-right font-bold">{item.tmu}</td>
                                    <td className="px-4 py-3 text-right">{Number(item.seconds || 0).toFixed(4)}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.statusId === 0
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}
                                        >
                                            {item.statusName || 'Không rõ'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-800 uppercase">
                                {selectedItem ? 'Cập nhật thao tác chuẩn' : 'Thêm mới thao tác chuẩn'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        Mã thao tác <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={form.actionCode}
                                        onChange={(e) => setForm({ ...form, actionCode: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                        required
                                        maxLength={16}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        Code
                                    </label>
                                    <input
                                        value={form.gsdCode || ''}
                                        onChange={(e) => setForm({ ...form, gsdCode: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                        maxLength={16}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        Tên thao tác <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={form.actionName}
                                        onChange={(e) => setForm({ ...form, actionName: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                        required
                                        maxLength={256}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        Code mới
                                    </label>
                                    <input
                                        value={form.codeNew || ''}
                                        onChange={(e) => setForm({ ...form, codeNew: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                        maxLength={16}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        Tần suất
                                    </label>
                                    <input
                                        type="number"
                                        value={form.frequency ?? ''}
                                        onChange={(e) => setForm({ ...form, frequency: e.target.value === '' ? null : Number(e.target.value) })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        TMU
                                    </label>
                                    <input
                                        type="number"
                                        value={form.tmu}
                                        onChange={(e) => setForm({ ...form, tmu: Number(e.target.value) })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        Trạng thái
                                    </label>
                                    <select
                                        value={form.statusId}
                                        onChange={(e) => setForm({ ...form, statusId: Number(e.target.value) })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        {statuses.map(status => (
                                            <option key={status.id} value={status.id}>
                                                {status.statusName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-600 mb-1">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={form.note || ''}
                                        onChange={(e) => setForm({ ...form, note: e.target.value })}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                        rows={3}
                                        maxLength={256}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-50"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold hover:bg-blue-800"
                                >
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}