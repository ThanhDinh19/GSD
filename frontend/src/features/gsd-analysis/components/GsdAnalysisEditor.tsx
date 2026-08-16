import { useEffect, useMemo, useState } from 'react';
import { GsdAnalysisPayload } from '../types/gsdAnalysis.types';
import { useGsdAnalysis } from '../hooks/useGsdAnalysis';
import SourceActionPickerModal from '../components/SourceActionPickerModal';
import { gsdAnalysisService, getGsdAnalysisImageUrl } from '../services/gsdAnalysis.service';
import { MetricCard } from '../../../shared/components';


// Omit lấy type GsdAnalysisPayload, bỏ cột sourceId, details
const initialForm: Omit<GsdAnalysisPayload, 'sourceId' | 'details'> = {
    machineId: null,
    operationName: '',
    seamLength: 0,
    attachedActionTime: 0,
    stitchCount: 0,
    machineSpeed: 0,
    allowance: 0,
    difficultyPercent: 0,
    productMultiplier: 1,
    note: '',
    images: []
};

type GsdAnalysisPageProps = {
    editAnalysisId?: number | null;
    copyAnalysisId?: number | null;
    onSaveSuccess?: () => void;
    onCancel?: () => void;
};

function formatNumber(value: number | null | undefined, digits = 4) {
    const numberValue = Number(value || 0);
    return numberValue.toFixed(digits);
}


function getLaborGradeByDifficulty(value: number | null | undefined) {
    if (value === null || value === undefined || value === 0) return 2;
    if (Number(value) === 5) return 3;
    if (Number(value) === 10) return 4;
    if (Number(value) === 15) return 5;
    return 6;
}


export default function GsdAnalysisEditor({
    editAnalysisId = null,
    copyAnalysisId = null,
    onSaveSuccess,
    onCancel,
}: GsdAnalysisPageProps) {
    const {
        sources,
        machines,

        machines_test,

        popupSourceId,
        popupRows,
        sourceActionMap,
        selectedDraftRows,

        analysisRows,

        loadingMasterData,

        loadMachines_test,

        loadingMachines_test,

        loadingSourceActions,
        calculating,
        saving,
        result,

        selectPopupSource,
        updatePopupStepNo,
        uncheckPopupRow,
        takeSelectedActionsToAnalysis,
        clearAnalysisRows,
        clearResult,

        calculate,
        save,
        updatePopupFrequency,

        analyses,
        loadingAnalyses,
        loadAnalyses,
        togglePopupActionRow,
        loadingAnalysisDetail,
        loadAnalysisForEdit,
        loadAnalysisForCopy

    } = useGsdAnalysis();

    const [imageUploading, setImageUploading] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [localImagePreview, setLocalImagePreview] = useState('');

    const [attachedAcTime, setAttachedAcTime] = useState(0);

    const [form, setForm] = useState(initialForm);

    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const selectedMachine = useMemo(() => {
        return machines.find((item) => item.id === Number(form.machineId)) || null;
    }, [machines, form.machineId]);

    // Dinh 28/06/2026 : giữ lại kết quả return của useMemo lần trước, nếu machine_test và form.machineId ko đổi thì k cần chạy lại find
    const selectedMachine_test = useMemo(() => {
        return machines_test.find((item) => item.id === Number(form.machineId)) || null;
    }, [machines_test, form.machineId]);


    const previewLaborGrade = getLaborGradeByDifficulty(
        form.difficultyPercent === null || form.difficultyPercent === undefined
            ? null
            : Number(form.difficultyPercent)
    );

    const selectedRows = analysisRows;

    const mainImage = form.images?.[0] || null;

    const serverImageSrc = getGsdAnalysisImageUrl(
        mainImage?.imageUrl ||
        mainImage?.imageFileName
    );

    const mainImageSrc =
        localImagePreview || serverImageSrc;


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

        console.log("form: ", form);
        console.log("attached action time vừa gửi đi: ", form.attachedActionTime);

        try {
            await calculate(form);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Tính phân tích thất bại.');
        }
    };

    const handleSave = async () => {
        if (!validateBeforeCalculate()) return;

        try {
            let formToSave = form;
            let nextImages = form.images ?? [];

            if (selectedImageFile) {
                const uploaded =
                    await gsdAnalysisService.uploadImage(
                        selectedImageFile
                    );

                nextImages = [
                    {
                        imageUrl: uploaded.imageUrl,
                        imageFileName: uploaded.imageFileName,
                    },
                ];

                formToSave = {
                    ...form,
                    images: nextImages,
                };
            }

            const response = await save(
                formToSave,
                editAnalysisId
            );

            setForm((prev) => prev
                ? {
                    ...prev,
                    images: nextImages,
                }
                : prev);

            alert(
                `${response.message}\nMã phân tích: ${response.data.analysisNo || ''
                }`
            );

            setSelectedImageFile(null);

            setLocalImagePreview((oldUrl) => {
                if (oldUrl) {
                    URL.revokeObjectURL(oldUrl);
                }

                return '';
            });

            onSaveSuccess?.();
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : 'Lưu phân tích thất bại.'
            );
        }
    };


    const handleSelectMainImage = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setSelectedImageFile(file);

        setLocalImagePreview((oldUrl) => {
            if (oldUrl) {
                URL.revokeObjectURL(oldUrl);
            }

            return URL.createObjectURL(file);
        });
    };

    const handleRemoveMainImage = () => {
        const confirmed = window.confirm(
            'Bạn có chắc muốn xóa hình ảnh này?'
        );

        if (!confirmed) return;

        setSelectedImageFile(null);

        setLocalImagePreview((oldUrl) => {
            if (oldUrl) {
                URL.revokeObjectURL(oldUrl);
            }

            return '';
        });

        setForm((prev) => ({
            ...prev,
            images: [],
        }));
    };

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                let detail: any = null;

                if (editAnalysisId) {
                    detail =
                        await loadAnalysisForEdit(
                            editAnalysisId
                        );
                } else if (copyAnalysisId) {
                    detail =
                        await loadAnalysisForCopy(
                            copyAnalysisId
                        );
                } else {
                    setForm(initialForm);
                    clearAnalysisRows();
                    clearResult();
                    return;
                }

                if (cancelled || !detail) return;

                setForm({
                    machineId:
                        detail.machineId ?? null,

                    operationName:
                        detail.operationName ?? '',

                    seamLength: Number(
                        detail.seamLength || 0
                    ),

                    attachedActionTime: Number(
                        detail.attachedActionTime || 0
                    ),

                    stitchCount: Number(
                        detail.stitchCount || 0
                    ),

                    machineSpeed: Number(
                        detail.machineSpeed || 0
                    ),

                    allowance: Number(
                        detail.allowance || 0
                    ),

                    difficultyPercent: Number(
                        detail.difficultyPercent || 0
                    ),

                    productMultiplier: Number(
                        detail.productMultiplier || 1
                    ),

                    note:
                        detail.note ?? '',

                    images: detail.imageFileName
                        ? [
                            {
                                imageUrl:
                                    detail.imageUrl ??
                                    detail.imageFileName,

                                imageFileName:
                                    detail.imageFileName,
                            },
                        ]
                        : [],
                });
            } catch (err) {
                if (cancelled) return;

                alert(
                    err instanceof Error
                        ? err.message
                        : copyAnalysisId
                            ? 'Không tải được dữ liệu sao chép.'
                            : 'Không tải được dữ liệu phân tích.'
                );
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [
        editAnalysisId,
        copyAnalysisId,
    ]);

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl border-slate-200 p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
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
                            disabled={saving || loadingAnalysisDetail}
                            className="px-4 py-2 bg-green-700 text-white rounded-lg text-xs font-bold hover:bg-green-800 disabled:opacity-50"
                        >
                            {saving
                                ? 'Đang lưu...'
                                : editAnalysisId
                                    ? 'Lưu cập nhật'
                                    : copyAnalysisId
                                        ? 'Lưu bản sao'
                                        : 'Lưu phân tích'}
                        </button>

                        {(editAnalysisId || copyAnalysisId) && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={saving}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
                            >
                                Quay lại
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_200px]">
                    {/* Thông tin công đoạn */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                        <div className="mb-4">
                            <h3 className="text-sm font-bold text-slate-800">
                                Thông tin công đoạn
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Nhập thông tin cơ bản và thông số tính SMV.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                                    Tên công đoạn
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <input
                                    value={form.operationName}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            operationName:
                                                e.target.value,
                                        }))
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="VD: Ráp sườn"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                                    Loại máy / MMTB
                                </label>

                                <select
                                    value={form.machineId ?? ''}
                                    onChange={(e) => {
                                        const machineId =
                                            e.target.value
                                                ? Number(
                                                    e.target.value
                                                )
                                                : null;

                                        const machine =
                                            machines_test.find(
                                                (item) =>
                                                    item.id ===
                                                    machineId
                                            ) || null;

                                        setForm((prev) => ({
                                            ...prev,
                                            machineId,
                                            attachedActionTime:
                                                machine
                                                    ?.attachedActionTime ??
                                                0,
                                            stitchCount:
                                                machine
                                                    ?.stitchCount ??
                                                0,
                                            machineSpeed:
                                                machine
                                                    ?.machineSpeed ??
                                                0,
                                            allowance:
                                                machine
                                                    ?.allowance ??
                                                0,
                                        }));
                                    }}
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">
                                        -- Chọn máy --
                                    </option>

                                    {machines_test.map(
                                        (machine) => (
                                            <option
                                                key={machine.id}
                                                value={machine.id}
                                            >
                                                {machine.codeMmtb} -{' '}
                                                {
                                                    machine.machineName
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                                    Mức độ phức tạp
                                </label>

                                <select
                                    value={
                                        form.difficultyPercent ??
                                        0
                                    }
                                    onChange={(e) =>
                                        handleNumberChange(
                                            'difficultyPercent',
                                            e.target.value
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value={0}>
                                        0%
                                    </option>
                                    <option value={5}>
                                        5%
                                    </option>
                                    <option value={10}>
                                        10%
                                    </option>
                                    <option value={15}>
                                        15%
                                    </option>
                                    <option value={20}>
                                        20%
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                                    Đường may
                                </label>

                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={
                                            form.seamLength ?? ''
                                        }
                                        onChange={(e) =>
                                            handleNumberChange(
                                                'seamLength',
                                                e.target.value
                                            )
                                        }
                                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                                        cm
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                                    Hệ số nhân SP
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={
                                        form.productMultiplier ??
                                        1
                                    }
                                    onChange={(e) =>
                                        handleNumberChange(
                                            'productMultiplier',
                                            e.target.value
                                        )
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                                    Ghi chú
                                </label>

                                <input
                                    value={form.note || ''}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            note: e.target.value,
                                        }))
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Nhập ghi chú"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hình ảnh */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    Hình ảnh
                                </h3>
                            </div>

                            {mainImageSrc && (
                                <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                                    Đã chọn
                                </span>
                            )}
                        </div>

                        <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                            {mainImageSrc ? (
                                <img
                                    src={mainImageSrc}
                                    alt="Hình ảnh công đoạn"
                                    className="h-full w-full object-contain p-2"
                                />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                                        🖼️
                                    </div>

                                    <div className="mt-3 text-xs font-bold text-slate-600">
                                        Chưa có hình ảnh
                                    </div>

                                    <div className="mt-1 text-[11px] leading-4 text-slate-400">
                                        Chọn một hình để xem trước
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <label
                                className={`
                                    flex h-10 cursor-pointer items-center justify-center
                                    rounded-lg border border-blue-300 px-3
                                    text-xs font-bold text-blue-700
                                    transition hover:bg-blue-50
                                    ${!mainImageSrc
                                        ? 'col-span-2'
                                        : ''
                                    }
                                    ${saving
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                    }
                                `}
                            >
                                {mainImageSrc
                                    ? 'Đổi hình'
                                    : 'Chọn hình'}

                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    hidden
                                    disabled={saving}
                                    onChange={
                                        handleSelectMainImage
                                    }
                                />
                            </label>

                            {mainImageSrc && (
                                <button
                                    type="button"
                                    onClick={
                                        handleRemoveMainImage
                                    }
                                    disabled={saving}
                                    className="h-10 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                >
                                    Xóa hình
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {selectedMachine_test && (
                    <div className="mb-5 grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Thao tác kèm theo</div>
                            <input

                                // Dinh, 28/06/2026
                                className="font-bold text-slate-800"
                                style={{ outline: 'none' }}
                                type="number"
                                step="0.01"
                                value={form.attachedActionTime ?? 0}
                                onChange={(e) =>
                                    setForm((prev) => {
                                        return {
                                            ...prev,
                                            attachedActionTime: e.target.value === '' ? 0 : Number(e.target.value),
                                        }

                                    })
                                }
                            />
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Số mũi chỉ</div>
                            <input
                                className="font-bold text-slate-800"
                                style={{ outline: 'none' }}
                                type="number"
                                value={form.stitchCount ?? 0}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        stitchCount: e.target.value === '' ? 0 : Number(e.target.value),
                                    }))
                                }
                            />
                            {/* <div className="font-bold text-slate-800">{selectedMachine_test.stitchCount ?? 0}</div> */}
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Tốc độ máy</div>
                            <input
                                className="font-bold text-slate-800"
                                style={{ outline: 'none' }}
                                type="number"
                                value={form.machineSpeed ?? 0}
                                onChange={(e) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        machineSpeed: e.target.value === '' ? 0 : Number(e.target.value),
                                    }))
                                }}
                            />
                            {/* <div className="font-bold text-slate-800">{selectedMachine_test.machineSpeed ?? 0}</div> */}
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Cm/ giây</div>
                            <label className="text-slate-400 text-[10px]">Số mũi chỉ / tốc độ máy * 60</label>
                            <div className="font-bold text-slate-800">
                                {result
                                    ? Number(result.machineVelocity || 0).toFixed(4)
                                    : form.machineSpeed
                                        ? (((Number(form.stitchCount || 0) / Number(form.machineSpeed || 1)) * 60)).toFixed(4)
                                        : '0.0000'}
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Hao phí</div>
                            <input
                                className="font-bold text-slate-800"
                                style={{ outline: 'none' }}
                                value={form.allowance ?? 0}
                                type="number"
                                onChange={(e) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        allowance: e.target.value === '' ? 0 : Number(e.target.value),
                                    }))
                                }}
                            />
                            {/* <div className="font-bold text-slate-800">{selectedMachine_test.allowance ?? 0}</div> */}
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <div className="text-slate-500">Bậc tay nghề</div>
                            <div className="font-bold text-slate-800">
                                {previewLaborGrade}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-5 text-xs">
                    {/* <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="text-blue-600">Tổng thao tác</div>
                        <div className="font-black text-blue-900 text-lg">{selectedRows.length}</div>
                    </div> */}

                    <MetricCard
                        label="Tổng thao tác"
                        value={selectedRows.length}
                        tone="blue"
                    />



                    {/* <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="text-blue-600">Tổng TMU</div>
                        <div className="font-black text-blue-900 text-lg">
                            {result ? formatNumber(result.totalTmu, 2) : formatNumber(previewTotalTmu, 2)}
                        </div>
                    </div> */}

                    <MetricCard
                        label="Tổng TMU"
                        subLabel={"SUM(Thời gian thao tác * 27.8)"}
                        value={
                            result
                                ? formatNumber(
                                    result.totalTmu,
                                    2
                                )
                                : '0.00'
                        }
                        tone="blue"
                    />

                    {/* <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="text-blue-600">Tổng giây thao tác</div>
                        <div className="font-black text-blue-900 text-lg">
                            {result ? formatNumber(result.totalManualSeconds, 4) : formatNumber(previewManualSeconds, 4)}
                        </div>
                    </div> */}

                    <MetricCard
                        label="Tổng giây thao tác"
                        value={
                            result
                                ? formatNumber(
                                    result.totalManualSeconds,
                                    4
                                )
                                : '0.0000'
                        }
                        tone="blue"
                    />

                    {/* <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">

                        <div className="text-orange-600">Thời gian MMTB</div>
                        <div className="font-black text-orange-900 text-lg">
                            {result ? formatNumber(result.machineSeconds, 4) : '0.0000'}
                        </div>
                    </div> */}

                    <MetricCard
                        label="Thời gian MMTB"
                        subLabel={"(Vận tốc máy × đường may) + thao tác kèm theo + hao phí"}
                        value={
                            result
                                ? formatNumber(
                                    result.machineSeconds,
                                    4
                                )
                                : '0.0000'
                        }
                        tone="orange"
                    />

                    {/* <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <div className="text-amber-600">Thời gian mức độ</div>
                        <div className="font-black text-amber-900 text-lg">
                            {result ? formatNumber(result.difficultySeconds, 4) : '0.0000'}
                        </div>
                    </div> */}

                    <MetricCard
                        label="Thời gian mức độ"
                        subLabel={"Tổng SMV × mức độ phức tạp / 100"}
                        value={
                            result
                                ? formatNumber(
                                    result.difficultySeconds,
                                    4
                                )
                                : '0.0000'
                        }
                        tone="amber"
                    />

                    {/* <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <div className="text-green-600">SMV cuối</div>
                        <div className="font-black text-green-900 text-lg">
                            {result ? formatNumber(result.finalSmv, 0) : '-'}
                        </div>
                    </div> */}

                    <MetricCard
                        label="Tổng SMV"
                        subLabel={"(Tổng giây thao tác + thời gian MMTB) × hệ số SP"}
                        value={
                            result
                                ? formatNumber(
                                    result.totalSmvBeforeDifficulty,
                                    4
                                )
                                : '-'
                        }
                        tone="green"
                    />

                    <MetricCard
                        label="SMV cuối"
                        subLabel={"Tổng SMV + thời gian mức độ"}
                        value={
                            result
                                ? formatNumber(
                                    result.finalSmv,
                                    0
                                )
                                : '-'
                        }
                        tone="green"
                    />
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full text-xs border-collapse">
                        <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 border border-slate-200 text-left">STT</th>
                                <th className="px-4 py-3 border border-slate-200 text-left">Source</th>
                                <th className="px-4 py-3 border border-slate-200 text-left">Các bước</th>
                                <th className="px-4 py-3 border border-slate-200 text-left">Mã GSD (Code)</th>
                                <th className="px-4 py-3 border border-slate-200 text-left">Thao tác</th>
                                <th className="px-4 py-3 border border-slate-200 text-right">Điểm TMU</th>
                                <th className="px-4 py-3 border border-slate-200 text-right">Số lần lặp lại</th>
                                <th className="px-4 py-3 border border-slate-200 text-right">Thời gian (Giây)</th>
                                <th className="px-4 py-3 border border-slate-200 text-left">Ghi chú</th>
                            </tr>
                        </thead>

                        <tbody>
                            {analysisRows.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-6 border border-slate-200 text-center text-slate-400"
                                    >
                                        Chưa có thao tác. Bấm “Lấy thao tác” để chọn thao tác từ source.
                                    </td>
                                </tr>
                            )}

                            {analysisRows.map((row, index) => {
                                const seconds =
                                    (Number(row.tmu || 0) * Number(row.frequency || 0)) / 27.8;

                                return (
                                    <tr key={`${row.sourceId}-${row.sourceActionDetailId}-${index}`}>
                                        <td className="px-4 py-3 border border-slate-200 font-mono text-slate-500 text-sm">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                            {row.sourceName}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-blue-700 text-sm">
                                            {row.stepNo}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                            {row.gsdCode}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                            {row.actionName}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-right text-sm">
                                            {row.tmu}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-right text-sm">
                                            {row.frequency}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-right text-sm">
                                            {formatNumber(seconds, 4)}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-slate-500 text-sm">
                                            {row.note}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

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