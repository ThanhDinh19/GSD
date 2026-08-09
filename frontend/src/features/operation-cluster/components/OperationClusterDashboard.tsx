type OperationClusterDashboardData = {
    totalAdjustedSam: number;
    totalSamGsd: number;
    totalActions: number;
    totalActionSeconds: number;
    totalManpower: number;
    avgTgcn: number;
};

type OperationClusterDashboardProps = {
    data: OperationClusterDashboardData;
};

export default function OperationClusterDashboard({
    data,
}: OperationClusterDashboardProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-800">
                    Thông tin tổng quan
                </h2>

                <div className="text-[11px] text-slate-400">
                    Tính realtime từ danh sách công đoạn đã chọn
                </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
                <div className="rounded-sm border border-blue-100 bg-blue-50 px-3 py-2">
                    <div className="text-[11px] font-bold text-blue-500 uppercase">
                        Tổng SMV điều chỉnh
                    </div>
                    <div className="text-xl text-blue-700 mt-1">
                        {data.totalAdjustedSam.toFixed(2)}
                    </div>
                </div>

                <div className="rounded-sm border border-emerald-100 bg-emerald-50 px-3 py-2">
                    <div className="text-[11px] font-bold text-emerald-500 uppercase">
                        Tổng SMV
                    </div>
                    <div className="text-xl text-emerald-700 mt-1">
                        {data.totalSamGsd.toFixed(2)}
                    </div>
                </div>

                <div className="rounded-sm border border-orange-100 bg-orange-50 px-3 py-2">
                    <div className="text-[11px] font-bold text-orange-500 uppercase">
                        Tổng bước GSD
                    </div>
                    <div className="text-xl text-orange-700 mt-1">
                        {data.totalActions}
                    </div>
                </div>

                <div className="rounded-sm border border-amber-100 bg-amber-50 px-3 py-2">
                    <div className="text-[11px] font-bold text-amber-500 uppercase">
                        Tổng giây GSD
                    </div>
                    <div className="text-xl text-amber-700 mt-1">
                        {data.totalActionSeconds.toFixed(2)}
                    </div>
                </div>

                <div className="rounded-sm border border-violet-100 bg-violet-50 px-3 py-2">
                    <div className="text-[11px] font-bold text-violet-500 uppercase">
                        Định mức lao động
                    </div>
                    <div className="text-xl text-violet-700 mt-1">
                        {data.totalManpower.toFixed(2)}
                    </div>
                </div>

                <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                        TB TGCN / Cụm
                    </div>
                    <div className="text-xl text-slate-700 mt-1">
                        {data.avgTgcn.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}