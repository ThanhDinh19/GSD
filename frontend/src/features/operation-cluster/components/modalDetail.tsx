import { useState } from 'react';
import type {
    Dashboard,
    OperationClusterHeader,
    Operations,
} from '../types/operationCluster.type';

import { SummaryBox } from '../../../shared/components';
import { TitleText } from '../../../shared/components';
import { toNumber } from '../../../shared/utils/formatters';
import { getImageUrl } from '../../../shared/utils/getImageUrl';
import { ImagePreviewModal } from '../../../shared/components/ImagePreviewModal';
import { Button } from '../../../shared/components';

type ModalDetailProps = {
    dashboard?: Dashboard | null;
    header?: OperationClusterHeader | null;
    operations?: Operations[] | null;
    onClose: () => void;
};

export function ModalDetail({
    dashboard,
    header,
    operations,
    onClose,
}: ModalDetailProps) {

    const [previewImageUrl, setPreviewImageUrl] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="flex h-[92vh] w-[96vw] max-w-[1600px] flex-col overflow-hidden rounded-md bg-white shadow-xl">

                <div className="grid shrink-0 grid-cols-1 gap-3 px-5 pt-5 text-xs sm:grid-cols-2 xl:grid-cols-4">
                    <TitleText
                        title="Nhóm công việc"
                        text={header?.work_name}
                    />

                    <TitleText
                        title="Chủng loại"
                        text={header?.product_name}
                    />

                    <TitleText
                        title="Nhóm chủng loại"
                        text={header?.category_group_name}
                    />

                    <TitleText
                        title="Phương pháp tính"
                        text={header?.price_method}
                    />
                </div>

                <div className="grid shrink-0 grid-cols-1 gap-3 px-5 pt-3 text-xs sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                    <SummaryBox
                        label="Tổng SMV điều chỉnh"
                        value={dashboard?.total_adjusted_sam}
                    />

                    <SummaryBox
                        label="Tổng SMV"
                        value={dashboard?.total_sam_gsd}
                    />

                    <SummaryBox
                        label="Tổng thao tác"
                        value={dashboard?.total_actions}
                    />

                    <SummaryBox
                        label="Tổng giây thao tác"
                        value={dashboard?.total_action_seconds}
                    />

                    <SummaryBox
                        label="Hệ số điều chỉnh SMV"
                        formula="Tổng thời gian / Tổng SMV GSD gốc"
                        value={dashboard?.total_manpower}
                    />

                    <SummaryBox
                        label="Tổng đơn giá"
                        value={dashboard?.total_standard_price}
                    />
                </div>

                <div className="mx-5 my-4 min-h-0 flex-1 overflow-auto rounded-md border border-slate-200 bg-white">
                    <table className="w-full text-sm min-w-[1100px] border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr className="text-xs text-slate-500 uppercase">
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-left w-[70px]">
                                    STT
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-center w-[100px]">
                                    Xếp chuyền
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-left w-[120px]">
                                    Cụm
                                </th>

                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-left w-[340px]">
                                    Công đoạn
                                </th>

                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-left w-[30px]">
                                    Hình ảnh
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-left">
                                    Bậc
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-left w-[180px]">
                                    MMTB code
                                </th>
                                <th className="p-3 border border-slate-p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500200 text-left w-[180px]">
                                    MMTB
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-right w-[100px]">
                                    SMV
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-right w-[100px]">
                                    Hệ số lương
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-right w-[100px]">
                                    Hệ số yêu cầu
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-right w-[120px]">
                                    Đơn giá
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-right w-[120px]">
                                    SMV ĐC
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-right w-[120px]">
                                    Hiệu suất sử dụng
                                </th>
                                <th className="p-3 border border-slate-200 bg-slate-100 text-xs font-semibold uppercase text-slate-500 text-center w-[100px]">
                                    Bước
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {operations?.length == 0 && (
                                <tr>
                                    <td
                                        colSpan={15}
                                        className="border border-slate-200 px-4 py-6 text-center text-slate-400"
                                    >
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}

                            {operations?.map((item, index) => {
                                const imageFileName = item.image_file_name || item.image_url || ''
                                const imageSrc = getImageUrl(imageFileName, 'gsd_analysis_images');

                                return (
                                    <tr key={item.id} className="bg-white transition-colors hover:bg-slate-50">
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-center font-medium text-blue-700">
                                            {index + 1}
                                        </td>
                                        <td className=" px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-center">
                                            {item.line_balance_no}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-left">
                                            {item.cluster_name}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-left font-medium text-slate-800">
                                            {item.operation_name}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-center">
                                            {imageSrc ? (
                                                <button
                                                    type='button'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImageUrl(imageSrc)
                                                    }}
                                                >
                                                    <img
                                                        src={imageSrc}
                                                        alt="Hình ảnh"
                                                    />
                                                </button>
                                            ) : (<span className="text-slate-400">-</span>)}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-center">
                                            {item.skill_level}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-left">
                                            {item.code_mmtb}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-left">
                                            {item.machine_name}
                                        </td>
                                        <td className=" px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-right tabular-nums">
                                            {Number(item.sam_gsd || 0).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-right tabular-nums">
                                            {Number(item.salary_coefficient || 0).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-right tabular-nums">
                                            {Number(item.required_efficiency || 0).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-right font-semibold text-emerald-700 tabular-nums">
                                            {Number(item.standard_price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-right font-semibold text-blue-700 tabular-nums">
                                            {Number(item.adjusted_sam || 0).toFixed(2)}
                                        </td>
                                        <td className=" px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middletext-right tabular-nums">
                                            {(toNumber(item.utilization_rate, 0) * 100).toFixed(0)}%
                                        </td>
                                        <td className="px-3 py-2 border border-slate-200 text-sm text-slate-700 align-middle text-center tabular-nums">
                                            {item.total_actions || 0}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4">
                    <Button onClick={onClose}>
                        Đóng
                    </Button>
                </div>

                {previewImageUrl && (
                    <ImagePreviewModal
                        imageUrl={previewImageUrl}
                        onClose={() => setPreviewImageUrl('')}
                    />
                )}
            </div>
        </div>
    );
}
