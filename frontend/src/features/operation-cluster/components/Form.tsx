import {
    ComboBoxOption,
    ComboBox,
    RadioGroup,
    Button,
} from '../../../shared/components'

import { DanhSachCumCongDoan } from './DanhSachCumCongDoan';

import type {
    CreateOperationClusterPayload
} from '../types/operationCluster.type';

import type {
    Work,
    ProductCate,
    ProductCateGroup,
    MasterStatus,
} from '../../../types';


type FormProps = {
    form: CreateOperationClusterPayload;
    works: Work[];
    productCates: ProductCate[];
    productCateGroups: ProductCateGroup[];
    statuses: MasterStatus[];

    onUpdate: <K extends keyof CreateOperationClusterPayload>(
        key: K,
        value: CreateOperationClusterPayload[K]
    ) => void;

    onWorkChange: (
        value: string
    ) => void;

    onProductCateChange: (
        value: string
    ) => void;

    onProductCateGroupChange: (
        value: string
    ) => void;

    onStatusChange: (
        value: string,
    ) => void;

    onSave: () => void;
    onClose: () => void;
};

export function Form({
    form,
    works,
    productCates,
    productCateGroups,
    statuses,
    onUpdate,
    onWorkChange,
    onProductCateChange,
    onProductCateGroupChange,
    onStatusChange,
    onClose,
    onSave,
}: FormProps) {

    const workOptions:
        ComboBoxOption[] =
        works.map((item) => ({
            value: item.id,
            label: item.workName,
        }))

    const productCateOptions:
        ComboBoxOption[] =
        productCates.map((item) => ({
            value: item.id,
            label: item.productName
        }))


    const productCateGroupOptions:
        ComboBoxOption[] =
        productCateGroups.map((item) => ({
            value: item.id,
            label: item.cateGroupName
        }))

    const statusOptions:
        ComboBoxOption[] =
        statuses.map((item) => ({
            value: item.id,
            label: item.statusName
        }))



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex h-[92vh] w-[96vw] max-w-[1600px] flex-col rounded-sm bg-white shadow-xl">
                <div>Thông tin chứng từ
                    <div>
                        <label>Mã chứng từ</label>
                        <br />
                        <input
                            className="border"
                            type="text"
                            value={form.document_code}
                            onChange={(e) =>
                                onUpdate('document_code', e.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label>Nhóm công việc</label>
                        <ComboBox
                            value={form.work_id}
                            placeholder='-- Chọn nhóm việc --'
                            options={workOptions}
                            onValueChange={onWorkChange}
                        />
                    </div>

                    <div>
                        <label>Chủng loại hàng</label>
                        <ComboBox
                            value={form.product_category_id}
                            placeholder='-- Chọn chủng loại --'
                            options={productCateOptions}
                            onValueChange={onProductCateChange}

                        />
                    </div>

                    <div>
                        <label>Nhóm chủng loại hàng</label>
                        <ComboBox
                            value={form.product_category_group_id}
                            placeholder='-- Chọn nhóm chủng loại --'
                            options={productCateGroupOptions}
                            onValueChange={onProductCateGroupChange}
                        />
                    </div>

                    <div>
                        <label>Hệ số yêu cầu</label>
                        <br />
                        <input
                            className="border"
                            type="number"
                            value={Number(form.required_efficiency)}
                            onChange={(e) =>
                                onUpdate('required_efficiency', Number(e.target.value))
                            }
                        />
                    </div>

                    <RadioGroup<'GSD' | 'ADJUSTED'>
                        name="price_method"
                        label="Phương pháp tính"
                        value={form.price_method}
                        options={[
                            {
                                value: 'GSD',
                                label: 'GSD',
                                description: 'Tính theo thời gian GSD gốc',
                            },
                            {
                                value: 'ADJUSTED',
                                label: 'Điều chỉnh',
                                description: 'Tính theo SMV đã điều chỉnh',
                            },
                        ]}
                        onValueChange={(value) => onUpdate('price_method', value)}
                    />

                    <div>
                        <label>Trạng thái</label>
                        <ComboBox
                            value={form.status_id}
                            placeholder='-- Trạng thái --'
                            options={statusOptions}
                            onValueChange={onStatusChange}
                        />
                    </div>

                    <div>
                        <label>Ghi chú</label>
                        <input
                            className="border"
                            value={form.note}
                            onChange={(e) =>
                                onUpdate('note', e.target.value)
                            }
                        />
                    </div>
                </div>


                <div>
                    <div>
                        <div className="p-4">
                            <DanhSachCumCongDoan />
                        </div>
                    </div>
                </div>

                <div>
                    <button
                        type='button'
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>

                <div>
                    <button
                        type='button'
                        onClick={onSave}
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}

