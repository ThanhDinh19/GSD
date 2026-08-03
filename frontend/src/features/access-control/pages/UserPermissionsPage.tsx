import {
  useMemo,
  useState,
} from 'react';

import {
  SCREEN,
  usePermissions,
} from '../../auth';

import {
  useUserPermissions,
} from '../hooks/useUserPermissions';

import {
  Button
} from '../../../shared/components';

export default function UserPermissionsPage() {
  const permissions = usePermissions(
    'SYSTEM.USER_PERMISSIONS'
  );

  const {
    users,
    selectedUserId,
    matrix,
    checkedMap,
    changes,
    loadingUsers,
    loadingMatrix,
    saving,
    error,
    setSelectedUserId,
    togglePermission,
    save,
  } = useUserPermissions();

  const [search, setSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      return [
        user.username,
        user.employeeCode,
        user.employeeName,
        user.departmentCode,
      ].some((value) =>
        String(value || '').toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  if (!permissions.canView) {
    return (
      <div className="p-6 text-sm text-red-600">
        Bạn không có quyền xem màn hình này.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[700px] gap-4 p-5">
      <aside className="w-[300px] shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-3">
          <h2 className="text-sm font-bold uppercase text-slate-800">
            Danh sách tài khoản
          </h2>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tài khoản..."
            className="mt-3 w-full rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="max-h-[650px] overflow-y-auto">
          {loadingUsers && (
            <div className="p-4 text-sm text-slate-500">
              Đang tải tài khoản...
            </div>
          )}

          {filteredUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedUserId(user.id)}
              className={`w-full border-b border-slate-100 px-3 py-3 text-left hover:bg-slate-50 ${selectedUserId === user.id ? 'bg-blue-50' : ''}`}
            >
              <p className="text-sm font-semibold text-slate-800">
                {user.employeeName || user.username}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {user.username} · {user.departmentCode || '-'}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <section className="min-w-0 flex-1 overflow-hidden rounded-sm border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h1 className="text-base font-bold uppercase text-slate-800">
              Phân quyền người dùng
            </h1>

            {matrix && (
              <p className="mt-1 text-xs text-slate-500">
                Tài khoản: {matrix.user.username}
                {' · '}
                Vai trò: {matrix.roles.map((role) => role.roleName).join(', ') || 'Không có'}
              </p>
            )}
          </div>

          {permissions.canManage && (
            <Button
              variant='primary'
              onClick={() => void save()}
              disabled={saving || changes.length === 0}
            >
              {saving
                ? 'Saving...'
                : `Save (${changes.length})`}
            </Button>
          )}
        </div>

        {error && (
          <div className="m-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {loadingMatrix && (
          <div className="p-6 text-sm text-slate-500">
            Đang tải phân quyền...
          </div>
        )}

        {!loadingMatrix && matrix && (
          <div className="max-h-[650px] overflow-auto p-4">
            {matrix.modules.map((moduleItem) => (
              <div key={moduleItem.moduleId} className="mb-5 overflow-hidden rounded-sm border border-slate-200">
                <div className="bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-800">
                  {moduleItem.moduleName}
                </div>

                {moduleItem.screens.map((screen) => (
                  <div key={screen.screenId} className="border-t border-slate-200 p-4 first:border-t-0">
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {screen.screenName}
                      </p>

                      <p className="text-xs text-slate-400">
                        {screen.screenCode}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {screen.actions.map((action) => (
                        <label key={action.permissionId} className="flex min-w-[150px] cursor-pointer items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={checkedMap[action.permissionId] ?? false}
                            disabled={!permissions.canManage}
                            onChange={(event) => togglePermission(action.permissionId, event.target.checked)}
                            className="h-4 w-4"
                          />

                          <span>{action.actionName}</span>

                          {action.inheritedFromRole && (
                            <span title="Quyền được kế thừa từ vai trò" className="text-xs text-blue-500">
                              Role
                            </span>
                          )}

                          {action.overrideEffect === 'DENY' && (
                            <span className="text-xs text-red-500">
                              Deny
                            </span>
                          )}

                          {action.overrideEffect === 'ALLOW' && (
                            <span className="text-xs text-green-600">
                              Allow
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}