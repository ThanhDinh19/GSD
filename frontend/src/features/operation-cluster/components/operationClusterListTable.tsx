import type {
    OperationClusterHeader
} from '../types/operationCluster.type';

import {
    formatNumber
} from '../../../shared/utils/formatters';

type OperationClusterListTableProps = {
    items: OperationClusterHeader[];
    // selectedId: number | null;
    // onSelect: (id: number) => void;
    onOpenDetail: (id: number) => void;
};

export function OperationClusterListTable({
    items,
    // selectedId,
    // onSelect,
    onOpenDetail
}: OperationClusterListTableProps) {
    return (
        
        <div className="h-[630px] overflow-auto border border-slate-200 rounded-sm">
            <table className="w-full text-sm min-w-[1100px] border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr className="text-xs text-slate-500 uppercase">
                        <th className="border border-slate-200 px-3 py-2 text-center">
                            STT
                        </th>
                        <th className="border border-slate-200 px-3 py-2 text-left">
                            Mã chứng từ
                        </th>
                        <th className="border border-slate-200 px-3 py-2 text-center">
                            Nhóm công việc
                        </th>
                        <th className="border border-slate-200 px-3 py-2 text-left">
                            Chủng loại
                        </th>
                        <th className="border border-slate-200 px-3 py-2 text-left">
                            Nhóm chủng loại
                        </th>
                        <th className="border border-slate-200 px-3 py-2 text-left">
                            SMV
                        </th>
                        <th className="border border-slate-200 px-3 py-2 text-right">
                            SMV ĐC
                        </th>
                        <th className="border border-slate-200 px-3 py-2 text-right">
                            Trạng thái
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {items.length === 0 && (
                        <tr>
                            <td
                                colSpan={10}
                                className="border border-slate-200 px-4 py-6 text-center text-slate-400"
                            >
                                Chưa có chứng từ kho cụm công đoạn.
                            </td>
                        </tr>
                    )}

                    {items.map((item, index) => {
                        // const isSelected =
                        //     selectedId === item.id;

                        return (
                            <tr
                                key={item.id}
                                // onClick={() =>
                                //     onSelect(item.id)
                                // }
                                // className={`
                                // cursor-pointer
                                // ${isSelected
                                //     ? 'bg-blue-50'
                                //     : 'hover:bg-slate-50'
                                //                 }
                                // `}
                            >
                                <td className="border border-slate-200 px-3 py-2 text-center text-blue-700">
                                    {index + 1}
                                </td>

                                <td className="border border-slate-200 px-3 py-2 text-blue-700">
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onOpenDetail(item.id);
                                        }}
                                        className="text-blue-700 hover:underline"
                                    >
                                        {item.document_code}
                                    </button>
                                </td>

                                <td className="border border-slate-200 px-3 py-2">
                                    {item.work_name}
                                </td>

                                <td className="border border-slate-200 px-3 py-2">
                                    {item.product_name}
                                </td>

                                <td className="border border-slate-200 px-3 py-2">
                                    {item.category_group_name}
                                </td>

                                <td className="border border-slate-200 px-3 py-2 text-right">
                                    {item.total_sam_gsd}
                                </td>

                                <td className="border border-slate-200 px-3 py-2 text-right">
                                    {formatNumber(
                                        item.total_adjusted_sam,
                                        2
                                    )}
                                </td>

                                <td className="border border-slate-200 px-3 py-2 text-right">
                                    {item.status_name}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}