import { useState, type ReactNode } from 'react';
import { useSewingProcess } from '../hooks/useSewingProcess';
import { useCustomers } from '../hooks/useCustomers';
import { useMachineEquipments } from '../hooks/useMachineEquipments';
import { useOperationClusters } from '../hooks/useOperationClusters';
import { SewingProcessLine, ProductCateGroup } from '../types';
import { useProductCateGroups } from '../hooks/useProductCateGroup';
import {
    sewingProcessService,
    getSewingProcessImageUrl,
    getGsdAnalysisImageUrl,
} from '../services/sewingProcess.service';
import { button, div, tr } from 'motion/react-client';

function formatNumber(value: number | null | undefined, digits = 4) {
    return Number(value || 0).toFixed(digits);
}

function formatSummaryNumber(value: number | null | undefined, digits = 2) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '-';
    }

    return new Intl.NumberFormat('vi-VN', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(Number(value));
}

function formatSummaryMoney(value: number | null | undefined, digits = 2) {
    const formatted = formatSummaryNumber(value, digits);

    return formatted === '-' ? '-' : `${formatted} VND`;
}

function numberInputValue(value: number | null | undefined) {
    if (value === null || value === undefined) return '';
    return value;
}

function dateInputValue(value: string | null | undefined) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

function toNumberOrNull(value: string) {
    if (value === '') return null;
    return Number(value);
}

function getStatusId(item: any) {
    return Number(item.statusId ?? item.status_id ?? 0);
}

function getCustomerCode(item: any) {
    return item.cusCode ?? item.cus_code ?? item.customerCode ?? item.customer_code ?? '';
}

function getCustomerName(item: any) {
    return item.cusName ?? item.cus_name ?? item.customerName ?? item.customer_name ?? '';
}

function getMachineCode(item: any) {
    return (
        item.codeMmtb ??
        item.codeMMTB ??
        item.code_mmtb ??
        item.machineCode ??
        item.machine_code ??
        ''
    );
}

function getMachineName(item: any) {
    return item.machineName ?? item.machine_name ?? '';
}

function getDocumentCode(item: any) {
    return item.documentCode ?? item.document_code ?? '';
}

function getOperationClusterName(item: any) {
    return (
        item.category_group_name ??
        item.product_name ??
        item.work_name ??
        item.productCategoryName ??
        item.product_category_name ??
        item.productCateName ??
        item.product_cate_name ??
        item.note ??
        ''
    );
}

function getDetailRows(detail: any): any[] {
    return (
        detail?.details ??
        detail?.lines ??
        detail?.operations ??
        detail?.items ??
        []
    );
}

function getActionCode(row: any) {
    return (
        row.gsdCode ??
        row.gsd_code ??
        row.actionCode ??
        row.action_code ??
        row.code ??
        ''
    );
}

function getActionName(row: any) {
    return (
        row.actionName ??
        row.action_name ??
        row.name ??
        row.description ??
        ''
    );
}

function getActionTime(row: any) {
    return (
        row.seconds ??
        row.tmu ??
        row.actionTime ??
        row.action_time ??
        row.time ??
        row.totalSeconds ??
        row.total_seconds ??
        row.smv ??
        ''
    );
}

function getOperationClusterLineId(row: any): number | null {
    const candidates = [
        row?.sourceLineId,
        row?.source_line_id,
        row?.operationClusterLineId,
        row?.operation_cluster_line_id,
        row?.operationLineId,
        row?.operation_line_id,
        row?.lineId,
        row?.line_id,
        row?.id,
    ];

    for (const value of candidates) {
        const id = Number(value);
        if (Number.isFinite(id) && id > 0) {
            return id;
        }
    }

    return null;
}

function mapOperationClusterToLines(detail: any): SewingProcessLine[] {
    const header = detail?.header ?? detail;
    const documentCode = getDocumentCode(header);
    const rows = getDetailRows(detail);

    return rows.map((row: any, index: number) => ({
        sourceDocumentCode: documentCode,
        sourceLineId: getOperationClusterLineId(row),

        gsdAnalysisId: row.gsdAnalysisId ?? row.gsd_analysis_id ?? null,

        lineNo: index + 1,
        clusterNo: row.clusterNo ?? row.cluster_no ?? row.line_no ?? index + 1,
        clusterName:
            row.clusterName ??
            row.cluster_name ??
            row.groupName ??
            row.group_name ??
            '',

        operationCode:
            row.operationCode ??
            row.operation_code ??
            row.gsdCode ??
            row.gsd_code ??
            row.code ??
            '',

        operationName:
            row.operationName ??
            row.operation_name ??
            row.actionName ??
            row.action_name ??
            row.name ??
            '',

        lineOrder:
            row.line_balance_no ??
            row.lineOrder ??
            row.line_order ??
            index + 1,

        skillGradeId:
            row.skillGradeId ??
            row.skill_grade_id ??
            null,

        skillGradeLevel:
            row.skillGradeLevel ??
            row.skill_grade_level ??
            row.skill_level ??
            row.skillGrade ??
            row.skill_grade ??
            null,

        machineId:
            row.machineId ??
            row.machine_id ??
            row.machineEquipmentId ??
            row.machine_equipment_id ??
            null,

        machineCode:
            row.codeMmtb ??
            row.code_mmtb ??
            row.machineCode ??
            row.machine_code ??
            '',

        machineName:
            row.machineName ??
            row.machine_name ??
            '',

        samGsd: Number(
            row.samGsd ??
            row.sam_gsd ??
            row.finalSmv ??
            row.final_smv ??
            row.smv ??
            0
        ),

        salaryCoefficient: Number(
            row.salaryCoefficient ??
            row.salary_coefficient ??
            0
        ),

        requiredEfficiency: Number(
            row.requiredEfficiency ??
            row.required_efficiency ??
            100
        ),

        totalActions: Number(row.totalActions ?? row.total_actions ?? 0),

        toolNeed: row.toolNeed ?? row.tool_need ?? '',

        sewingEmployee: row.sewingEmployee ?? row.sewing_employee ?? '',

        cbcTime: row.cbcTime ?? row.cbc_time ?? null,

        note: row.note ?? '',

        imageFileName:
            row.imageFileName ??
            row.image_file_name ??
            null,

        imageUrl:
            row.imageUrl ??
            row.image_url ??
            null,
    }));
}

function getProductCateGroupName(item: ProductCateGroup) {
    return `${item.cateGroupCode} - ${item.cateGroupName}`;
}


export default function SewingProcessPage() {
    const {
        items,
        form,
        form_test,
        result,

        loading,
        calculating,
        saving,
        users,

        refresh,
        loadDetailToForm,

        updateForm,
        updateLine,
        addLine,
        removeLine,
        resetForm,

        calculate,
        createSewingProcess,
        updateSewingProcess,
        createFormTest,
        updateFormTest,
        setForm,
        loadFormTest,
    } = useSewingProcess();



    type ModalMode = 'create' | 'view' | 'edit' | null;
    type ModalTest = 'test' | null;

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [modalTest, setModalTest] = useState<ModalTest>(null);


    const isModalOpen = modalMode !== null;
    const isViewMode = modalMode === 'view';
    const isEditMode = modalMode === 'edit';
    // const isCreateMode = modalMode === 'create';

    const [activeTab, setActiveTab] = useState<'process' | 'machine' | 'test'>('process');

    const [isOperationPickerOpen, setIsOperationPickerOpen] = useState(false);
    const [pickerProductCateGroupId, setPickerProductCateGroupId] = useState<number | ''>('');
    const [pickerOperationClusterId, setPickerOperationClusterId] = useState<number | ''>('');
    const [pickerRows, setPickerRows] = useState<SewingProcessLine[]>([]);
    const [pickedOperationMap, setPickedOperationMap] = useState<Record<string, SewingProcessLine>>({});
    const pickedOperationLines = Object.values(pickedOperationMap);
    const [imageUploading, setImageUploading] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [previewGsdAnalysisImageUrl, setPreviewGsdAnalysisImageUrl] = useState('');
    const mainImage = form.images?.[0] || null;

    const mainImageFileName =
        mainImage?.imageFileName ||
        mainImage?.imageUrl ||
        '';

    const mainImageSrc = getSewingProcessImageUrl(mainImageFileName);

    const handleUploadMainImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        setImageUploading(true);

        try {
            const uploaded = await sewingProcessService.uploadImage(file);

            setForm((prev) => ({
                ...prev,
                images: [
                    {
                        imageUrl: uploaded.imageFileName,
                        imageFileName: uploaded.imageFileName,
                        sortOrder: 1,
                    },
                ],
            }));
        } catch (err: any) {
            alert(err?.message || 'Upload hình ảnh thất bại.');
        } finally {
            setImageUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveMainImage = () => {

        const confirmed = window.confirm(
            'Bạn có chắc muốn xóa hình ảnh này?'
        );

        if (!confirmed) return;


        setForm((prev) => ({
            ...prev,
            images: [],
        }));
    };

    const handleOpenOperationPicker = () => {
        setPickerProductCateGroupId('');
        setPickerOperationClusterId('');
        setPickerRows([]);
        setPickedOperationMap({});
        setIsOperationPickerOpen(true);
    };

    const handlePickerClusterChange = async (value: string) => {
        const id = value ? Number(value) : '';

        setPickerOperationClusterId(id);
        setPickerRows([]);

        if (!id) return;

        try {
            const detail = await loadOperationClusterDetail(Number(id));

            console.log('DETAIL KHO CỤM:', detail);
            console.log('ROW ĐẦU TIÊN RAW:', getDetailRows(detail)[0]);

            const mappedRows = mapOperationClusterToLines(detail);

            console.log('MAPPED ROW ĐẦU TIÊN:', mappedRows[0]);
            console.log(
                'GSD ANALYSIS ID SAU KHI MAP:',
                mappedRows[0]?.gsdAnalysisId
            );

            const rawRows = getDetailRows(detail);

            console.table(
                rawRows.map((row: any) => ({
                    id: row.id,

                    operationName:
                        row.operationName ??
                        row.operation_name,

                    operationCode:
                        row.operationCode ??
                        row.operation_code,

                    gsdAnalysisId:
                        row.gsdAnalysisId ??
                        row.gsd_analysis_id,

                    analysisId:
                        row.analysisId ??
                        row.analysis_id,

                    imageFileName:
                        row.imageFileName ??
                        row.image_file_name,

                    imageUrl:
                        row.imageUrl ??
                        row.image_url,

                    images: row.images,
                }))
            );

            setPickerRows(mappedRows);



        } catch (err: any) {
            alert(
                err?.response?.data?.message ||
                err?.message ||
                'Load công đoạn từ kho cụm thất bại.'
            );
        }
    };

    const togglePickerRow = (row: SewingProcessLine, checked: boolean) => {
        const key = getPickerLineKey(row);

        setPickedOperationMap((prev) => {
            const next = { ...prev };

            if (checked) {
                next[key] = row;
            } else {
                delete next[key];
            }

            return next;
        });
    };

    const handleConfirmPickedOperations = () => {
        const selectedRows = Object.values(pickedOperationMap);

        if (selectedRows.length === 0) {
            alert('Vui lòng chọn ít nhất một công đoạn.');
            return;
        }

        setForm((prev) => {
            const currentLines = prev.lines.filter((line) =>
                String(line.operationName || '').trim() !== ''
            );

            const currentKeys = new Set(currentLines.map(getPickerLineKey));

            const newRows = selectedRows.filter(
                (row) => !currentKeys.has(getPickerLineKey(row))
            );

            const nextLines = [...currentLines, ...newRows].map((line, index) => ({
                ...line,
                lineNo: index + 1,
                lineOrder: index + 1,
            }));

            return {
                ...prev,
                lines: nextLines,
            };
        });

        setActiveTab('process');
        setIsOperationPickerOpen(false);
    };

    const toggleAllPickerRows = (checked: boolean) => {
        setPickedOperationMap((prev) => {
            const next = { ...prev };

            pickerRows.forEach((row) => {
                const key = getPickerLineKey(row);

                if (checked) {
                    next[key] = row;
                } else {
                    delete next[key];
                }
            });

            return next;
        });
    };

    const { customers } = useCustomers();
    const { machineEquiments_test } = useMachineEquipments();
    const {
        items: operationClusters,
        loadDetail: loadOperationClusterDetail,
    } = useOperationClusters();

    const [operationActionsModal, setOperationActionsModal] = useState<{
        title: string;
        loading: boolean;
        rows: any[];
    } | null>(null);


    const { productCateGroups } = useProductCateGroups();

    const activeCustomers = customers.filter((item: any) => getStatusId(item) === 0);
    const activeMachines = machineEquiments_test.filter((item: any) => getStatusId(item) === 0);

    const filteredOperationClusters = pickerProductCateGroupId
        ? operationClusters.filter(
            (item) =>
                getOperationClusterProductCateGroupId(item) ===
                Number(pickerProductCateGroupId)
        )
        : operationClusters;

    function getOperationClusterProductCateGroupId(item: any) {
        return Number(item.product_category_group_id ?? 0);
    }

    const handleCustomerChange = (value: string) => {
        const customerId = value ? Number(value) : null;
        const customer = activeCustomers.find((item: any) => Number(item.id) === customerId);

        updateForm('customerId', customerId);
        updateForm('customerCode', customer ? getCustomerCode(customer) : '');
        updateForm('customerName', customer ? getCustomerName(customer) : '');
    };


    const handleMachineChange = (lineIndex: number, value: string) => {
        const machineId = value ? Number(value) : null;
        const machine = activeMachines.find((item: any) => Number(item.id) === machineId);

        updateLine(lineIndex, 'machineId', machineId);
        updateLine(lineIndex, 'machineCode', machine ? getMachineCode(machine) : '');
        updateLine(lineIndex, 'machineName', machine ? getMachineName(machine) : '');
    };

    const handleCreateNew = () => {
        setSelectedId(null);
        resetForm();
        setActiveTab('process');
        setModalMode('create');
    };

    const handleTest = () => {
        setModalTest('test');
    }

    const handleCloseModal = () => {
        setModalMode(null);
        setModalTest(null);
    };

    const handleOpenDetail = async (id: number) => {
        try {
            await loadDetailToForm(id);
            setSelectedId(id);
            setActiveTab('process');
            setModalMode('view');
        } catch (err: any) {
            alert(
                err?.response?.data?.message ||
                err?.message ||
                'Lấy chi tiết quy trình may thất bại.'
            );
        }
    };

    const handleEditSelected = async () => {
        if (!selectedId) {
            alert('Vui lòng chọn một chứng từ cần sửa.');
            return;
        }

        try {
            await loadDetailToForm(selectedId);
            setModalMode('edit');
        } catch (err: any) {
            alert(
                err?.response?.data?.message ||
                err?.message ||
                'Lấy dữ liệu cần sửa thất bại.'
            );
        }
    };

    const handleSave = async () => {
        try {
            const response =
                selectedId && isEditMode
                    ? await updateSewingProcess(selectedId)
                    : await createSewingProcess();

            if (response?.message) {
                alert(response.message);
            } else {
                alert(selectedId ? 'Cập nhật thành công.' : 'Lưu thành công.');
            }

            await refresh();
            setModalMode(null);
        } catch (err: any) {
            alert(
                err?.response?.data?.message ||
                err?.message ||
                'Lưu quy trình may thất bại.'
            );
        }
    };

    const handleSaveTest = async () => {
        try {
            createFormTest();
        } catch (err: any) {
            alert("lỗi submit")
        }
    }

    const handleCalculate = async () => {
        try {
            await calculate();
        } catch (err: any) {
            alert(
                err?.response?.data?.message ||
                err?.message ||
                'Tính quy trình may thất bại.'
            );
        }
    };

    // const handleOpenOperationActions = async (line: SewingProcessLine) => {
    //     const gsdAnalysisId =
    //         line.gsdAnalysisId ??
    //         (line as any).gsd_analysis_id ??
    //         null;

    //     if (!gsdAnalysisId) {
    //         alert('Công đoạn này chưa có mã GSD để xem thao tác.');
    //         return;
    //     }

    //     setOperationActionsModal({
    //         title: line.operationName || 'Chi tiết thao tác',
    //         loading: true,
    //         rows: [],
    //     });

    //     try {
    //         const rows = await loadGsdActions(Number(gsdAnalysisId));

    //         setOperationActionsModal({
    //             title: line.operationName || 'Chi tiết thao tác',
    //             loading: false,
    //             rows: rows || [],
    //         });
    //     } catch (err: any) {
    //         setOperationActionsModal(null);

    //         alert(
    //             err?.response?.data?.message ||
    //             err?.message ||
    //             'Lấy danh sách thao tác thất bại.'
    //         );
    //     }
    // };


    const renderSavedList = () => {
        return (
            <div className="overflow-auto border border-slate-200 rounded-sm">
                <table className="w-full min-w-[1100px] text-xs border-collapse text-[15px]">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="border border-slate-200 px-3 py-2 text-center">STT</th>
                            <th className="border border-slate-200 px-3 py-2 text-left">Mã chứng từ</th>
                            <th className="border border-slate-200 px-3 py-2 text-center">Hình ảnh</th>
                            <th className="border border-slate-200 px-3 py-2 text-left">Khách hàng</th>
                            <th className="border border-slate-200 px-3 py-2 text-left">Mã hàng</th>
                            <th className="border border-slate-200 px-3 py-2 text-left">Chuyền</th>
                            <th className="border border-slate-200 px-3 py-2 text-right">NS SX</th>
                            <th className="border border-slate-200 px-3 py-2 text-right">Tổng TG</th>
                            <th className="border border-slate-200 px-3 py-2 text-right">Định mức</th>
                            <th className="border border-slate-200 px-3 py-2 text-right">Đơn giá BQ</th>
                            {/* <th className="border border-slate-200 px-3 py-2 text-center">Mở</th> */}
                        </tr>
                    </thead>

                    <tbody>
                        {items.length === 0 && (
                            <tr>
                                <td
                                    colSpan={10}
                                    className="border border-slate-200 px-4 py-6 text-center text-slate-400"
                                >
                                    Chưa có chứng từ quy trình may.
                                </td>
                            </tr>
                        )}

                        {items.map((item, index) => {
                            const isSelected = selectedId === item.id;

                            const imageFileName = item.imageFileName || item.imageUrl || '';
                            const imageSrc = getSewingProcessImageUrl(imageFileName);

                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={`cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <td className="border border-slate-200 px-3 py-2 text-blue-700 text-center">{index + 1}</td>
                                    <td className="border border-slate-200 px-3 py-2 text-blue-700">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenDetail(item.id);
                                            }}
                                            className="text-blue-700 hover:underline"
                                        >
                                            {item.documentCode}
                                        </button>
                                    </td>

                                    <td className="border border-slate-200 px-3 py-2 text-center">
                                        {imageSrc ? (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPreviewImageUrl(imageSrc);
                                                }}
                                                className="inline-flex items-center justify-center w-12 h-12 border border-slate-200 rounded-sm bg-slate-50 overflow-hidden hover:ring-2 hover:ring-blue-400"
                                                title="Xem hình"
                                            >
                                                <img
                                                    src={imageSrc}
                                                    alt="Hình mã hàng"
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 text-xs">-</span>
                                        )}
                                    </td>

                                    <td className="border border-slate-200 px-3 py-2">
                                        {item.customerName || item.customerCode}
                                    </td>

                                    <td className="border border-slate-200 px-3 py-2">
                                        {item.itemCode}
                                    </td>

                                    <td className="border border-slate-200 px-3 py-2">
                                        {item.productionLine}
                                    </td>

                                    <td className="border border-slate-200 px-3 py-2 text-right">
                                        {item.productionManpower}
                                    </td>

                                    <td className="border border-slate-200 px-3 py-2 text-right">
                                        {formatNumber(item.totalTime, 2)}
                                    </td>

                                    <td className="border border-slate-200 px-3 py-2 text-right">
                                        {formatNumber(item.standardOutput, 2)}
                                    </td>

                                    <td className="border border-slate-200 px-3 py-2 text-right">
                                        {formatSummaryMoney(item.averagePrice, 0)}
                                    </td>

                                    {/* <td className="border border-slate-200 px-3 py-2 text-center">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenDetail(item.id);
                                            }}
                                            className="text-blue-700 font-bold hover:underline"
                                        >
                                            Mở
                                        </button>
                                    </td> */}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const inputClass = `w-full border border-slate-300 rounded-lg px-3 py-2 text-sm ${isViewMode ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
        }`;

    const renderFormTest = () => {
        return (
            <div>
                <label>Nhập tên</label>
                <div>
                    <input type="text" placeholder='nhập...' className='border'
                        value={form_test.name ?? ''}
                        onChange={(e) => updateFormTest('name', e.target.value)}
                    />
                </div>
                <label>Nhập tuổi</label>
                <div>
                    <input type="number" placeholder='nhập...' className='border'
                        value={Number(form_test.age)}
                        onChange={(e) => updateFormTest('age', Number(e.target.value))}
                    />
                </div>
                <div>
                    <button
                        type='button'
                        onClick={handleSaveTest}
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    }

    const renderSewingProcessForm = () => {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                    {/* THONG TIN CHUNG */}
                    <div className="xl:col-span-5 bg-white border border-slate-300 rounded-sm p-4">
                        <div className="inline-block px-3 py-1 bg-sky-100 border border-sky-300 text-xs font-bold mb-3">
                            THÔNG TIN CHUNG
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Mã chứng từ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    disabled={isViewMode}
                                    value={form.documentCode}
                                    onChange={(e) => updateForm('documentCode', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Khách hàng
                                </label>
                                <select
                                    disabled={isViewMode}
                                    value={form.customerId ?? ''}
                                    onChange={(e) => handleCustomerChange(e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">-- Chọn khách hàng --</option>
                                    {activeCustomers.map((customer: any) => (
                                        <option key={customer.id} value={customer.id}>
                                            {getCustomerCode(customer)} - {getCustomerName(customer)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Mã khách hàng
                                </label>
                                <input
                                    readOnly
                                    value={form.customerCode || ''}
                                    className="w-full border border-slate-300 bg-slate-100 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Tên khách hàng
                                </label>
                                <input
                                    readOnly
                                    value={form.customerName || ''}
                                    className="w-full border border-slate-300 bg-slate-100 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Mã hàng
                                </label>
                                <input
                                    disabled={isViewMode}
                                    value={form.itemCode || ''}
                                    onChange={(e) => updateForm('itemCode', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Chuyền SX
                                </label>
                                <input
                                    disabled={isViewMode}
                                    value={form.productionLine || ''}
                                    onChange={(e) => updateForm('productionLine', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Lần SX
                                </label>
                                <input
                                    disabled={isViewMode}
                                    type="number"
                                    value={numberInputValue(form.productionRound)}
                                    onChange={(e) => updateForm('productionRound', toNumberOrNull(e.target.value))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Thời gian LV <span className="text-red-500">*</span>
                                </label>
                                <input
                                    disabled={isViewMode}
                                    type="number"
                                    value={form.workingHours}
                                    onChange={(e) => updateForm('workingHours', Number(e.target.value || 0))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Nhân sự
                                </label>
                                <input
                                    disabled={isViewMode}
                                    type="number"
                                    value={numberInputValue(form.manpower)}
                                    onChange={(e) => updateForm('manpower', toNumberOrNull(e.target.value))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Nhân sự SX <span className="text-red-500">*</span>
                                </label>
                                <input
                                    disabled={isViewMode}
                                    type="number"
                                    value={form.productionManpower}
                                    onChange={(e) => updateForm('productionManpower', Number(e.target.value || 0))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Số lượng SP
                                </label>
                                <input
                                    disabled={isViewMode}
                                    type="number"
                                    value={numberInputValue(form.quantity)}
                                    onChange={(e) => updateForm('quantity', toNumberOrNull(e.target.value))}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Ngày áp dụng
                                </label>
                                <input
                                    disabled={isViewMode}
                                    type="date"
                                    value={dateInputValue(form.effectiveDate)}
                                    onChange={(e) => updateForm('effectiveDate', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Ngày ban hành
                                </label>
                                <input
                                    disabled={isViewMode}
                                    type="date"
                                    value={dateInputValue(form.issuedDate)}
                                    onChange={(e) => updateForm('issuedDate', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Cách tính đơn giá
                                </label>
                                <select
                                    disabled={isViewMode}
                                    value={form.priceMode}
                                    onChange={(e) => updateForm('priceMode', e.target.value as 'GSD' | 'ADJUSTED')}
                                    className={inputClass}
                                >
                                    <option value="GSD">Theo SMV GSD</option>
                                    <option value="ADJUSTED">Theo SMV điều chỉnh</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-600 mb-1">
                                    Ghi chú
                                </label>
                                <input
                                    disabled={isViewMode}
                                    value={form.note || ''}
                                    onChange={(e) => updateForm('note', e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* THONG TIN SAN XUAT */}
                    <div className="xl:col-span-4 bg-white border border-slate-300 rounded-sm p-4">
                        <div className="inline-block px-3 py-1 bg-sky-100 border border-sky-300 text-xs font-bold mb-3">
                            THÔNG TIN SẢN XUẤT
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                            <SummaryBox
                                label="Tổng thời gian"
                                formula="SUM(SMV điều chỉnh)"
                                value={result?.summary.totalTime}
                            />

                            <SummaryBox
                                label="Tổng phút chuẩn"
                                formula="Tổng thời gian / 60"
                                value={result?.summary.c1}
                            />

                            <SummaryBox
                                label="Tổng SMV GSD gốc"
                                formula="SUM(SMV gốc GSD)"
                                value={result?.summary.totalSamGsd}
                            />

                            <SummaryBox
                                label="Nhịp sản xuất"
                                formula="Tổng thời gian / Nhân sự SX"
                                value={result?.summary.taktTime}
                            />

                            <SummaryBox
                                label="Nhịp phút/người"
                                formula="Nhịp sản xuất / 60"
                                value={result?.summary.c3}
                            />

                            <SummaryBox
                                label="Hệ số điều chỉnh SMV"
                                formula="Tổng thời gian / Tổng SMV GSD gốc"
                                value={result?.summary.c4}
                            />

                            <SummaryBox
                                label="Định mức sản lượng"
                                formula="(3600 / Tổng thời gian) * Thời gian LV * Nhân sự SX"
                                value={result?.summary.standardOutput}
                            />

                            <SummaryBox
                                label="Sản lượng/giờ"
                                formula="Định mức sản lượng / Thời gian LV"
                                value={result?.summary.c5}
                            />

                            <SummaryBox
                                label="Định mức theo SMV gốc"
                                formula="(3600 / Tổng SMV GSD gốc) * Thời gian LV * Nhân sự SX"
                                value={result?.summary.c6}
                            />

                            <SummaryBox
                                label="Tổng đơn giá"
                                formula="SUM(Đơn giá chuẩn)"
                                value={result?.summary.totalStandardPrice}
                                money
                                digits={0}
                            />

                            <SummaryBox
                                label="Tổng đơn giá theo định mức"
                                formula="Định mức sản lượng * Tổng đơn giá"
                                value={result?.summary.totalPriceByOutput}
                                money
                                digits={0}
                            />

                            <SummaryBox
                                label="Đơn giá bình quân"
                                formula="Tổng đơn giá theo định mức / Nhân sự SX"
                                value={result?.summary.averagePrice}
                                money
                                digits={0}
                            />
                        </div>
                    </div>

                    {/* HINH ANH */}
                    <div className="xl:col-span-3 bg-white border border-slate-300 rounded-sm p-4">
                        <div className="inline-block px-3 py-1 bg-sky-100 border border-sky-300 text-xs font-bold mb-3">
                            HÌNH ẢNH
                        </div>

                        <div className="space-y-3">
                            <div className="h-[180px] border border-dashed border-slate-300 rounded-sm flex items-center justify-center bg-slate-50 overflow-hidden">
                                {mainImageSrc ? (
                                    <img
                                        src={mainImageSrc}
                                        alt="Hình mã hàng"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-xs text-slate-400">
                                        Chưa có hình ảnh
                                    </span>
                                )}
                            </div>

                            {!isViewMode && (
                                <div className="flex gap-2">
                                    <label className="px-3 py-2 rounded-sm border border-blue-300 text-blue-700 text-xs font-bold hover:bg-blue-50 cursor-pointer">
                                        {imageUploading ? 'Đang upload...' : 'Upload hình'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            disabled={imageUploading}
                                            onChange={handleUploadMainImage}
                                        />
                                    </label>

                                    {mainImageFileName && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveMainImage}
                                            className="px-3 py-2 rounded-sm border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50"
                                        >
                                            Xóa hình
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-300 rounded-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('process')}
                                className={`px-4 py-2 text-xs font-bold border rounded-md ${activeTab === 'process'
                                    ? 'bg-sky-100 border-sky-400 text-sky-800'
                                    : 'bg-white border-slate-300 text-slate-600'
                                    }`}
                            >
                                Bảng quy trình
                            </button>

                            <button
                                type="button"
                                onClick={async () => {
                                    await handleCalculate();
                                    setActiveTab('machine');
                                }}
                                className={`px-4 py-2 text-xs font-bold border rounded-md ${activeTab === 'machine'
                                    ? 'bg-sky-100 border-sky-400 text-sky-800'
                                    : 'bg-white border-slate-300 text-slate-600'
                                    }`}
                            >
                                Nhu cầu MMTB
                            </button>

                            {/* <button
                                type="button"
                                onClick={() => setActiveTab('test')}
                                className={`px-4 py-2 text-xs font-bold border rounded-md ${activeTab === 'test'
                                    ? 'bg-sky-100 border-sky-400 text-sky-800'
                                    : 'bg-white border-slate-300 text-slate-600'
                                    }`}
                            >
                                Test
                            </button> */}
                        </div>

                        {!isViewMode && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleOpenOperationPicker}
                                    className="px-4 py-2 rounded-md bg-yellow-100 border border-yellow-300 text-xs font-bold hover:bg-yellow-200"
                                >
                                    Chọn công đoạn
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCalculate}
                                    disabled={calculating}
                                    className="px-4 py-2 rounded-md bg-yellow-100 border border-yellow-300 text-xs font-bold hover:bg-yellow-200 disabled:opacity-50"
                                >
                                    {calculating ? 'Đang tính...' : 'Tính'}
                                </button>

                                {/* <button
                                    type="button"
                                    onClick={() => setActiveTab('machine')}
                                    className="px-4 py-2 rounded-md bg-yellow-100 border border-yellow-300 text-xs font-bold hover:bg-yellow-200"
                                >
                                    Tính nhu cầu MMTB
                                </button> */}
                            </div>
                        )}
                    </div>

                    {activeTab === 'process' && renderProcessTable()}

                    {activeTab === 'machine' && renderMachineNeedTable()}

                    {activeTab === 'test' && renderTableTest()}

                </div>

                {isOperationPickerOpen && (
                    <OperationPickerModal
                        productCateGroups={productCateGroups}
                        operationClusters={filteredOperationClusters}
                        pickerProductCateGroupId={pickerProductCateGroupId}
                        pickerOperationClusterId={pickerOperationClusterId}
                        pickerRows={pickerRows}
                        pickedOperationMap={pickedOperationMap}
                        pickedOperationCount={pickedOperationLines.length}
                        onProductCateGroupChange={(value) => {
                            setPickerProductCateGroupId(value);
                            setPickerOperationClusterId('');
                            setPickerRows([]);
                        }}
                        onClusterChange={handlePickerClusterChange}
                        onToggleRow={togglePickerRow}
                        onToggleAllRows={toggleAllPickerRows}
                        onConfirm={handleConfirmPickedOperations}
                        onClose={() => setIsOperationPickerOpen(false)}
                    />
                )}
            </div>
        );
    };

    const handleOpenOperationActions = async (line: SewingProcessLine) => {
        const operationLineId = line.sourceLineId ?? null;
        const gsdAnalysisId = line.gsdAnalysisId ?? null;

        if (!operationLineId && !gsdAnalysisId) {
            alert('Công đoạn này chưa có mã dòng kho cụm hoặc mã GSD để xem thao tác.');
            return;
        }

        setOperationActionsModal({
            title: line.operationName || 'Chi tiết thao tác',
            loading: true,
            rows: [],
        });

        try {
            let rows: any[] = [];

            if (operationLineId) {
                try {
                    rows = await sewingProcessService.getActionDetailsByOperationClusterLineId(
                        Number(operationLineId)
                    );
                } catch (err) {
                    if (!gsdAnalysisId) {
                        throw err;
                    }
                }
            }

            if ((!Array.isArray(rows) || rows.length === 0) && gsdAnalysisId) {
                rows = await sewingProcessService.getGsdActionDetailsById(
                    Number(gsdAnalysisId)
                );
            }

            setOperationActionsModal({
                title: line.operationName || 'Chi tiết thao tác',
                loading: false,
                rows: Array.isArray(rows) ? rows : [],
            });
        } catch (err: any) {
            setOperationActionsModal(null);

            alert(
                err?.response?.data?.message ||
                err?.message ||
                'Lấy danh sách thao tác thất bại.'
            );
        }
    };

    const renderTableTest = () => {
        return (
            <div className="overflow-auto border border-slate-300 rounded-sm max-h-[460px]">
                <table className="min-w-[2600px] w-full text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10">
                        <tr>
                            <th className="border border-slate-300 px-2 py-2">STT</th>
                            <th className="border border-slate-300 px-2 py-2">name</th>
                            <th className="border border-slate-300 px-2 py-2">age</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((item, index) => (
                            <tr key={item.id}>
                                <th>{index + 1}</th>
                                <th className="border border-slate-300 px-2 py-2">{item.name}</th>
                                <th className="border border-slate-300 px-2 py-2">{item.age}</th>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    const renderProcessTable = () => {
        return (
            <div className="overflow-auto border border-slate-300 rounded-sm max-h-[460px]">
                <table className="min-w-[2600px] w-full text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10">
                        <tr>
                            <th className="border border-slate-300 px-2 py-2">STT</th>
                            <th className="border border-slate-300 px-2 py-2">STT xếp chuyền</th>
                            <th className="border border-slate-300 px-2 py-2">Tên cụm</th>
                            <th className="border border-slate-300 px-2 py-2">Tên công đoạn</th>
                            <th className="border border-slate-300 px-2 py-2">Hình ảnh</th>
                            <th className="border border-slate-300 px-2 py-2">Bậc thợ</th>
                            {/* <th className="border border-slate-300 px-2 py-2">Nhu cầu CCDC</th> */}
                            <th className="border border-slate-300 px-2 py-2">Nhân sự</th>
                            <th className="border border-slate-300 px-2 py-2">MMTB</th>
                            <th className="border border-slate-300 px-2 py-2">MMTB Code</th>
                            <th className="border border-slate-300 px-2 py-2">SMV gốc GSD</th>
                            <th className="border border-slate-300 px-2 py-2">Hệ số bậc thợ</th>
                            {/* <th className="border border-slate-300 px-2 py-2">Nhân sự</th> */}
                            <th className="border border-slate-300 px-2 py-2">Đơn giá chuẩn</th>
                            <th className="border border-slate-300 px-2 py-2">Hiệu suất yêu cầu</th>
                            <th className="border border-slate-300 px-2 py-2">Hiệu suất sử dụng</th>
                            <th className="border border-slate-300 px-2 py-2">SMV điều chỉnh</th>
                            <th className="border border-slate-300 px-2 py-2">Nhân sự may CĐ</th>
                            <th className="border border-slate-300 px-2 py-2">Thời gian CBC</th>
                            <th className="border border-slate-300 px-2 py-2">Ghi chú</th>
                            <th className="border border-slate-300 px-2 py-2">Tổng thao tác</th>
                            {!isViewMode && (
                                <th className="border border-slate-300 px-2 py-2">Xóa</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {form.lines.length === 0 && (
                            <tr>
                                <td
                                    colSpan={isViewMode ? 17 : 18}
                                    className="border border-slate-300 px-4 py-6 text-center text-slate-400"
                                >
                                    Chưa có công đoạn. Bấm “Chọn công đoạn” để lấy từ kho cụm.
                                </td>
                            </tr>
                        )}

                        {form.lines.map((line, index) => {

                            const imageFileName = line.imageFileName || line.imageUrl || '';
                            const imageSrc = getGsdAnalysisImageUrl(imageFileName);

                            return (
                                <tr key={`${line.id || 'new'}-${index}`}>
                                    <td className="border border-slate-300 px-2 py-2 text-center">
                                        {index + 1}
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            disabled={isViewMode}
                                            type="number"
                                            value={numberInputValue(line.lineOrder)}
                                            onChange={(e) =>
                                                updateLine(index, 'lineOrder', toNumberOrNull(e.target.value))
                                            }
                                            className="w-full outline-none text-right disabled:bg-slate-100"
                                        />
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            disabled={isViewMode}
                                            value={line.clusterName || ''}
                                            onChange={(e) => updateLine(index, 'clusterName', e.target.value)}
                                            className="w-full min-w-[140px] outline-none disabled:bg-slate-100"
                                        />
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenOperationActions(line)}
                                            className="text-left text-blue-700 font-semibold hover:underline min-w-[220px]"
                                            title="Xem thao tác công đoạn"
                                        >
                                            {line.operationName || '-'}
                                        </button>
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <div className="h-[50px] w-[50px] border border-dashed border-slate-300 rounded-sm flex items-center justify-center bg-slate-50 overflow-hidden">
                                            {imageSrc ? (
                                                <button
                                                    type='button'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewGsdAnalysisImageUrl(imageSrc);
                                                    }}
                                                    className="inline-flex items-center justify-center w-12 h-12 border border-slate-200 rounded-sm bg-slate-50 overflow-hidden hover:ring-2 hover:ring-blue-400"
                                                    title="Xem hình"
                                                >
                                                    <img
                                                        src={imageSrc}
                                                        alt="Hình mã hàng"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </button>

                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            disabled={isViewMode}
                                            type="number"
                                            value={numberInputValue(line.skillGradeLevel)}
                                            onChange={(e) =>
                                                updateLine(index, 'skillGradeLevel', toNumberOrNull(e.target.value))
                                            }
                                            className="w-full outline-none text-right disabled:bg-slate-100"
                                        />
                                    </td>

                                    {/* <td className="border border-slate-300 px-2 py-2">
                                    <input
                                        disabled={isViewMode}
                                        value={line.toolNeed || ''}
                                        onChange={(e) => updateLine(index, 'toolNeed', e.target.value)}
                                        className="w-full min-w-[120px] outline-none disabled:bg-slate-100"
                                    />
                                </td> */}

                                    <td className="border border-slate-300 px-2 py-2 text-right">
                                        {result ? formatNumber(line.laborCount, 2) : '-'}
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <select
                                            disabled={isViewMode}
                                            value={line.machineId ?? ''}
                                            onChange={(e) => handleMachineChange(index, e.target.value)}
                                            className="w-full min-w-[180px] outline-none bg-white disabled:bg-slate-100"
                                        >
                                            <option value="">-- Chọn máy --</option>
                                            {activeMachines.map((machine: any) => (
                                                <option key={machine.id} value={machine.id}>
                                                    {getMachineName(machine)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            readOnly
                                            value={line.machineCode || ''}
                                            className="w-full min-w-[120px] outline-none bg-slate-100 text-slate-700"
                                        />
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            disabled={isViewMode}
                                            type="number"
                                            step="0.0001"
                                            value={line.samGsd}
                                            onChange={(e) =>
                                                updateLine(index, 'samGsd', Number(e.target.value || 0))
                                            }
                                            className="w-full outline-none text-right disabled:bg-slate-100"
                                        />
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            disabled={isViewMode}
                                            type="number"
                                            step="0.0001"
                                            value={line.salaryCoefficient}
                                            onChange={(e) =>
                                                updateLine(index, 'salaryCoefficient', Number(e.target.value || 0))
                                            }
                                            className="w-full outline-none text-right disabled:bg-slate-100"
                                        />
                                    </td>
                                    {/* 
                                <td className="border border-slate-300 px-2 py-2 text-right font-bold">
                                    {result ? formatNumber(line.laborCount, 4) : '-'}
                                </td> */}

                                    <td className="border border-slate-300 px-2 py-2 text-right font-bold text-green-700">
                                        {result ? formatSummaryMoney(line.standardPrice, 0) : '-'}
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            disabled={isViewMode}
                                            type="number"
                                            step="0.01"
                                            value={numberInputValue(line.requiredEfficiency)}
                                            onChange={(e) =>
                                                updateLine(index, 'requiredEfficiency', toNumberOrNull(e.target.value))
                                            }
                                            className="w-full outline-none text-right disabled:bg-slate-100"
                                        />
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2 text-right font-bold text-slate-700">
                                        {result ? formatNumber(line.usedEfficiency, 2) : '-'}
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2 text-right font-bold text-blue-700">
                                        {result ? formatNumber(line.adjustedSam, 2) : '-'}
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            disabled={isViewMode}
                                            value={line.sewingEmployee || ''}
                                            onChange={(e) => updateLine(index, 'sewingEmployee', e.target.value)}
                                            className="w-full min-w-[120px] outline-none disabled:bg-slate-100"
                                        />
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            disabled={isViewMode}
                                            type="number"
                                            step="0.0001"
                                            value={numberInputValue(line.cbcTime)}
                                            onChange={(e) =>
                                                updateLine(index, 'cbcTime', toNumberOrNull(e.target.value))
                                            }
                                            className="w-full outline-none text-right disabled:bg-slate-100"
                                        />
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2">
                                        <input
                                            disabled={isViewMode}
                                            value={line.note || ''}
                                            onChange={(e) => updateLine(index, 'note', e.target.value)}
                                            className="w-full min-w-[140px] outline-none disabled:bg-slate-100"
                                        />
                                    </td>

                                    <td className="border border-slate-300 px-2 py-2 text-right">
                                        {line.totalActions || 0}
                                    </td>

                                    {!isViewMode && (
                                        <td className="border border-slate-300 px-2 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeLine(index)}
                                                className="text-red-600 font-bold hover:underline"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    )}


                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {previewGsdAnalysisImageUrl && (
                    <ImagePreviewModal
                        imageUrl={previewGsdAnalysisImageUrl}
                        onClose={() => setPreviewGsdAnalysisImageUrl('')}
                    />
                )}
            </div>
        );
    };

    const renderMachineNeedTable = () => {
        return (
            <div className="overflow-auto border border-slate-300 rounded-sm max-h-[460px]">
                <div className="mb-2 text-xs text-slate-600">
                    Nhịp sản xuất dùng tính MMTB:{' '}
                    <span className="font-bold text-blue-700">
                        {result ? formatNumber(result.summary.taktTime, 4) : '-'}
                    </span>
                </div>
                <table className="w-full min-w-[600px] text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10">
                        <tr>
                            <th className="border border-slate-300 px-3 py-2 text-left w-[50px]">Mã máy</th>
                            <th className="border border-slate-300 px-3 py-2 text-left w-[50px]">Tên máy</th>
                            <th className="border border-slate-300 px-3 py-2 text-right w-[50px]">Tổng SMV</th>
                            <th className="border border-slate-300 px-3 py-2 text-right w-[50px]">Nhu cầu</th>
                            <th className="border border-slate-300 px-3 py-2 text-right w-[50px]">Số lượng MMTB</th>
                        </tr>
                    </thead>

                    <tbody>
                        {!result || result.machineNeeds.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="border border-slate-300 px-4 py-6 text-center text-slate-400"
                                >
                                    Chưa có dữ liệu nhu cầu MMTB. Bấm “Tính” trước.
                                </td>
                            </tr>
                        ) : (
                            result.machineNeeds.map((item, index) => (
                                <tr key={`${item.machineCode || 'machine'}-${index}`}>
                                    <td className="border border-slate-300 px-3 py-2">
                                        {item.machineCode}
                                    </td>
                                    <td className="border border-slate-300 px-3 py-2">
                                        {item.machineName}
                                    </td>
                                    <td className="border border-slate-300 px-3 py-2 text-right">
                                        {formatNumber(item.sumSmv, 2)}
                                    </td>
                                    <td className="border border-slate-300 px-3 py-2 text-right">
                                        {formatNumber(item.machineNeed, 2)}
                                    </td>
                                    <td className="border border-slate-300 px-3 py-2 text-right font-bold text-blue-700">
                                        {formatNumber(item.machineQuantity, 0)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                            Danh sách quy trình may
                        </h2>
                        {/* <p className="text-xs text-slate-500 mt-1">
                            Chọn chứng từ để xem, sửa hoặc tạo mới bảng quy trình may.
                        </p> */}
                    </div>

                    <div className="flex gap-2">

                        {/* <button
                            type='button'
                            onClick={handleTest}
                        >
                            button test
                        </button> */}

                        <button
                            type="button"
                            onClick={handleCreateNew}
                            className="px-4 py-2 rounded-sm bg-blue-700 text-white text-xs font-bold hover:bg-blue-800"
                        >
                            Thêm mới
                        </button>

                        <button
                            type="button"
                            onClick={handleEditSelected}
                            disabled={!selectedId}
                            className="px-4 py-2 rounded-sm border border-amber-300 text-amber-700 text-xs font-bold hover:bg-amber-50 disabled:opacity-50"
                        >
                            Sửa
                        </button>

                        <button
                            type="button"
                            onClick={refresh}
                            disabled={loading}
                            className="px-4 py-2 rounded-sm border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
                        >
                            {loading ? 'Đang tải...' : 'Tải lại'}
                        </button>
                    </div>
                </div>

                {/* TABLE DANH SÁCH Ở ĐÂY */}
                {renderSavedList()}
            </div>

            {isModalOpen && modalMode && (
                <SewingProcessModal
                    mode={modalMode}
                    isViewMode={isViewMode}
                    onClose={handleCloseModal}
                    onEdit={() => setModalMode('edit')}
                    onSave={handleSave}
                    saving={saving}
                    calculating={calculating}
                >
                    {renderSewingProcessForm()}
                </SewingProcessModal>
            )}

            {operationActionsModal && (
                <OperationActionsModal
                    title={operationActionsModal.title}
                    loading={operationActionsModal.loading}
                    rows={operationActionsModal.rows}
                    onClose={() => setOperationActionsModal(null)}
                />
            )}

            {previewImageUrl && (
                <ImagePreviewModal
                    imageUrl={previewImageUrl}
                    onClose={() => setPreviewImageUrl('')}
                />
            )}


            {modalTest && (
                <ModalTest
                    onClose={handleCloseModal}
                    title={""}
                >
                    {renderFormTest()}
                </ModalTest>
            )}
        </div>
    );
}

function ImagePreviewModal({
    imageUrl,
    onClose,
}: {
    imageUrl: string;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-6"
            onClick={onClose} // bấm ngoài ảnh, đóng pop up
        >
            <img
                src={imageUrl}
                alt="Hình mã hàng"
                className="w-[30vw] h-[50vh] object-contain bg-white"
                onClick={(e) => e.stopPropagation()} // bấm vào ảnh ko đóng pop up
            />
        </div>
    );
}

function OperationActionsModal({
    title,
    loading,
    rows,
    onClose,
}: {
    title: string;
    loading: boolean;
    rows: any[];
    onClose: () => void;
}) {
    const safeRows = Array.isArray(rows) ? rows : [];

    return (
        <div
            className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90vw] max-w-[1100px] max-h-[85vh] rounded-sm shadow-xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase">
                            Chi tiết thao tác công đoạn
                        </h3>
                        <div className="text-xs text-slate-500 mt-1">
                            {title}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-sm border border-slate-300 text-xs font-bold hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-auto p-4">
                    {loading ? (
                        <div className="text-center text-slate-400 text-sm py-8">
                            Đang tải thao tác...
                        </div>
                    ) : (
                        <table className="w-full min-w-[900px] text-xs border-collapse">
                            <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10">
                                <tr>
                                    <th className="border border-slate-300 px-2 py-2 text-center">
                                        STT
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">
                                        Line no
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">
                                        Step no
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2">
                                        Mã GSD
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2">
                                        Tên thao tác
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">
                                        TMU
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">
                                        Tần suất
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2 text-right">
                                        Giây
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {safeRows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="border border-slate-300 px-4 py-8 text-center text-slate-400"
                                        >
                                            Công đoạn này chưa có thao tác.
                                        </td>
                                    </tr>
                                )}

                                {safeRows.map((row, index) => (
                                    <tr key={`${row.id || 'action'}-${index}`}>
                                        <td className="border border-slate-300 px-2 py-2 text-center">
                                            {index + 1}
                                        </td>

                                        <td className="border border-slate-300 px-2 py-2 text-right">
                                            {row.lineNo ?? row.line_no ?? ''}
                                        </td>

                                        <td className="border border-slate-300 px-2 py-2 text-right">
                                            {row.stepNo ?? row.step_no ?? ''}
                                        </td>

                                        <td className="border border-slate-300 px-2 py-2">
                                            {getActionCode(row)}
                                        </td>

                                        <td className="border border-slate-300 px-2 py-2">
                                            {getActionName(row)}
                                        </td>

                                        <td className="border border-slate-300 px-2 py-2 text-right">
                                            {formatNumber(row.tmu, 2)}
                                        </td>

                                        <td className="border border-slate-300 px-2 py-2 text-right">
                                            {formatNumber(row.frequency, 2)}
                                        </td>

                                        <td className="border border-slate-300 px-2 py-2 text-right">
                                            {formatNumber(getActionTime(row), 2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryBox({
  label,
  formula,
  value,
  money = false,
  digits = 2,
}: {
  label: string;
  formula?: string;
  value: number | null | undefined;
  money?: boolean;
  digits?: number;
}) {
  const displayValue = money
    ? formatSummaryMoney(value, digits)
    : formatSummaryNumber(value, digits);

  return (
    <div className="border border-slate-200 rounded-sm p-2 bg-slate-50 min-h-[74px]">
      <div className="flex items-center gap-2">
        <div className="text-slate-500 font-semibold leading-snug">
          {label}
        </div>

        {formula && (
          <div className="relative group">
            <button
              type="button"
              aria-label={formula}
              className="
                flex h-4 w-4
                shrink-0 items-center justify-center
                rounded-full
                border border-slate-400
                text-[10px]
                font-bold
                text-slate-500
                cursor-help
                focus:outline-none
              "
            >
              ?
            </button>

            <div
              className="
                invisible absolute
                left-1/2 bottom-full
                z-50 mb-2
                w-max max-w-[280px]
                -translate-x-1/2
                rounded
                bg-slate-800
                px-3 py-2
                text-xs font-normal
                leading-snug text-white
                shadow-lg
                opacity-0
                pointer-events-none
                transition-opacity
                group-hover:visible
                group-hover:opacity-100
                group-focus-within:visible
                group-focus-within:opacity-100
              "
            >
              {formula}

              <div
                className="
                  absolute left-1/2 top-full
                  -translate-x-1/2
                  border-4 border-transparent
                  border-t-slate-800
                "
              />
            </div>
          </div>
        )}
      </div>

      <div className="font-bold text-slate-800 mt-1 break-words">
        {displayValue}
      </div>
    </div>
  );
}

function ModalTest({ onClose, title, children, }: { onClose: () => void, title: '', children: ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-[50vw] max-w-[1600px] h-[50vh] rounded-sm shadow-xl flex flex-col">
                <div>
                    {children}
                </div>
                <button
                    type='button'
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

function SewingProcessModal({
    mode,
    isViewMode,
    onClose,
    onEdit,
    onSave,
    saving,
    calculating,
    children,
}: {
    mode: 'create' | 'view' | 'edit';
    isViewMode: boolean;
    onClose: () => void;
    onEdit: () => void;
    onSave: () => void;
    saving: boolean;
    calculating: boolean;
    children: ReactNode;
}) {
    const title =
        mode === 'create'
            ? 'Thêm mới bảng quy trình may'
            : mode === 'edit'
                ? 'Sửa bảng quy trình may'
                : 'Chi tiết bảng quy trình may';

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-[96vw] max-w-[1600px] h-[92vh] rounded-sm shadow-xl flex flex-col">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 uppercase">
                            {title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            {isViewMode
                                ? 'Đang ở chế độ xem. Bấm Sửa để chỉnh dữ liệu.'
                                : 'Nhập thông tin, bấm Tính rồi Lưu chứng từ.'}
                        </p>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-auto p-5 bg-slate-50">
                    {children}
                </div>

                <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-sm border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                    >
                        Đóng
                    </button>

                    {isViewMode ? (
                        <button
                            type="button"
                            onClick={onEdit}
                            className="px-4 py-2 rounded-sm bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                        >
                            Sửa
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={saving || calculating}
                            className="px-4 py-2 rounded-sm bg-green-700 text-white text-xs font-bold hover:bg-green-800 disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function getPickerLineKey(row: SewingProcessLine) {
    return [
        row.sourceDocumentCode || '',
        row.sourceLineId ?? '',
        row.clusterName || '',
        row.operationCode || '',
        row.operationName || '',
        row.lineOrder ?? row.lineNo,
    ].join('|');
}

function OperationPickerModal({
    productCateGroups,
    operationClusters,
    pickerProductCateGroupId,
    pickerOperationClusterId,
    pickerRows,
    pickedOperationMap,
    pickedOperationCount,
    onProductCateGroupChange,
    onClusterChange,
    onToggleRow,
    onToggleAllRows,
    onConfirm,
    onClose,
}: {
    productCateGroups: any[];
    operationClusters: any[];
    pickerProductCateGroupId: number | '';
    pickerOperationClusterId: number | '';
    pickerRows: SewingProcessLine[];
    pickedOperationMap: Record<string, SewingProcessLine>;
    pickedOperationCount: number;
    onProductCateGroupChange: (value: number | '') => void;
    onClusterChange: (value: string) => void;
    onToggleRow: (row: SewingProcessLine, checked: boolean) => void;
    onToggleAllRows: (checked: boolean) => void;
    onConfirm: () => void;
    onClose: () => void;
}) {
    const allCurrentRowsChecked =
        pickerRows.length > 0 &&
        pickerRows.every((row) => pickedOperationMap[getPickerLineKey(row)]);

    return (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-[92vw] max-w-[1300px] h-[78vh] rounded-sm shadow-xl flex flex-col">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 uppercase">
                            Chọn công đoạn
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Lọc theo nhóm chủng loại, chọn chứng từ kho cụm, tick công đoạn rồi xác nhận.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-2 rounded-sm border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                    >
                        Đóng
                    </button>
                </div>

                <div className="p-5 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Nhóm chủng loại
                        </label>
                        <select
                            value={pickerProductCateGroupId}
                            onChange={(e) =>
                                onProductCateGroupChange(
                                    e.target.value ? Number(e.target.value) : ''
                                )
                            }
                            className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm"
                        >
                            <option value="">-- Tất cả nhóm chủng loại --</option>
                            {productCateGroups
                                .filter((item: any) => getStatusId(item) === 0)
                                .map((item: any) => (
                                    <option key={item.id} value={item.id}>
                                        {getProductCateGroupName(item)}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-600 mb-1">
                            Chứng từ kho cụm công đoạn
                        </label>
                        <select
                            value={pickerOperationClusterId}
                            onChange={(e) => onClusterChange(e.target.value)}
                            className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm"
                        >
                            <option value="">-- Chọn chứng từ kho cụm --</option>
                            {operationClusters.map((item: any) => (
                                <option key={item.id} value={item.id}>
                                    {getDocumentCode(item)}
                                    {getOperationClusterName(item)
                                        ? ` - ${getOperationClusterName(item)}`
                                        : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-auto p-5">
                    <div className="mb-2 text-xs text-slate-600">
                        Số công đoạn đã chọn:{' '}
                        <span className="font-bold text-blue-700">
                            {pickedOperationCount}
                        </span>
                    </div>

                    <div className="overflow-auto border border-slate-300 rounded-sm">
                        <table className="min-w-[1200px] w-full text-xs border-collapse">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                    <th className="border border-slate-300 px-2 py-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={allCurrentRowsChecked}
                                            disabled={pickerRows.length === 0}
                                            onChange={(e) =>
                                                onToggleAllRows(e.target.checked)
                                            }
                                        />
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2">
                                        STT xếp chuyền
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2">
                                        Tên cụm
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2">
                                        Tên công đoạn
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2">
                                        Bậc thợ
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2">
                                        Code MMTB
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2">
                                        SAM gốc GSD
                                    </th>
                                    <th className="border border-slate-300 px-2 py-2">
                                        Tổng thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {pickerRows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="border border-slate-300 px-4 py-6 text-center text-slate-400"
                                        >
                                            Chưa có công đoạn. Hãy chọn chứng từ kho cụm.
                                        </td>
                                    </tr>
                                )}

                                {pickerRows.map((row, index) => {
                                    const rowKey = getPickerLineKey(row);
                                    const checked = Boolean(pickedOperationMap[rowKey]);

                                    return (
                                        <tr key={rowKey}>
                                            <td className="border border-slate-300 px-2 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={(e) =>
                                                        onToggleRow(row, e.target.checked)
                                                    }
                                                />
                                            </td>

                                            <td className="border border-slate-300 px-2 py-2 text-right">
                                                {row.lineOrder || index + 1}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-2">
                                                {row.clusterName}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-2">
                                                {row.operationName}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-2 text-right">
                                                {row.skillGradeLevel}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-2">
                                                {row.machineCode}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-2 text-right">
                                                {formatNumber(row.samGsd, 4)}
                                            </td>

                                            <td className="border border-slate-300 px-2 py-2 text-right">
                                                {row.totalActions || 0}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-sm border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-sm bg-blue-700 text-white text-xs font-bold hover:bg-blue-800"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}