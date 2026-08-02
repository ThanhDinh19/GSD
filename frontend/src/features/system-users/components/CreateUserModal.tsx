import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';

import type {
  RoleListItem,
} from '../../role-management/types/roleManagement.type';

import type {
  CreateUserWithRolesPayload,
  EmployeeOption,
} from '../types/systemUser.type';

type CreateUserModalProps = {
  employees: EmployeeOption[];
  roles: RoleListItem[];

  saving: boolean;
  loadingEmployees: boolean;
  loadingRoles: boolean;

  onClose: () => void;
  onSave: (
    payload: CreateUserWithRolesPayload
  ) => Promise<void>;
};

const DEFAULT_PASSWORD =
  import.meta.env.VITE_DEFAULT_USER_PASSWORD ||
  'Aa@123456';

const initialForm = {
  employeeId: '',
  username: '',
  loginEmail: '',
  password: DEFAULT_PASSWORD,
  confirmPassword: DEFAULT_PASSWORD,
};

function formatEmployee(
  employee: EmployeeOption
) {
  return [
    employee.employeeCode,
    employee.fullName,
    employee.departmentCode,
  ]
    .filter(Boolean)
    .join(' - ');
}

export function CreateUserModal({
  employees,
  roles,
  saving,
  loadingEmployees,
  loadingRoles,
  onClose,
  onSave,
}: CreateUserModalProps) {
  const [form, setForm] =
    useState(initialForm);

  const [
    employeeSearch,
    setEmployeeSearch,
  ] = useState('');

  const [
    employeeDropdownOpen,
    setEmployeeDropdownOpen,
  ] = useState(false);

  const [roleIds, setRoleIds] =
    useState<number[]>([]);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] =
    useState('');

  const updateForm = (
    field: keyof typeof initialForm,
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

  const filteredEmployees =
    useMemo(() => {
      const keyword =
        employeeSearch
          .trim()
          .toLowerCase();

      if (!keyword) {
        return employees;
      }

      return employees.filter(
        (employee) =>
          [
            employee.employeeCode,
            employee.fullName,
            employee.departmentCode,
            employee.positionCode,
            employee.jobTitle,
          ].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(keyword)
          )
      );
    }, [
      employees,
      employeeSearch,
    ]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const employeeId =
      Number(form.employeeId);

    const username =
      form.username.trim();

    const loginEmail =
      form.loginEmail.trim();

    const password =
      form.password;

    if (!employeeId) {
      setError(
        'Vui lòng chọn nhân viên.'
      );

      return;
    }

    if (!username) {
      setError(
        'Vui lòng nhập tên đăng nhập.'
      );

      return;
    }

    if (password.length < 9) {
      setError(
        'Mật khẩu phải có ít nhất 9 ký tự.'
      );

      return;
    }

    if (
      password !==
      form.confirmPassword
    ) {
      setError(
        'Mật khẩu xác nhận không khớp.'
      );

      return;
    }

    if (roleIds.length === 0) {
      setError(
        'Vui lòng chọn ít nhất một vai trò.'
      );

      return;
    }

    try {
      await onSave({
        employeeId,
        username,
        loginEmail:
          loginEmail || null,
        password,
        roleIds,
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Không tạo được tài khoản.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-sm bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-800">
              Tạo tài khoản
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Tạo tài khoản đăng nhập và gán vai trò cho nhân viên.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-xl text-slate-400 hover:text-slate-700 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Nhân viên
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div
                className="relative"
                onBlur={() => {
                  window.setTimeout(() => {
                    setEmployeeDropdownOpen(false);
                  }, 150);
                }}
              >
                <input
                  value={employeeSearch}
                  disabled={saving || loadingEmployees}
                  onFocus={() => setEmployeeDropdownOpen(true)}
                  onChange={(event) => {
                    setEmployeeSearch(event.target.value);
                    updateForm('employeeId', '');
                    setEmployeeDropdownOpen(true);
                  }}
                  placeholder={
                    loadingEmployees
                      ? 'Đang tải nhân viên...'
                      : 'Nhập mã hoặc tên nhân viên...'
                  }
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />

                {(employeeSearch || form.employeeId) && (
                  <button
                    type="button"
                    disabled={saving}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setEmployeeSearch('');
                      updateForm('employeeId', '');
                      setEmployeeDropdownOpen(true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-slate-400 hover:text-slate-700 disabled:opacity-50"
                  >
                    ×
                  </button>
                )}

                {employeeDropdownOpen && !loadingEmployees && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[260px] overflow-y-auto rounded-sm border border-slate-300 bg-white shadow-lg">
                    {filteredEmployees.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-slate-400">
                        Không tìm thấy nhân viên.
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => {
                        const selected =
                          Number(form.employeeId) === employee.id;

                        return (
                          <button
                            key={employee.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              updateForm(
                                'employeeId',
                                String(employee.id)
                              );

                              setEmployeeSearch(
                                formatEmployee(employee)
                              );

                              setEmployeeDropdownOpen(false);
                            }}
                            className={`block w-full border-b border-slate-100 px-3 py-2.5 text-left last:border-b-0 hover:bg-blue-50 ${selected ? 'bg-blue-50' : 'bg-white'}`}
                          >
                            <span className="block text-sm font-semibold text-slate-800">
                              {employee.employeeCode}
                              {' - '}
                              {employee.fullName}
                            </span>

                            <span className="mt-0.5 block text-xs text-slate-500">
                              {employee.departmentCode || 'Chưa có phòng ban'}

                              {employee.jobTitle
                                ? ` · ${employee.jobTitle}`
                                : ''}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Tên đăng nhập
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                value={form.username}
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'username',
                    event.target.value
                  )
                }
                placeholder="Ví dụ: nguyenvana"
                className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              />

              <p className="mt-1 text-xs text-slate-400">
                Backend sẽ tự chuyển tên đăng nhập thành chữ thường.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email đăng nhập
              </label>

              <input
                type="email"
                value={form.loginEmail}
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'loginEmail',
                    event.target.value
                  )
                }
                placeholder="email@company.com"
                className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">
                  Vai trò
                  <span className="ml-1 text-red-500">
                    *
                  </span>
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

                {!loadingRoles &&
                  roles.length === 0 && (
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
                        checked={roleIds.includes(
                          role.id
                        )}
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

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Mật khẩu
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={form.password}
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'password',
                      event.target.value
                    )
                  }
                  placeholder="Ít nhất 9 ký tự"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 pr-16 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={saving}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600 disabled:opacity-50"
                >
                  {showPassword
                    ? 'Ẩn'
                    : 'Hiện'}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Xác nhận mật khẩu
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={
                  form.confirmPassword
                }
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'confirmPassword',
                    event.target.value
                  )
                }
                placeholder="Nhập lại mật khẩu"
                className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              />
            </div>

            {error && (
              <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-sm border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingEmployees ||
                loadingRoles
              }
              className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Đang tạo...'
                : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}