import { useEffect, useMemo, useState } from 'react';
import { DepartmentNode_test } from '../types';
import { useOrganizationChart_test } from '../hooks/useOrganizationChart_test';

type ContextMenuState = {
    x: number;
    y: number;
    node: DepartmentNode_test;
} | null;

type CreateMode = 'child' | 'sibling' | null;

type FormMode = 'view' | 'create-child' | 'create-sibling' | 'edit';

type DepartmentFormState = {
    department_name: string;
    manager_employee_id: string;
    parent_department_code: string;
    department_type_code: string;
    status_id: number;
};

function DepartmentTreeNode({
    node,
    level = 0,
    selectedId,
    onSelect,
    onOpenContextMenu,
}: {
    node: DepartmentNode_test;
    level?: number;
    selectedId?: string;
    onSelect: (node: DepartmentNode_test) => void;
    onOpenContextMenu: (event: React.MouseEvent, node: DepartmentNode_test) => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.department_code;
    const isInactive = node.status_id === 1;

    return (
        <div>
            <div
                onClick={() => onSelect(node)}
                onContextMenu={(event) => onOpenContextMenu(event, node)}
                className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm cursor-pointer border ${isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold'
                    : 'border-transparent hover:bg-slate-50 text-slate-700'
                    } ${isInactive ? 'opacity-60' : ''}`}
                style={{ paddingLeft: 8 + level * 18 }}
            >
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) setExpanded((prev) => !prev);
                    }}
                    className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                    {hasChildren ? (expanded ? '▾' : '▸') : '•'}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="truncate">
                        {node.department_name}
                        {isInactive && (
                            <span className="ml-2 text-[10px] font-bold text-rose-500">
                                Đã giải thể
                            </span>
                        )}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate font-normal">
                        {node.department_type_name || node.department_type_code}
                    </div>
                </div>
            </div>

            {expanded && hasChildren && (
                <div className="mt-1 space-y-1">
                    {node.children.map((child) => (
                        <DepartmentTreeNode
                            key={child.department_code}
                            node={child}
                            level={level + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                            onOpenContextMenu={onOpenContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function OrganizationChartPage() {
    const {
        employees,
        departmentTypes,
        tree,
        selectedDepartment,
        setSelectedDepartment,
        includeInactive,
        toggleIncludeInactive,
        loading,
        createDepartment,
        updateDepartment,
        dissolveDepartment,
    } = useOrganizationChart_test();

    const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
    const [createMode, setCreateMode] = useState<CreateMode>(null);
    const [draftParentDepartment, setDraftParentDepartment] = useState<DepartmentNode_test | null>(null);
    const [draftSameLevelDepartment, setDraftSameLevelDepartment] = useState<DepartmentNode_test | null>(null);
    const handleOpenContextMenu = (
        event: React.MouseEvent,
        node: DepartmentNode_test
    ) => {
        event.preventDefault();

        setSelectedDepartment(node);

        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            node,
        });
    };

    const handleAddChild = (node: DepartmentNode_test) => {
        setFormMode('create-child');
        setSelectedDepartment(node);
        setContextMenu(null);

        setForm({
            department_name: '',
            manager_employee_id: '',
            parent_department_code: node.department_code,
            department_type_code: '',
            status_id: 0,
        });
    };

    const handleAddSibling = (node: DepartmentNode_test) => {
        setFormMode('create-sibling');
        setSelectedDepartment(node);
        setContextMenu(null);

        setForm({
            department_name: '',
            manager_employee_id: '',
            parent_department_code: node.parent_department_code || '',
            department_type_code: node.department_type_code,
            status_id: 0,
        });
    };
    
    const handleCreateRoot = () => {
        setFormMode('create-child');
        setSelectedDepartment(null);

        setForm({
            department_name: '',
            manager_employee_id: '',
            parent_department_code: '',
            department_type_code: '',
            status_id: 0,
        });
    };

    const handleSaveDepartment = async () => {
        if (!form.department_name.trim()) {
            alert('Vui lòng nhập tên phòng ban');
            return;
        }

        if (!form.department_type_code) {
            alert('Vui lòng chọn loại phòng ban');
            return;
        }

        const payload = {
            department_name: form.department_name.trim(),
            manager_employee_id: form.manager_employee_id || null,
            parent_department_code: form.parent_department_code || null,
            department_type_code: form.department_type_code,
            status_id: form.status_id,
        };

        if (formMode === 'edit' && selectedDepartment) {
            await updateDepartment(selectedDepartment.department_code, payload);
        } else {
            await createDepartment(payload);
        }

        setFormMode('view');
    };

    const handleEditDepartment = () => {
        if (!selectedDepartment) return;

        setFormMode('edit');

        setForm({
            department_name: selectedDepartment.department_name || '',
            manager_employee_id: selectedDepartment.manager_employee_id || '',
            parent_department_code: selectedDepartment.parent_department_code || '',
            department_type_code: selectedDepartment.department_type_code || '',
            status_id: selectedDepartment.status_id ?? 0,
        });
    };

    const handleDissolveDepartment = async () => {
        if (!selectedDepartment) return;

        const ok = window.confirm(
            `Bạn có chắc muốn giải thể phòng ban "${selectedDepartment.department_name}" không?`
        );

        if (!ok) return;

        await dissolveDepartment(selectedDepartment.department_code);
        setFormMode('view');
    };


    const [formMode, setFormMode] = useState<FormMode>('view');

    const [form, setForm] = useState<DepartmentFormState>({
        department_name: '',
        manager_employee_id: '',
        parent_department_code: '',
        department_type_code: '',
        status_id: 0,
    });

    useEffect(() => {
        const closeMenu = () => setContextMenu(null);

        window.addEventListener('click', closeMenu);
        window.addEventListener('scroll', closeMenu);

        return () => {
            window.removeEventListener('click', closeMenu);
            window.removeEventListener('scroll', closeMenu);
        };
    }, []);
    return (
        <div className="h-full flex flex-col gap-4">
            {/* <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h1 className="text-xl font-bold text-slate-800">
                    Sơ đồ tổ chức
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Quản lý cây phòng ban, loại phòng ban, trưởng phòng và trạng thái giải thể.
                </p>
            </div> */}

            <div className="grid grid-cols-[360px_1fr] gap-4 flex-1 min-h-0">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-3 gap-3">
                        <h2 className="font-bold text-slate-700">Cây sơ đồ tổ chức</h2>

                        <button
                            type="button"
                            onClick={handleCreateRoot}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                        >
                            + Tạo mới
                        </button>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-slate-600 mb-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeInactive}
                            onChange={(e) => toggleIncludeInactive(e.target.checked)}
                        />
                        Hiển thị phòng ban giải thể
                    </label>

                    <div className="flex-1 min-h-0 overflow-auto border border-slate-100 rounded-lg p-2">
                        {loading && (
                            <div className="text-sm text-slate-500 p-3">
                                Đang tải cây phòng ban...
                            </div>
                        )}

                        {!loading && tree.length === 0 && (
                            <div className="text-sm text-slate-500 p-3">
                                Chưa có dữ liệu cây phòng ban.
                            </div>
                        )}

                        {!loading && tree.length > 0 && (
                            <div className="space-y-1">
                                {tree.map((node) => (
                                    <DepartmentTreeNode
                                        key={node.department_code}
                                        node={node}
                                        selectedId={selectedDepartment?.department_code}
                                        onSelect={setSelectedDepartment}
                                        onOpenContextMenu={handleOpenContextMenu}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-h-[600px]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-slate-700">
                            {formMode === 'view' ? 'Thông tin phòng ban' : 'Nhập thông tin phòng ban'}
                        </h2>
{/* 
                        {formMode !== 'view' && (
                            <button
                                type="button"
                                onClick={() => setFormMode('view')}
                                className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                            >
                                Hủy
                            </button>
                        )} */}
                    </div>

                    {formMode !== 'view' ? (
                        <div className="space-y-4">
                            {formMode === 'create-child' && form.parent_department_code && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                                    Đang thêm vị trí cấp con.
                                </div>
                            )}

                            {formMode === 'create-sibling' && selectedDepartment && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                    Đang thêm vị trí cùng cấp với: <b>{selectedDepartment.department_name}</b>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Tên phòng ban <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    value={form.department_name}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, department_name: e.target.value }))
                                    }
                                    className="w-[400px] border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                    placeholder="Nhập tên phòng ban"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Người quản lý
                                </label>
                                <select
                                    value={form.manager_employee_id}
                                    onChange={(e) =>
                                        setForm((prev) => ({ ...prev, manager_employee_id: e.target.value }))
                                    }
                                    className="w-[400px] border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                >
                                    <option value="">-- Chọn trưởng phòng --</option>
                                    {employees.map((employee) => (
                                        <option key={employee.employee_id} value={employee.employee_id}>
                                            {employee.name || employee.employee_id}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Phòng ban cha
                                </label>
                                <input
                                    value={form.parent_department_code || 'Không có - cấp gốc'}
                                    disabled
                                    className="w-[400px] border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Loại phòng ban <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.department_type_code}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            department_type_code: e.target.value,
                                        }))
                                    }
                                    className="w-[400px] border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                                >
                                    <option value="">-- Chọn loại phòng ban --</option>
                                    {departmentTypes
                                        .filter((item) => item.statusId === 0)
                                        .map((item) => (
                                            <option
                                                key={item.departmentTypeCode}
                                                value={item.departmentTypeCode}
                                            >
                                                {item.departmentTypeName}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.status_id === 1}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            status_id: e.target.checked ? 1 : 0,
                                        }))
                                    }
                                />
                                Giải thể phòng ban
                            </label>

                            <div className="pt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSaveDepartment}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
                                >
                                    Lưu
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormMode('view')}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    ) : !selectedDepartment ? (
                        <div className="text-sm text-slate-500">
                            Chọn một phòng ban bên trái để xem hoặc chỉnh sửa thông tin.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">
                                    Mã phòng ban
                                </div>
                                <div className="text-sm font-semibold text-slate-800">
                                    {selectedDepartment.department_code}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">
                                    Tên phòng ban
                                </div>
                                <div className="text-sm font-semibold text-slate-800">
                                    {selectedDepartment.department_name}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">
                                    Loại phòng ban
                                </div>
                                <div className="text-sm text-slate-700">
                                    {selectedDepartment.department_type_name ||
                                        selectedDepartment.department_type_code}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">
                                    Trưởng phòng
                                </div>
                                <div className="text-sm text-slate-700">
                                    {selectedDepartment.manager_name || 'Chưa khai báo'}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase">
                                    Trạng thái
                                </div>
                                <div
                                    className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${selectedDepartment.status_id === 0
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-rose-50 text-rose-700'
                                        }`}
                                >
                                    {selectedDepartment.status_id === 0 ? 'Còn sử dụng' : 'Đã giải thể'}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleEditDepartment}
                                    className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-bold hover:bg-slate-900"
                                >
                                    Chỉnh sửa
                                </button>

                                {selectedDepartment.status_id === 0 && (
                                    <button
                                        type="button"
                                        onClick={handleDissolveDepartment}
                                        className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-bold hover:bg-rose-700"
                                    >
                                        Giải thể phòng ban
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {createMode === 'child' && draftParentDepartment && (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
                    <div className="font-bold text-blue-700">
                        Đang thêm vị trí cấp con
                    </div>
                    <div className="text-slate-600 mt-1">
                        Phòng ban cha: <b>{draftParentDepartment.department_name}</b>
                    </div>
                </div>
            )}

            {createMode === 'sibling' && draftSameLevelDepartment && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
                    <div className="font-bold text-emerald-700">
                        Đang thêm vị trí cùng cấp
                    </div>
                    <div className="text-slate-600 mt-1">
                        Cùng cấp với: <b>{draftSameLevelDepartment.department_name}</b>
                    </div>
                    <div className="text-slate-600">
                        Loại phòng ban sẽ tự lấy: <b>{draftSameLevelDepartment.department_type_name}</b>
                    </div>
                </div>
            )}

            {contextMenu && (
                <div
                    className="fixed z-[9999] w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2"
                    style={{
                        left: contextMenu.x,
                        top: contextMenu.y,
                    }}
                >
                    <button
                        type="button"
                        onClick={() => handleAddChild(contextMenu.node)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                        + Thêm vị trí cấp con
                    </button>

                    <button
                        type="button"
                        onClick={() => handleAddSibling(contextMenu.node)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    >
                        + Thêm vị trí cùng cấp
                    </button>
                </div>
            )}
        </div>
    );
}