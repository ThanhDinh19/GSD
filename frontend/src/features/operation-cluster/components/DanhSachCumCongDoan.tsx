import { useState } from 'react';
import type { MouseEvent } from 'react';

import type {
    Groups,
} from '../../operation-cluster/types/operationCluster.type';

type ContextMenuState = {
    x: number;
    y: number;
    groupIndex: number;
};

const thClass = 'p-3 border border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500';
const tdClass = 'p-3 border border-slate-200 text-sm text-slate-700';

export function DanhSachCumCongDoan() {
    const [groups, setGroups] = useState<Groups[]>([]);
    const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

    const handleChangeGroupName = (index: number, value: string) => {
        setGroups((previous) =>
            previous.map((group, groupIndex) =>
                groupIndex === index
                    ? { ...group, cluster_name: value }
                    : group
            )
        );
    };

    const handleAddGroup = () => {
        const newGroup: Groups = {
            line_no: groups.length + 1,
            cluster_name: '',
            operations: [],
        };

        setGroups((previous) => [...previous, newGroup]);
        setActiveGroupIndex(groups.length);
    };

    const handleOpenContextMenu = (
        event: MouseEvent<HTMLTableRowElement>,
        groupIndex: number
    ) => {
        event.preventDefault();

        setActiveGroupIndex(groupIndex);

        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            groupIndex,
        });
    };

    const handleInsertGroupBelow = () => {
        if (!contextMenu) return;

        const newGroup: Groups = {
            line_no: contextMenu.groupIndex + 2,
            cluster_name: '',
            operations: [],
        };

        setGroups((previous) => {
            const next = [...previous];

            next.splice(contextMenu.groupIndex + 1, 0, newGroup);

            return next.map((group, index) => ({
                ...group,
                line_no: index + 1,
            }));
        });

        setActiveGroupIndex(contextMenu.groupIndex + 1);
        setContextMenu(null);
    };

    const handleDeleteGroup = () => {
        if (!contextMenu) return;

        setGroups((previous) =>
            previous
                .filter((_, index) => index !== contextMenu.groupIndex)
                .map((group, index) => ({
                    ...group,
                    line_no: index + 1,
                }))
        );

        setActiveGroupIndex(null);
        setContextMenu(null);
    };

    return (
        <>
            <div className="flex h-[420px] min-h-0 flex-col overflow-hidden rounded-sm border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div>
                        <p className="text-sm font-bold text-slate-800">
                            Danh sách cụm công đoạn
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Nhấp chuột phải vào dòng để thao tác.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddGroup}
                        className="rounded-sm bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                        + Cụm
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <table className="w-full table-fixed border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50">
                            <tr>
                                <th className={`${thClass} w-[60px] text-center`}>
                                    STT
                                </th>

                                <th className={`${thClass} text-left`}>
                                    Tên cụm
                                </th>

                                <th className={`${thClass} w-[80px] text-right`}>
                                    Số CĐ
                                </th>

                                <th className={`${thClass} w-[90px] text-right`}>
                                    SMV
                                </th>

                                <th className={`${thClass} w-[90px] text-right`}>
                                    TGCN
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {groups.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 border border-slate-200 text-center text-slate-400">
                                        Chưa có cụm. Bấm “+ Cụm” để thêm dòng mới.
                                    </td>
                                </tr>
                            )}

                            {groups.map((group, index) => {
                                const isActive = activeGroupIndex === index;

                                const totalSamGsd = group.operations.reduce(
                                    (total, operation) =>
                                        total + Number(operation.sam_gsd || 0),
                                    0
                                );

                                return (
                                    <tr
                                        key={index}
                                        onClick={() => {
                                            setActiveGroupIndex(index)

                                        }
                                        }
                                        onContextMenu={(event) => handleOpenContextMenu(event, index)}
                                        className={`cursor-pointer transition-colors ${isActive
                                                ? 'bg-blue-50'
                                                : 'bg-white hover:bg-slate-50'
                                            }`}
                                    >
                                        <td className={`${tdClass} text-center text-slate-500`}>
                                            {group.line_no ?? index + 1}
                                        </td>

                                        <td className="p-2 border border-slate-200">
                                            <input
                                                value={group.cluster_name ?? ''}
                                                placeholder="Nhập tên cụm"
                                                onClick={(event) => event.stopPropagation()}
                                                onChange={(event) =>
                                                    handleChangeGroupName(index, event.target.value)
                                                }
                                                className="w-full rounded-sm border border-transparent bg-transparent px-2 py-1.5 text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                            />
                                        </td>

                                        <td className={`${tdClass} text-right tabular-nums`}>
                                            {group.operations.length}
                                        </td>

                                        <td className={`${tdClass} text-right tabular-nums`}>
                                            {totalSamGsd.toFixed(2)}
                                        </td>

                                        <td className={`${tdClass} text-right text-slate-400`}>
                                            -
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

               
            </div>

            {contextMenu && (
                <div
                    className="fixed inset-0 z-50"
                    onClick={() => setContextMenu(null)}
                    onContextMenu={(event) => event.preventDefault()}
                >
                    <div
                        className="absolute w-[220px] overflow-hidden rounded-sm border border-slate-200 bg-white py-1 shadow-xl"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={handleInsertGroupBelow}
                            className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                        >
                            Chèn dòng bên dưới
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteGroup}
                            className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                        >
                            Xóa dòng này
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}