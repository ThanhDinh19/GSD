import { useMemo, useState } from 'react';

import {
    SCREEN,
    usePermissions,
} from '../../auth';

import {
    CreateUserModal,
} from '../components/CreateUserModal';

import {
    EditUserModal,
} from '../components/EditUserModal';

import {
    useSystemUsers,
} from '../hooks/useSystemUsers';

import {
    Button
} from '../../../shared/components'



export default function SystemUsersPage() {
    const permissions = usePermissions(SCREEN.SYSTEM_USERS);

    const {
        users,
        employees,
        roles,
        selectedUser,

        loading,
        loadingEmployees,
        loadingRoles,
        loadingUserDetail,
        saving,
        updating,
        error,

        loadUsers,
        loadEmployeeOptions,
        loadRoles,
        loadUserDetail,
        clearSelectedUser,

        createUser,
        updateUser,
        updateUserWithRoles,
    } = useSystemUsers();

    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] =
        useState(false);

    const [
        editingUserId,
        setEditingUserId,
    ] = useState<number | null>(null);

    const [
        selectedRowUserId,
        setSelectedRowUserId,
    ] = useState<number | null>(null);

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return users;

        return users.filter((user) =>
            [
                user.username,
                user.employeeCode,
                user.employeeName,
                user.departmentCode,
                user.loginEmail,
                user.roleNames,
            ].some((value) =>
                String(value || '').toLowerCase().includes(keyword)
            )
        );
    }, [users, search]);



    if (!permissions.canView) {
        return (
            <div className="p-6 text-sm text-red-600">
                Bạn không có quyền xem tài khoản.
            </div>
        );
    }

    const handleOpenCreate = async () => {
        await Promise.all([
            loadEmployeeOptions(),
            loadRoles(),
        ]);

        setIsCreateOpen(true);
    };

    const handleOpenEdit = async (
        userId: number
    ) => {
        setEditingUserId(userId);

        try {
            await Promise.all([
                loadEmployeeOptions(),
                loadRoles(),
                loadUserDetail(userId),
            ]);

            setIsEditOpen(true);
        } catch {
            // Hook đã xử lý thông báo lỗi.
        } finally {
            setEditingUserId(null);
        }
    };

    const handleCloseEdit = () => {
        setIsEditOpen(false);
        clearSelectedUser();
    };

    return (
        <div className="space-y-4 p-5">
            <div className="flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4">
                <div>
                    <h1 className="text-lg font-bold uppercase text-slate-800">
                        Quản lý tài khoản
                    </h1>

                    <p className="mt-1 text-xs text-slate-500">
                        Tạo và quản lý tài khoản đăng nhập hệ thống.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {permissions.canUpdate && (
                        <Button
                            variant='warning'
                            onClick={() => {
                                if (selectedRowUserId) {
                                    void handleOpenEdit(
                                        selectedRowUserId
                                    );
                                }
                            }}
                            disabled={
                                !selectedRowUserId ||
                                loadingUserDetail
                            }
                        >
                            {loadingUserDetail &&
                                editingUserId === selectedRowUserId
                                ? 'Đang tải...'
                                : 'Sửa'}
                        </Button>
                    )}

                    {permissions.canCreate && (
                        <Button
                            variant='primary'
                            onClick={() =>
                                void handleOpenCreate()
                            }
                        >
                            Thêm
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white">
                <div className="flex items-center gap-3 border-b border-slate-200 p-3">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Tìm tên, mã nhân viên, tài khoản..."
                        className="w-full max-w-[420px] rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />

                    <button type="button" onClick={() => void loadUsers()} className="rounded-sm border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        Làm mới
                    </button>
                </div>

                {error && (
                    <div className="m-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="overflow-auto">
                    <table className="w-full min-w-[1100px] border-collapse text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="border border-slate-200 px-3 py-2 text-center">STT</th>
                                <th className="border border-slate-200 px-3 py-2 text-left">Mã nhân viên</th>
                                <th className="border border-slate-200 px-3 py-2 text-left">Họ tên</th>
                                <th className="border border-slate-200 px-3 py-2 text-left">Tài khoản</th>
                                <th className="border border-slate-200 px-3 py-2 text-left">Email</th>
                                <th className="border border-slate-200 px-3 py-2 text-left">Phòng ban</th>
                                <th className="border border-slate-200 px-3 py-2 text-left">Vai trò</th>
                                <th className="border border-slate-200 px-3 py-2 text-center">Trạng thái</th>

                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="border border-slate-200 px-4 py-6 text-center text-slate-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="border border-slate-200 px-4 py-6 text-center text-slate-400">
                                        Chưa có tài khoản.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                filteredUsers.map(
                                    (user, index) => (
                                        <tr
                                            key={user.id}
                                            onClick={() =>
                                                setSelectedRowUserId(
                                                    user.id
                                                )
                                            }
                                            className={`cursor-pointer transition-colors ${selectedRowUserId ===
                                                user.id
                                                ? 'bg-blue-100 hover:bg-blue-100'
                                                : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <td className="border border-slate-200 px-3 py-2 text-center">
                                                {index + 1}
                                            </td>

                                            <td className="border border-slate-200 px-3 py-2">
                                                {user.employeeCode ||
                                                    '-'}
                                            </td>

                                            <td className="border border-slate-200 px-3 py-2">
                                                {user.employeeName ||
                                                    '-'}
                                            </td>

                                            <td className="border border-slate-200 px-3 py-2 font-semibold text-blue-700">
                                                {user.username}
                                            </td>

                                            <td className="border border-slate-200 px-3 py-2">
                                                {user.loginEmail || '-'}
                                            </td>

                                            <td className="border border-slate-200 px-3 py-2">
                                                {user.departmentCode || '-'}
                                            </td>

                                            <td className="border border-slate-200 px-3 py-2">
                                                {user.roleNames ? (
                                                    <div className="flex max-w-[320px] flex-wrap gap-1">
                                                        {user.roleNames
                                                            .split(',')
                                                            .map((roleName) => roleName.trim())
                                                            .filter(Boolean)
                                                            .map((roleName) => (
                                                                <span
                                                                    key={roleName}
                                                                    className="rounded-sm bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                                                                >
                                                                    {roleName}
                                                                </span>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        Chưa gán
                                                    </span>
                                                )}
                                            </td>

                                            <td className="border border-slate-200 px-3 py-2 text-center">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-semibold ${user.statusId === 0
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}
                                                >
                                                    {user.statusId === 0
                                                        ? 'Hoạt động'
                                                        : 'Ngừng'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreateOpen && permissions.canCreate && (
                <CreateUserModal
                    employees={employees}
                    roles={roles}
                    saving={saving}
                    loadingEmployees={loadingEmployees}
                    loadingRoles={loadingRoles}
                    onClose={() => setIsCreateOpen(false)}
                    onSave={async (payload) => {
                        await createUser(payload);
                        setIsCreateOpen(false);
                    }}
                />
            )}

            {isEditOpen &&
                selectedUser &&
                permissions.canUpdate && (
                    <EditUserModal
                        user={selectedUser}
                        employees={employees}
                        roles={roles}
                        saving={updating}
                        loadingEmployees={loadingEmployees}
                        loadingRoles={loadingRoles}
                        onClose={handleCloseEdit}
                        onSave={async (
                            payload,
                            roleIds
                        ) => {
                            await updateUserWithRoles(
                                selectedUser.id,
                                payload,
                                roleIds
                            );

                            handleCloseEdit();
                        }}
                    />
                )}
        </div>
    );
}