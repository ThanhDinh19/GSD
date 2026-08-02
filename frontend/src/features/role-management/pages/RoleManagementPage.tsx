import {
  useMemo,
  useState,
} from 'react';

import {
  SCREEN,
  usePermissions,
} from '../../auth';

import {
  RoleFormModal,
} from '../components/RoleFormModal';

import {
  RolePermissionMatrix,
} from '../components/RolePermissionMatrix';

import {
  useRoleManagement,
} from '../hooks/useRoleManagement';

import type {
  CreateRolePayload,
  UpdateRolePayload,
} from '../types/roleManagement.type';

type FormMode =
  | 'create'
  | 'edit'
  | null;

export default function RoleManagementPage() {
  const permissions = usePermissions(
    SCREEN.SYSTEM_ROLES
  );
  console.log(
  'SYSTEM.ROLES permissions:',
  permissions
);

  const {
    roles,
    selectedRoleId,
    selectedRole,
    permissionMatrix,
    permissionState,

    loading,
    loadingDetail,
    savingRole,
    savingPermissions,
    deactivatingRole,
    error,

    hasPermissionChanges,

    loadRoles,
    loadRole,

    createRole,
    updateRole,
    deactivateRole,

    togglePermission,
    setPermissionScope,
    setScreenPermissions,
    setAllPermissions,
    resetPermissionChanges,
    saveRolePermissions,
  } = useRoleManagement();

  const [search, setSearch] =
    useState('');

  const [formMode, setFormMode] =
    useState<FormMode>(null);

  const filteredRoles = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return roles;
    }

    return roles.filter((role) =>
      [
        role.roleCode,
        role.roleName,
        role.description,
        role.roleTypeCode,
      ].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [
    roles,
    search,
  ]);

  if (!permissions.canView) {
    return (
      <div className="p-6 text-sm text-red-600">
        Bạn không có quyền xem vai trò.
      </div>
    );
  }

  const handleSelectRole = async (
    roleId: number
  ) => {
    try {
      await loadRole(roleId);
    } catch {
      // Lỗi đã được hook xử lý.
    }
  };

  const handleSaveRole = async (
    payload:
      | CreateRolePayload
      | UpdateRolePayload
  ) => {
    if (formMode === 'create') {
      await createRole(
        payload as CreateRolePayload
      );

      setFormMode(null);

      return;
    }

    if (
      formMode === 'edit' &&
      selectedRoleId
    ) {
      await updateRole(
        selectedRoleId,
        payload as UpdateRolePayload
      );

      setFormMode(null);
    }
  };

  const handleDeactivateRole =
    async () => {
      if (!selectedRoleId) return;

      if (selectedRole?.isSystemRole) {
        window.alert(
          'Không thể ngừng sử dụng vai trò hệ thống.'
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Bạn có chắc muốn ngừng sử dụng vai trò "${selectedRole?.roleName}" không?`
        );

      if (!confirmed) return;

      try {
        await deactivateRole(
          selectedRoleId
        );
      } catch {
        // Lỗi đã được hook xử lý.
      }
    };

  const handleSavePermissions =
    async () => {
      try {
        await saveRolePermissions(
          'Cập nhật quyền vai trò từ giao diện quản trị'
        );
      } catch {
        // Lỗi đã được hook xử lý.
      }
    };

  return (
    <div className="flex h-full min-h-[700px] gap-4 p-5">
      <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-sm border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase text-slate-800">
                Danh sách vai trò
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Tổng cộng {roles.length} vai trò
              </p>
            </div>

            {permissions.canManage && (
              <button
                type="button"
                onClick={() =>
                  setFormMode('create')
                }
                className="rounded-sm bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Thêm mới
              </button>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Tìm vai trò..."
              className="min-w-0 flex-1 rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() => {
                void loadRoles();
              }}
              disabled={loading}
              className="rounded-sm border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Làm mới
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && (
            <div className="p-4 text-sm text-slate-500">
              Đang tải vai trò...
            </div>
          )}

          {!loading &&
            filteredRoles.length === 0 && (
              <div className="p-4 text-sm text-slate-400">
                Chưa có vai trò.
              </div>
            )}

          {!loading &&
            filteredRoles.map((role) => {
              const selected =
                selectedRoleId === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    void handleSelectRole(
                      role.id
                    );
                  }}
                  className={`w-full border-b border-slate-100 px-3 py-3 text-left hover:bg-slate-50 ${
                    selected
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {role.roleName}
                      </p>

                      <p className="mt-1 truncate text-xs font-medium text-blue-600">
                        {role.roleCode}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                        role.statusId === 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {role.statusId === 0
                        ? 'Hoạt động'
                        : 'Ngừng'}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>
                      {role.userCount ?? 0}{' '}
                      tài khoản
                    </span>

                    <span>·</span>

                    <span>
                      {role.permissionCount ??
                        0}{' '}
                      quyền
                    </span>

                    {role.isSystemRole && (
                      <>
                        <span>·</span>

                        <span className="font-semibold text-amber-600">
                          Hệ thống
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-sm border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <h1 className="text-base font-bold uppercase text-slate-800">
              Quản lý vai trò
            </h1>

            {selectedRole ? (
              <p className="mt-1 text-xs text-slate-500">
                {selectedRole.roleName}
                {' · '}
                {selectedRole.roleCode}
                {' · '}
                {selectedRole.roleTypeCode}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Chọn một vai trò để xem và
                cấu hình quyền.
              </p>
            )}
          </div>

          {selectedRole && (
            <div className="flex flex-wrap items-center gap-2">
              {permissions.canManage  && (
                <button
                  type="button"
                  onClick={() =>
                    setFormMode('edit')
                  }
                  disabled={
                    savingRole ||
                    loadingDetail
                  }
                  className="rounded-sm border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                >
                  Sửa thông tin
                </button>
              )}

              {permissions.canManage  &&
                !selectedRole.isSystemRole && (
                  <button
                    type="button"
                    onClick={() => {
                      void handleDeactivateRole();
                    }}
                    disabled={
                      deactivatingRole ||
                      loadingDetail
                    }
                    className="rounded-sm border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deactivatingRole
                      ? 'Đang xử lý...'
                      : 'Ngừng sử dụng'}
                  </button>
                )}
            </div>
          )}
        </div>

        {error && (
          <div className="m-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {!selectedRoleId &&
          !loadingDetail && (
            <div className="flex min-h-[500px] flex-1 items-center justify-center p-6">
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">
                  Chưa chọn vai trò
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Chọn một vai trò bên trái
                  để xem ma trận quyền.
                </p>
              </div>
            </div>
          )}

        {loadingDetail && (
          <div className="flex min-h-[500px] flex-1 items-center justify-center p-6 text-sm text-slate-500">
            Đang tải thông tin vai trò...
          </div>
        )}

        {!loadingDetail &&
          selectedRoleId &&
          permissionMatrix && (
            <>
              <div className="min-h-0 flex-1 overflow-auto p-4">
                <RolePermissionMatrix
                  matrix={
                    permissionMatrix
                  }
                  permissionState={
                    permissionState
                  }
                  disabled={
                    !permissions.canManage ||
                    savingPermissions
                  }
                  onTogglePermission={
                    togglePermission
                  }
                  onChangeScope={
                    setPermissionScope
                  }
                  onToggleScreen={
                    setScreenPermissions
                  }
                  onToggleAll={
                    setAllPermissions
                  }
                />
              </div>

              {permissions.canManage && (
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-500">
                    {hasPermissionChanges
                      ? 'Có thay đổi chưa được lưu.'
                      : 'Quyền vai trò đã được cập nhật.'}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={
                        resetPermissionChanges
                      }
                      disabled={
                        savingPermissions ||
                        !hasPermissionChanges
                      }
                      className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Hoàn tác
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        void handleSavePermissions();
                      }}
                      disabled={
                        savingPermissions ||
                        !hasPermissionChanges
                      }
                      className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingPermissions
                        ? 'Đang lưu...'
                        : 'Lưu quyền'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
      </section>

      {formMode && (
        <RoleFormModal
          mode={formMode}
          role={
            formMode === 'edit'
              ? selectedRole
              : null
          }
          saving={savingRole}
          onClose={() =>
            setFormMode(null)
          }
          onSave={handleSaveRole}
        />
      )}
    </div>
  );
}