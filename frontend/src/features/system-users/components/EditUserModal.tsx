import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type {
  EmployeeOption,
  SystemUserDetail,
  UpdateUserPayload,
} from '../types/systemUser.type';

import type {
  RoleListItem,
} from '../../role-management/types/roleManagement.type';

type EditUserModalProps = {
  user: SystemUserDetail;
  employees: EmployeeOption[];
  roles: RoleListItem[];

  saving: boolean;
  loadingEmployees: boolean;
  loadingRoles: boolean;

  onClose: () => void;
  onSave: (
    payload: UpdateUserPayload,
    roleIds: number[]
  ) => Promise<void>;
};

type FormState = {
  employeeId: string;
  username: string;
  loginEmail: string;
  statusId: string;
};

export function EditUserModal({
  user,
  employees,
  roles,
  saving,
  loadingEmployees,
  loadingRoles,
  onClose,
  onSave,
}: EditUserModalProps) {
  const [form, setForm] = useState<FormState>({
    employeeId: '',
    username: '',
    loginEmail: '',
    statusId: '0',
  });
  const [roleIds, setRoleIds] =
    useState<number[]>([]);

  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      employeeId: String(user.employeeId || ''),
      username: user.username || '',
      loginEmail: user.loginEmail || '',
      statusId: String(user.statusId ?? 0),
    });

    setRoleIds(
      Array.from(
        new Set(
          user.roles
            .filter((role) => role.statusId === 0)
            .map((role) => role.roleId)
        )
      )
    );

    setError('');
  }, [user]);

  const employeeOptions = useMemo(() => {
    if (!user.employeeId) return employees;

    const currentEmployeeExists = employees.some(
      (employee) => employee.id === user.employeeId
    );

    if (currentEmployeeExists) return employees;

    return [
      {
        id: user.employeeId,
        employeeCode: user.employeeCode || '',
        fullName: user.employeeName || user.username,
        departmentCode: user.departmentCode,
        positionCode: null,
        jobTitle: null,
      },
      ...employees,
    ];
  }, [employees, user]);

  const updateForm = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError('');
  };

  const toggleRole = (
    roleId: number,
    checked: boolean
  ) => {
    setRoleIds((previous) => {
      if (checked) {
        return previous.includes(roleId)
          ? previous
          : [...previous, roleId];
      }

      return previous.filter(
        (id) => id !== roleId
      );
    });

    setError('');
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const employeeId = Number(form.employeeId);
    const username = form.username.trim().toLowerCase();
    const loginEmail = form.loginEmail.trim().toLowerCase();
    const statusId = Number(form.statusId);

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      setError('Vui lòng chọn nhân viên.');
      return;
    }

    if (!username) {
      setError('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (![0, 1].includes(statusId)) {
      setError('Trạng thái tài khoản không hợp lệ.');
      return;
    }

    if (roleIds.length === 0) {
      setError(
        'Vui lòng chọn ít nhất một vai trò.'
      );

      return;
    }

    try {
      await onSave(
        {
          employeeId,
          username,
          loginEmail: loginEmail || null,
          statusId,
        },
        roleIds
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Không cập nhật được tài khoản.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[620px] overflow-hidden rounded-sm bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-800">
              Cập nhật tài khoản
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Chỉnh sửa thông tin đăng nhập và trạng thái tài khoản.
            </p>
          </div>

          <button type="button" onClick={onClose} disabled={saving} className="text-xl leading-none text-slate-400 hover:text-slate-700 disabled:opacity-50">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Nhân viên <span className="text-red-500">*</span>
              </label>

              <select value={form.employeeId} disabled={saving || loadingEmployees} onChange={(event) => updateForm('employeeId', event.target.value)} className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100">
                <option value="">
                  {loadingEmployees
                    ? 'Đang tải nhân viên...'
                    : '-- Chọn nhân viên --'}
                </option>

                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.employeeCode || '-'} - {employee.fullName}
                    {employee.departmentCode
                      ? ` - ${employee.departmentCode}`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>

              <input value={form.username} disabled={saving} onChange={(event) => updateForm('username', event.target.value)} placeholder="Tên đăng nhập" className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email đăng nhập
              </label>

              <input type="email" value={form.loginEmail} disabled={saving} onChange={(event) => updateForm('loginEmail', event.target.value)} placeholder="email@company.com" className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100" />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Trạng thái
              </label>

              <select value={form.statusId} disabled={saving} onChange={(event) => updateForm('statusId', event.target.value)} className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100">
                <option value="0">Hoạt động</option>
                <option value="1">Ngừng sử dụng</option>
              </select>

              {form.statusId === '1' && (
                <p className="mt-1 text-xs text-amber-600">
                  Ngừng tài khoản sẽ thu hồi các phiên đăng nhập đang hoạt động.
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Vai trò
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <span className="text-xs text-slate-500">
                  Đã chọn {roleIds.length}
                </span>
              </div>

              <div className="max-h-[220px] overflow-y-auto rounded-sm border border-slate-300">
                {loadingRoles && (
                  <div className="px-3 py-4 text-sm text-slate-500">
                    Đang tải danh sách vai trò...
                  </div>
                )}

                {!loadingRoles && roles.length === 0 && (
                  <div className="px-3 py-4 text-sm text-slate-400">
                    Chưa có vai trò đang hoạt động.
                  </div>
                )}

                {!loadingRoles &&
                  roles.map((role) => (
                    <label
                      key={role.id}
                      className="flex cursor-pointer items-start gap-3 border-b border-slate-100 px-3 py-3 last:border-b-0 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={roleIds.includes(role.id)}
                        disabled={saving}
                        onChange={(event) =>
                          toggleRole(
                            role.id,
                            event.target.checked
                          )
                        }
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300"
                      />

                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-800">
                          {role.roleName}
                        </span>

                        <span className="mt-0.5 block text-xs font-medium text-blue-600">
                          {role.roleCode}
                        </span>

                        {role.description && (
                          <span className="mt-1 block text-xs text-slate-500">
                            {role.description}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
              </div>
            </div>

            {error && (
              <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">
              Hủy
            </button>

            <button type="submit" disabled={saving || loadingEmployees} className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}