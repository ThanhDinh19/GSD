import type {
    OperationClusterGroupPayload,
} from '../../../types';

type GroupContextMenuState = {
    x: number;
    y: number;
    groupIndex: number;
} | null;

type EnrichedGroup = OperationClusterGroupPayload & {
    tgcn: number;
};

type OperationClusterGroupPanelProps = {
    groups: EnrichedGroup[];
    activeGroupIndex: number;
    viewAllGroups: boolean;
    contextMenu: GroupContextMenuState;

    onAddGroup: () => void;
    onSelectGroup: (groupIndex: number) => void;
    onOpenContextMenu: (
        event: React.MouseEvent,
        groupIndex: number
    ) => void;
    onCloseContextMenu: () => void;
    onInsertGroupBelow: (groupIndex: number) => void;
    onDeleteGroup: (groupIndex: number) => void;
    onChangeGroupName: (
        groupIndex: number,
        value: string
    ) => void;
};

function toNumber(
    value: unknown,
    defaultValue = 0
) {
    const num = Number(value);
    return Number.isFinite(num)
        ? num
        : defaultValue;
}

export default function OperationClusterGroupPanel({
    groups,
    activeGroupIndex,
    viewAllGroups,
    contextMenu,
    onAddGroup,
    onSelectGroup,
    onOpenContextMenu,
    onCloseContextMenu,
    onInsertGroupBelow,
    onDeleteGroup,
    onChangeGroupName,
}: OperationClusterGroupPanelProps) {
    return (
        <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-3 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h2 className="text-base font-bold text-slate-800">
                        Danh sách cụm công đoạn
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onAddGroup}
                    className="px-3 py-2 rounded-sm bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                    + Cụm
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar-y border border-slate-200 rounded-sm">
                <table className="w-full table-fixed text-sm border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr className="text-xs text-slate-500 uppercase">
                            <th className="p-3 border border-slate-200 text-center w-[40px]">
                                STT
                            </th>

                            <th className="p-3 border border-slate-200 text-left">
                                Tên cụm
                            </th>

                            <th className="p-3 border border-slate-200 text-right w-[40px]">
                                Số CĐ
                            </th>

                            <th className="p-3 border border-slate-200 text-right w-[80px]">
                                SMV
                            </th>

                            <th className="p-3 border border-slate-200 text-right w-[80px]">
                                TGCN
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {groups.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="p-8 border border-slate-200 text-center text-slate-400"
                                >
                                    Chưa có cụm. Bấm “+ Cụm” để thêm dòng mới.
                                </td>
                            </tr>
                        )}

                        {groups.map((group, index) => {
                            const isActive =
                                activeGroupIndex === index &&
                                !viewAllGroups;

                            const totalSamGsd =
                                group.operations.reduce(
                                    (sum, operation) =>
                                        sum +
                                        toNumber(
                                            operation.sam_gsd,
                                            0
                                        ),
                                    0
                                );

                            return (
                                <tr
                                    key={index}
                                    onClick={() =>
                                        onSelectGroup(index)
                                    }
                                    onContextMenu={(event) =>
                                        onOpenContextMenu(
                                            event,
                                            index
                                        )
                                    }
                                    className={`cursor-pointer ${
                                        isActive
                                            ? 'bg-blue-50'
                                            : 'hover:bg-slate-50'
                                    }`}
                                >
                                    <td className="p-3 border border-slate-200 text-center text-slate-500">
                                        {index + 1}
                                    </td>

                                    <td className="p-2 border border-slate-200">
                                        <input
                                            value={
                                                group.cluster_name
                                            }
                                            onChange={(event) =>
                                                onChangeGroupName(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                            className="w-full border border-transparent rounded-lg px-2 py-1 outline-none bg-transparent text-slate-400 focus:bg-white focus:border-blue-300"
                                            placeholder="Nhập tên cụm"
                                        />
                                    </td>

                                    <td className="p-3 border border-slate-200 text-right text-slate-700">
                                        {
                                            group.operations
                                                .length
                                        }
                                    </td>

                                    <td className="p-3 border border-slate-200 text-right text-slate-700">
                                        {totalSamGsd.toFixed(
                                            2
                                        )}
                                    </td>

                                    <td className="p-3 border border-slate-200 text-right text-blue-700">
                                        {Number(
                                            group.tgcn || 0
                                        ).toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {contextMenu && (
                <div
                    className="fixed inset-0 z-50"
                    onClick={onCloseContextMenu}
                >
                    <div
                        className="absolute w-[220px] bg-white border border-slate-200 rounded-sm shadow-xl overflow-hidden"
                        style={{
                            top: contextMenu.y,
                            left: contextMenu.x,
                        }}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <button
                            type="button"
                            onClick={() =>
                                onInsertGroupBelow(
                                    contextMenu.groupIndex
                                )
                            }
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50"
                        >
                            - Chèn dòng bên dưới
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                onDeleteGroup(
                                    contextMenu.groupIndex
                                )
                            }
                            className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50"
                        >
                            - Xóa dòng này
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}