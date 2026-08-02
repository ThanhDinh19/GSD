import type { RolePermissionMatrix as RolePermissionMatrixData } from '../types/roleManagement.type';

type PermissionStateItem = {
  assigned: boolean;
  scopeCode: string;
};

type PermissionState = Record<number, PermissionStateItem>;

type RolePermissionMatrixProps = {
  matrix: RolePermissionMatrixData | null;
  permissionState: PermissionState;
  loading?: boolean;
  disabled?: boolean;
  onTogglePermission: (permissionId: number, assigned: boolean) => void;
  onChangeScope: (permissionId: number, scopeCode: string) => void;
  onToggleScreen: (permissionIds: number[], assigned: boolean) => void;
  onToggleAll: (assigned: boolean) => void;
};

export function RolePermissionMatrix({
  matrix,
  permissionState,
  loading = false,
  disabled = false,
  onTogglePermission,
  onChangeScope,
  onToggleScreen,
  onToggleAll,
}: RolePermissionMatrixProps) {
  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center border border-slate-200 bg-white">
        <span className="text-sm text-slate-500">Đang tải ma trận quyền...</span>
      </div>
    );
  }

  if (!matrix) {
    return (
      <div className="flex min-h-[240px] items-center justify-center border border-dashed border-slate-300 bg-slate-50">
        <span className="text-sm text-slate-500">Chọn một vai trò để cấu hình quyền.</span>
      </div>
    );
  }

  const allPermissionIds = matrix.modules.flatMap((moduleItem) =>
    moduleItem.screens.flatMap((screen) => screen.actions.map((action) => action.permissionId))
  );

  const assignedPermissionCount = allPermissionIds.filter(
    (permissionId) => permissionState[permissionId]?.assigned
  ).length;

  const allAssigned =
    allPermissionIds.length > 0 &&
    assignedPermissionCount === allPermissionIds.length;

  return (
    <div className="overflow-hidden border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold uppercase text-slate-800">Ma trận quyền vai trò</h3>

          <p className="mt-1 text-xs text-slate-500">
            Đã chọn {assignedPermissionCount}/{allPermissionIds.length} quyền
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={allAssigned}
            disabled={disabled || allPermissionIds.length === 0}
            onChange={(event) => onToggleAll(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />

          Chọn tất cả
        </label>
      </div>

      {matrix.modules.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">Chưa có permission nào được khai báo.</div>
      ) : (
        <div className="divide-y divide-slate-200">
          {matrix.modules.map((moduleItem) => (
            <section key={moduleItem.moduleId}>
              <div className="border-b border-slate-200 bg-slate-100 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{moduleItem.moduleName}</span>

                  <span className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {moduleItem.moduleCode}
                  </span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {moduleItem.screens.map((screen) => {
                  const screenPermissionIds = screen.actions.map((action) => action.permissionId);

                  const assignedScreenCount = screenPermissionIds.filter(
                    (permissionId) => permissionState[permissionId]?.assigned
                  ).length;

                  const screenChecked =
                    screenPermissionIds.length > 0 &&
                    assignedScreenCount === screenPermissionIds.length;

                  return (
                    <div key={screen.screenId} className="grid grid-cols-1 lg:grid-cols-[260px_1fr]">
                      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 lg:border-b-0 lg:border-r">
                        <label className="flex cursor-pointer items-start gap-2">
                          <input
                            type="checkbox"
                            checked={screenChecked}
                            disabled={disabled || screenPermissionIds.length === 0}
                            onChange={(event) =>
                              onToggleScreen(screenPermissionIds, event.target.checked)
                            }
                            className="mt-0.5 h-4 w-4 rounded border-slate-300"
                          />

                          <span>
                            <span className="block text-sm font-semibold text-slate-800">
                              {screen.screenName}
                            </span>

                            <span className="mt-0.5 block text-xs text-slate-500">
                              {screen.screenCode}
                            </span>

                            <span className="mt-1 block text-[11px] text-slate-400">
                              {assignedScreenCount}/{screenPermissionIds.length} quyền
                            </span>
                          </span>
                        </label>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-left text-[11px] uppercase text-slate-500">
                              <th className="w-[72px] px-3 py-2 text-center">Cấp</th>
                              <th className="px-3 py-2">Hành động</th>
                              <th className="px-3 py-2">Permission</th>
                              <th className="w-[170px] px-3 py-2">Phạm vi</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {screen.actions.map((action) => {
                              const state = permissionState[action.permissionId] || {
                                assigned: false,
                                scopeCode: action.scopeCode || 'ALL',
                              };

                              return (
                                <tr key={action.permissionId} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={state.assigned}
                                      disabled={disabled}
                                      onChange={(event) =>
                                        onTogglePermission(
                                          action.permissionId,
                                          event.target.checked
                                        )
                                      }
                                      className="h-4 w-4 rounded border-slate-300"
                                    />
                                  </td>

                                  <td className="px-3 py-2">
                                    <div className="text-sm font-semibold text-slate-700">
                                      {action.actionName}
                                    </div>

                                    <div className="mt-0.5 text-[11px] text-slate-400">
                                      {action.actionCode}
                                    </div>
                                  </td>

                                  <td className="px-3 py-2">
                                    <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                      {action.permissionCode}
                                    </span>

                                    {action.isSensitive && (
                                      <span className="ml-2 rounded bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600">
                                        Nhạy cảm
                                      </span>
                                    )}
                                  </td>

                                  <td className="px-3 py-2">
                                    <input
                                      value={state.scopeCode}
                                      disabled={disabled || !state.assigned}
                                      onChange={(event) =>
                                        onChangeScope(
                                          action.permissionId,
                                          event.target.value
                                        )
                                      }
                                      onBlur={(event) =>
                                        onChangeScope(
                                          action.permissionId,
                                          event.target.value || 'ALL'
                                        )
                                      }
                                      placeholder="ALL"
                                      className="w-full rounded-sm border border-slate-300 px-2 py-1.5 text-xs uppercase outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}