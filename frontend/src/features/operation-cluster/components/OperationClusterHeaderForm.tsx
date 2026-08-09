type FormState = {
    document_code: string;
    work_id: string;
    product_category_id: string;
    product_category_group_id: string;
    required_efficiency: string;
    price_method: 'GSD' | 'ADJUSTED';
    status_id: number;
    note: string;
};

type WorkOption = {
    id: number;
    workCode: string;
    workName: string;
    statusId: number;
};

type ProductCateOption = {
    id: number;
    productCode: string;
    productName: string;
    statusId: number;
};

type ProductCateGroupOption = {
    id: number;
    cateGroupCode: string;
    cateGroupName: string;
    statusId: number;
};

type OperationClusterHeaderFormProps = {
    form: FormState;
    works: WorkOption[];
    productCates: ProductCateOption[];
    productCateGroups: ProductCateGroupOption[];
    worksLoading: boolean;
    productCatesLoading: boolean;
    productCateGroupsLoading: boolean;

    onDocumentCodeChange: (value: string) => void;
    onWorkIdChange: (value: string) => void;
    onProductCategoryIdChange: (value: string) => void;
    onProductCategoryGroupIdChange: (value: string) => void;
    onEfficiencyChange: (value: string) => void;
    onStatusChange: (value: number) => void;
    onPriceMethodChange: (value: 'GSD' | 'ADJUSTED') => void;
    onNoteChange: (value: string) => void;
};

export default function OperationClusterHeaderForm({
    form,
    works,
    productCates,
    productCateGroups,
    worksLoading,
    productCatesLoading,
    productCateGroupsLoading,
    onDocumentCodeChange,
    onWorkIdChange,
    onProductCategoryIdChange,
    onProductCategoryGroupIdChange,
    onEfficiencyChange,
    onStatusChange,
    onPriceMethodChange,
    onNoteChange,
}: OperationClusterHeaderFormProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-800">
                    Thông tin chứng từ
                </h2>

                <div
                    className={`px-3 py-1 rounded-full text-[11px] ${
                        form.status_id === 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                >
                    {form.status_id === 0 ? 'Đang sử dụng' : 'Không sử dụng'}
                </div>
            </div>

            <div className="grid grid-cols-6 gap-3">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mã chứng từ <span className="text-rose-500">*</span>
                    </label>

                    <input
                        value={form.document_code}
                        onChange={(event) =>
                            onDocumentCodeChange(event.target.value)
                        }
                        className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-yellow-50"
                        placeholder="VD: KCCD0001"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nhóm công việc <span className="text-rose-500">*</span>
                    </label>

                    <select
                        value={form.work_id}
                        onChange={(event) => onWorkIdChange(event.target.value)}
                        className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">
                            {worksLoading ? 'Đang tải...' : '-- Chọn --'}
                        </option>

                        {works
                            .filter((item) => item.statusId === 0)
                            .map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.workCode} - {item.workName}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Chủng loại hàng <span className="text-rose-500">*</span>
                    </label>

                    <select
                        value={form.product_category_id}
                        onChange={(event) =>
                            onProductCategoryIdChange(event.target.value)
                        }
                        className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">
                            {productCatesLoading ? 'Đang tải...' : '-- Chọn --'}
                        </option>

                        {productCates
                            .filter((item) => item.statusId === 0)
                            .map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.productCode} - {item.productName}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nhóm chủng loại <span className="text-rose-500">*</span>
                    </label>

                    <select
                        value={form.product_category_group_id}
                        onChange={(event) =>
                            onProductCategoryGroupIdChange(event.target.value)
                        }
                        className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="">
                            {productCateGroupsLoading ? 'Đang tải...' : '-- Chọn --'}
                        </option>

                        {productCateGroups
                            .filter((item) => item.statusId === 0)
                            .map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.cateGroupCode} - {item.cateGroupName}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        HS yêu cầu
                    </label>

                    <input
                        type="text"
                        inputMode="decimal"
                        value={form.required_efficiency}
                        onChange={(event) =>
                            onEfficiencyChange(event.target.value)
                        }
                        className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-right"
                        placeholder="0.8"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Trạng thái
                    </label>

                    <select
                        value={form.status_id}
                        onChange={(event) =>
                            onStatusChange(Number(event.target.value))
                        }
                        className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value={0}>Đang sử dụng</option>
                        <option value={1}>Không sử dụng</option>
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phương pháp tính đơn giá
                    </label>

                    <div className="h-8 flex items-center gap-4 text-xs text-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={form.price_method === 'GSD'}
                                onChange={() => onPriceMethodChange('GSD')}
                            />
                            Theo SMV gốc GSD
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                checked={form.price_method === 'ADJUSTED'}
                                onChange={() => onPriceMethodChange('ADJUSTED')}
                            />
                            Theo SMV điều chỉnh
                        </label>
                    </div>
                </div>

                <div className="col-span-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ghi chú
                    </label>

                    <input
                        value={form.note}
                        onChange={(event) => onNoteChange(event.target.value)}
                        className="w-full h-8 border border-slate-300 rounded-sm px-2 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="Nhập ghi chú nếu có"
                    />
                </div>
            </div>
        </div>
    );
}