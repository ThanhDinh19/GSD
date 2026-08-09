import type {
    SalaryCoefficient,
} from '../../../types';

type SalaryCoefficientModalProps = {
    open: boolean;
    search: string;
    loading: boolean;
    items: SalaryCoefficient[];
    getSkillLevelText: (
        levelId: number | null | undefined
    ) => string | number;
    onSearchChange: (value: string) => void;
    onSelect: (
        coefficient: number,
        skillGradeId: number
    ) => void;
    onClose: () => void;
};

export default function SalaryCoefficientModal({
    open,
    search,
    loading,
    items,
    getSkillLevelText,
    onSearchChange,
    onSelect,
    onClose,
}: SalaryCoefficientModalProps) {
    if (!open) return null;

    const keyword = search.trim().toLowerCase();

    const activeItems = items.filter(
        (item) => item.statusId === 0
    );

    const filteredItems = activeItems.filter((item) => {
        if (!keyword) return true;

        const levelText = String(
            getSkillLevelText(item.levelId)
        ).toLowerCase();

        const coefficientText = String(
            item.coefficient
        ).toLowerCase();

        return (
            levelText.includes(keyword) ||
            coefficientText.includes(keyword)
        );
    });

    return (
        <div
            className="fixed inset-0 z-[100] bg-slate-900/20 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-[420px] max-w-[92vw] bg-white border border-slate-200 rounded-sm shadow-2xl overflow-hidden"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-100">
                    <div className="font-bold text-slate-800">
                        Chọn hệ số lương
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                        Chọn hệ số từ danh mục hệ số tính lương.
                    </div>

                    <input
                        value={search}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        className="w-full mt-3 border border-slate-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="Tìm theo level hoặc hệ số..."
                        autoFocus
                    />
                </div>

                <div className="max-h-[320px] overflow-auto p-2">
                    {loading && (
                        <div className="p-4 text-sm text-slate-500">
                            Đang tải danh mục hệ số...
                        </div>
                    )}

                    {!loading &&
                        filteredItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() =>
                                    onSelect(
                                        Number(item.coefficient || 0),
                                        Number(item.levelId || 0)
                                    )
                                }
                                className="w-full text-left p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-sm text-slate-800">
                                            Bậc thợ:{' '}
                                            {getSkillLevelText(
                                                item.levelId
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-lg text-blue-700">
                                        {Number(
                                            item.coefficient || 0
                                        ).toFixed(2)}
                                    </div>
                                </div>
                            </button>
                        ))}

                    {!loading && activeItems.length === 0 && (
                        <div className="p-4 text-sm text-slate-500">
                            Chưa có hệ số lương đang sử dụng.
                        </div>
                    )}

                    {!loading &&
                        activeItems.length > 0 &&
                        filteredItems.length === 0 && (
                            <div className="p-4 text-sm text-slate-500">
                                Không tìm thấy hệ số phù hợp.
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}