import type {
    OperationClusterHeader,
} from '../../../types';

type OperationClusterListTableProps = {
    items: OperationClusterHeader[];
    loading: boolean;
    selectedId: number | null;

    onSelect: (id: number) => void;
    onView: (id: number) => void;
};

export default function OperationClusterListTable({
    items,
    loading,
    selectedId,
    onSelect,
    onView,
}: OperationClusterListTableProps) {
    return (
        <div className="h-[630px] overflow-auto border border-slate-200 rounded-sm">
            <table className="w-full text-sm min-w-[1100px] border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr className="text-xs text-slate-500 uppercase">
                        <th className="p-3 border border-slate-200 text-left w-[20px]">
                            STT
                        </th>

                        <th className="p-3 border border-slate-200 text-left w-[115px]">
                            Mã chứng từ
                        </th>

                        <th className="p-3 border border-slate-200 text-left">
                            Nhóm công việc
                        </th>

                        <th className="p-3 border border-slate-200 text-left">
                            Chủng loại
                        </th>

                        <th className="p-3 border border-slate-200 text-left">
                            Nhóm chủng loại
                        </th>

                        <th className="p-3 border border-slate-200 text-right w-[100px]">
                            SMV
                        </th>

                        <th className="p-3 border border-slate-200 text-right w-[100px]">
                            SMV ĐC
                        </th>

                        <th className="p-3 border border-slate-200 text-center w-[140px]">
                            Trạng thái
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {loading && (
                        <tr>
                            <td
                                colSpan={8}
                                className="p-8 border border-slate-200 text-center text-slate-400"
                            >
                                Đang tải danh sách chứng từ...
                            </td>
                        </tr>
                    )}

                    {!loading && items.length === 0 && (
                        <tr>
                            <td
                                colSpan={8}
                                className="p-8 border border-slate-200 text-center text-slate-400"
                            >
                                Chưa có chứng từ nào được lưu.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        items.map((item, index) => {
                            const isSelected = selectedId === item.id;

                            return (
                                <tr
                                    key={item.id}
                                    onClick={() => onSelect(item.id)}
                                    className={`cursor-pointer hover:bg-blue-100 ${
                                        isSelected ? 'bg-blue-100' : ''
                                    }`}
                                >
                                    <td className="p-3 border border-slate-200 text-slate-500">
                                        {index + 1}
                                    </td>

                                    <td className="p-3 border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onSelect(item.id);
                                                onView(item.id);
                                            }}
                                            className="text-blue-700 hover:underline"
                                        >
                                            {item.document_code}
                                        </button>
                                    </td>

                                    <td className="p-3 border border-slate-200">
                                        {item.work_code && item.work_name
                                            ? item.work_name
                                            : item.work_id}
                                    </td>

                                    <td className="p-3 border border-slate-200">
                                        {item.product_name}
                                    </td>

                                    <td className="p-3 border border-slate-200">
                                        {item.category_group_name}
                                    </td>

                                    <td className="p-3 border border-slate-200 text-right font-bold">
                                        {Number(item.total_sam_gsd || 0).toFixed(2)}
                                    </td>

                                    <td className="p-3 border border-slate-200 text-right text-blue-700">
                                        {Number(item.total_adjusted_sam || 0).toFixed(2)}
                                    </td>

                                    <td className="p-3 border border-slate-200 text-center">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                item.status_id === 0
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}
                                        >
                                            {item.status_id === 0
                                                ? 'Đang sử dụng'
                                                : 'Không sử dụng'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}