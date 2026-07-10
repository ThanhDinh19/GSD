{
    isSavedDetailOpen && selectedDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-6">
            <div className="w-[1350px] max-w-[96vw] max-h-[95vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Chi tiết chứng từ
                        </h2>

                        <div className="text-sm text-slate-500 mt-1">
                            Mã chứng từ:{' '}
                            <span className="font-bold text-blue-700">
                                {selectedDetail.header?.document_code || '-'}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setIsSavedDetailOpen(false);
                            setSelectedDetail(null);
                        }}
                        className="w-9 h-9 rounded-full hover:bg-slate-100 text-slate-500 font-black"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-5 flex-1 min-h-0 overflow-hidden flex flex-col gap-4">
                    {/* Thông tin chung */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="border border-slate-200 rounded-sm p-3 bg-slate-50">
                            <div className="text-xs text-slate-500 font-bold uppercase">
                                Nhóm công việc
                            </div>
                            <div className="text-sm text-slate-800 mt-1">
                                {selectedDetail.header?.work_code || ''} - {selectedDetail.header?.work_name || ''}
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-sm p-3 bg-slate-50">
                            <div className="text-xs text-slate-500 font-bold uppercase">
                                Chủng loại
                            </div>
                            <div className="text-sm text-slate-800 mt-1">
                                {selectedDetail.header?.product_code || ''} - {selectedDetail.header?.product_name || ''}
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-sm p-3 bg-slate-50">
                            <div className="text-xs text-slate-500 font-bold uppercase">
                                Nhóm chủng loại
                            </div>
                            <div className="text-sm text-slate-800 mt-1">
                                {selectedDetail.header?.category_group_code || ''} - {selectedDetail.header?.category_group_name || ''}
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-sm p-3 bg-slate-50">
                            <div className="text-xs text-slate-500 font-bold uppercase">
                                Phương pháp tính
                            </div>
                            <div className="text-sm text-slate-800 mt-1">
                                {selectedDetail.header?.price_method === 'ADJUSTED'
                                    ? 'Theo SMV điều chỉnh'
                                    : 'Theo SMV gốc GSD'}
                            </div>
                        </div>
                    </div>

                    {/* Dashboard */}
                    <div className="grid grid-cols-6 gap-3">
                        <div className="border border-blue-100 bg-blue-50 rounded-sm p-3">
                            <div className="text-xs font-bold text-blue-600 uppercase">
                                SMV điều chỉnh
                            </div>
                            <div className="text-xl text-blue-700 mt-1">
                                {Number(selectedDetail.dashboard?.total_adjusted_sam || 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="border border-emerald-100 bg-emerald-50 rounded-sm p-3">
                            <div className="text-xs font-bold text-emerald-600 uppercase">
                                SMV
                            </div>
                            <div className="text-xl text-emerald-700 mt-1">
                                {Number(selectedDetail.dashboard?.total_sam_gsd || 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="border border-orange-100 bg-orange-50 rounded-sm p-3">
                            <div className="text-xs font-bold text-orange-600 uppercase">
                                Tổng bước
                            </div>
                            <div className="text-xl text-orange-700 mt-1">
                                {Number(selectedDetail.dashboard?.total_actions || 0)}
                            </div>
                        </div>

                        <div className="border border-amber-100 bg-amber-50 rounded-sm p-3">
                            <div className="text-xs font-bold text-amber-600 uppercase">
                                Tổng giây
                            </div>
                            <div className="text-xl text-amber-700 mt-1">
                                {Number(selectedDetail.dashboard?.total_action_seconds || 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="border border-violet-100 bg-violet-50 rounded-sm p-3">
                            <div className="text-xs font-bold text-violet-600 uppercase">
                                Định mức LĐ
                            </div>
                            <div className="text-xl text-violet-700 mt-1">
                                {Number(selectedDetail.dashboard?.total_manpower || 0).toFixed(2)}
                            </div>
                        </div>

                        <div className="border border-slate-200 bg-slate-50 rounded-sm p-3">
                            <div className="text-xs font-bold text-slate-600 uppercase">
                                Tổng đơn giá
                            </div>
                            <div className="text-xl text-slate-700 mt-1">
                                {Number(selectedDetail.dashboard?.total_standard_price || 0).toFixed(2)}
                            </div>
                        </div>
                    </div>


                    {/* Danh sách công đoạn */}
                    <div className="border border-slate-200 rounded-sm overflow-hidden flex flex-col flex-1 min-h-0">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                            <div className="text-sm font-bold text-slate-800">
                                Danh sách công đoạn
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-auto">
                            <table className="w-max min-w-[1300px] text-sm border-collapse">
                                <thead className="bg-white sticky top-0 z-10">
                                    <tr className="text-xs text-slate-500 uppercase">
                                        <th className="p-3 border border-slate-200 text-left w-[70px]">
                                            STT
                                        </th>
                                        <th className="p-3 border border-slate-200 text-center w-[100px]">
                                            Xếp chuyền
                                        </th>
                                        <th className="p-3 border border-slate-200 text-left w-[120px]">
                                            Cụm
                                        </th>
                                        {/* <th className="p-3 border border-slate-200 text-left w-[140px]">
                                                    Mã GSD
                                                </th> */}
                                        <th className="p-3 border border-slate-200 text-left w-[340px]">
                                            Công đoạn
                                        </th>
                                        <th className="p-3 border border-slate-200 text-left">
                                            Bậc
                                        </th>
                                        <th className="p-3 border border-slate-200 text-left w-[180px]">
                                            MMTB code
                                        </th>
                                        <th className="p-3 border border-slate-200 text-left w-[180px]">
                                            MMTB
                                        </th>
                                        <th className="p-3 border border-slate-200 text-right w-[100px]">
                                            SMV
                                        </th>
                                        <th className="p-3 border border-slate-200 text-right w-[100px]">
                                            Hệ số
                                        </th>
                                        <th className="p-3 border border-slate-200 text-right w-[120px]">
                                            Đơn giá
                                        </th>
                                        <th className="p-3 border border-slate-200 text-right w-[120px]">
                                            SMV ĐC
                                        </th>
                                        <th className="p-3 border border-slate-200 text-right w-[120px]">
                                            Hiệu suất sử dụng
                                        </th>
                                        <th className="p-3 border border-slate-200 text-center w-[100px]">
                                            Bước
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {(!selectedDetail.operations ||
                                        selectedDetail.operations.length === 0) && (
                                            <tr>
                                                <td
                                                    colSpan={13}
                                                    className="p-8 border border-slate-200 text-center text-slate-400"
                                                >
                                                    Chứng từ này chưa có công đoạn.
                                                </td>
                                            </tr>
                                        )}

                                    {(selectedDetail.operations || []).map((op: any, index: number) => (
                                        <tr
                                            key={op.id || index}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="p-3 border border-slate-200 text-slate-500">
                                                {index + 1}
                                            </td>

                                            <td className="p-3 border border-slate-200 text-center">
                                                {op.line_balance_no || '-'}
                                            </td>

                                            <td className="p-3 border border-slate-200">
                                                {op.cluster_name || `Cụm ${op.group_line_no || ''}`}
                                            </td>

                                            {/* <td className="p-3 border border-slate-200 text-blue-700">
                                                        {op.operation_code || '-'}
                                                    </td> */}

                                            <td className="p-3 border border-slate-200 text-slate-800">
                                                {op.operation_name || '-'}
                                            </td>

                                            <td className="p-3 border border-slate-200">
                                                {op.skill_level || '-'}
                                            </td>

                                            <td className="p-3 border border-slate-200">
                                                {op.machine_code || '-'}
                                            </td>

                                            <td className="p-3 border border-slate-200">
                                                {op.machine_name || '-'}
                                            </td>

                                            <td className="p-3 border border-slate-200 text-right">
                                                {Number(op.sam_gsd || 0).toFixed(2)}
                                            </td>

                                            <td className="p-3 border border-slate-200 text-right">
                                                {Number(op.salary_coefficient || 0).toFixed(2)}
                                            </td>

                                            <td className="p-3 border border-slate-200 text-right">
                                                {Number(op.standard_price || 0).toFixed(2)}
                                            </td>

                                            <td className="p-3 border border-slate-200 text-right text-blue-700">
                                                {Number(op.adjusted_sam || 0).toFixed(2)}
                                            </td>


                                            <td className="p-3 border border-slate-200 text-right text-blue-700">
                                                {(toNumber(op.utilization_rate, 0) * 100).toFixed(0)}%
                                            </td>

                                            <td className="p-3 border border-slate-200 text-center">
                                                {op.total_actions || 0}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSavedDetailOpen(false);
                                    setSelectedDetail(null);
                                }}
                                className="px-5 py-2 rounded-sm border border-slate-300 bg-white text-sm hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div> */}
            </div>
        </div>
    )
}
