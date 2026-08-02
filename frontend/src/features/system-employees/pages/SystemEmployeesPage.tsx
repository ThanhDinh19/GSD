import {
  useMemo,
  useState,
} from 'react';

import {
  SCREEN,
  usePermissions,
} from '../../auth';

import {
  EmployeeFormModal,
} from '../components/EmployeeFormModal';

import {
  useSystemEmployees,
} from '../hooks/useSystemEmployees';

import type {
  EmployeeFormPayload,
} from '../types/systemEmployee.type';

type FormMode =
  | 'create'
  | 'edit'
  | null;

export default function SystemEmployeesPage() {
  const permissions = usePermissions(
    SCREEN.SYSTEM_EMPLOYEES
  );

  const canCreate =
    permissions.canCreate ||
    permissions.canManage;

  const canUpdate =
    permissions.canUpdate ||
    permissions.canManage;

  const canDelete =
    permissions.canDelete ||
    permissions.canManage;

  const {
    employees,
    selectedEmployee,
    managerOptions,
    departmentOptions,
    filters,

    loading,
    loadingDetail,
    saving,
    deactivating,
    error,

    loadEmployees,
    loadEmployeeDetail,
    clearSelectedEmployee,

    updateFilter,
    resetFilters,

    createEmployee,
    updateEmployee,
    deactivateEmployee,
  } = useSystemEmployees();

  const [
    selectedRowEmployeeId,
    setSelectedRowEmployeeId,
  ] = useState<number | null>(null);

  const [
    formMode,
    setFormMode,
  ] = useState<FormMode>(null);

  const selectedRowEmployee =
    useMemo(() => {
      if (!selectedRowEmployeeId) {
        return null;
      }

      return (
        employees.find(
          (employee) =>
            employee.id ===
            selectedRowEmployeeId
        ) || null
      );
    }, [
      employees,
      selectedRowEmployeeId,
    ]);

  if (!permissions.canView) {
    return (
      <div className="p-6 text-sm text-red-600">
        Bạn không có quyền xem danh sách nhân viên.
      </div>
    );
  }

  const handleOpenCreate = () => {
    clearSelectedEmployee();
    setFormMode('create');
  };

  const handleOpenEdit = async () => {
    if (!selectedRowEmployeeId) {
      return;
    }

    try {
      await loadEmployeeDetail(
        selectedRowEmployeeId
      );

      setFormMode('edit');
    } catch {
      // Hook đã xử lý lỗi.
    }
  };

  const handleCloseForm = () => {
    setFormMode(null);
    clearSelectedEmployee();
  };

  const handleSaveEmployee = async (
    payload: EmployeeFormPayload
  ) => {
    if (formMode === 'create') {
      const createdEmployee =
        await createEmployee(payload);

      setSelectedRowEmployeeId(
        createdEmployee.id
      );

      handleCloseForm();

      return;
    }

    if (
      formMode === 'edit' &&
      selectedEmployee
    ) {
      await updateEmployee(
        selectedEmployee.id,
        payload
      );

      handleCloseForm();
    }
  };

  const handleDeactivate = async () => {
    if (!selectedRowEmployee) {
      return;
    }

    if (selectedRowEmployee.statusId !== 0) {
      return;
    }

    const confirmed =
      window.confirm(
        `Bạn có chắc muốn ngừng sử dụng nhân viên "${selectedRowEmployee.fullName}" không?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deactivateEmployee(
        selectedRowEmployee.id
      );
    } catch {
      // Hook đã xử lý lỗi.
    }
  };

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-200 bg-white p-4">
        <div>
          <h1 className="text-lg font-bold uppercase text-slate-800">
            Quản lý nhân viên
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Quản lý hồ sơ, phòng ban và trạng thái nhân viên.
          </p>

          {selectedRowEmployee && (
            <p className="mt-2 text-xs font-medium text-blue-600">
              Đang chọn:{' '}
              {selectedRowEmployee.employeeCode}
              {' - '}
              {selectedRowEmployee.fullName}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canUpdate && (
            <button
              type="button"
              onClick={() => {
                void handleOpenEdit();
              }}
              disabled={
                !selectedRowEmployeeId ||
                loadingDetail
              }
              className="rounded-sm border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingDetail
                ? 'Đang tải...'
                : 'Sửa nhân viên'}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => {
                void handleDeactivate();
              }}
              disabled={
                !selectedRowEmployee ||
                selectedRowEmployee.statusId !== 0 ||
                deactivating
              }
              className="rounded-sm border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deactivating
                ? 'Đang xử lý...'
                : 'Ngừng sử dụng'}
            </button>
          )}

          {canCreate && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Thêm nhân viên
            </button>
          )}
        </div>
      </div>

      <div className="rounded-sm border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-3">
          <input
            value={filters.search || ''}
            onChange={(event) =>
              updateFilter(
                'search',
                event.target.value
              )
            }
            placeholder="Tìm mã, tên, email, chức danh..."
            className="w-full min-w-[240px] max-w-[420px] rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={filters.statusId}
            onChange={(event) =>
              updateFilter(
                'statusId',
                event.target.value === ''
                  ? ''
                  : Number(
                      event.target.value
                    )
              )
            }
            className="rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">
              Tất cả trạng thái
            </option>

            <option value="0">
              Hoạt động
            </option>

            <option value="1">
              Ngừng sử dụng
            </option>
          </select>

          <select
            value={
              filters.departmentCode || ''
            }
            onChange={(event) =>
              updateFilter(
                'departmentCode',
                event.target.value
              )
            }
            className="rounded-sm border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">
              Tất cả phòng ban
            </option>

            {departmentOptions.map(
              (departmentCode) => (
                <option
                  key={departmentCode}
                  value={departmentCode}
                >
                  {departmentCode}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={() => {
              void loadEmployees();
            }}
            disabled={loading}
            className="rounded-sm border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Làm mới
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-sm border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Xóa lọc
          </button>

          <span className="ml-auto text-xs text-slate-500">
            Tổng cộng {employees.length} nhân viên
          </span>
        </div>

        {error && (
          <div className="m-3 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-auto">
          <table className="w-full min-w-[1500px] border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border border-slate-200 px-3 py-2 text-center">
                  STT
                </th>

                <th className="border border-slate-200 px-3 py-2 text-left">
                  Mã nhân viên
                </th>

                <th className="border border-slate-200 px-3 py-2 text-left">
                  Họ tên
                </th>

                <th className="border border-slate-200 px-3 py-2 text-left">
                  Tên thường gọi
                </th>

                <th className="border border-slate-200 px-3 py-2 text-left">
                  Phòng ban
                </th>

                <th className="border border-slate-200 px-3 py-2 text-left">
                  Chức danh
                </th>

                <th className="border border-slate-200 px-3 py-2 text-left">
                  Quản lý trực tiếp
                </th>

                <th className="border border-slate-200 px-3 py-2 text-left">
                  Liên hệ
                </th>

                <th className="border border-slate-200 px-3 py-2 text-left">
                  Tài khoản
                </th>

                <th className="border border-slate-200 px-3 py-2 text-center">
                  Trạng thái
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={10}
                    className="border border-slate-200 px-4 py-8 text-center text-slate-500"
                  >
                    Đang tải dữ liệu nhân viên...
                  </td>
                </tr>
              )}

              {!loading &&
                employees.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="border border-slate-200 px-4 py-8 text-center text-slate-400"
                    >
                      Chưa có nhân viên.
                    </td>
                  </tr>
                )}

              {!loading &&
                employees.map(
                  (employee, index) => {
                    const selected =
                      selectedRowEmployeeId ===
                      employee.id;

                    return (
                      <tr
                        key={employee.id}
                        onClick={() =>
                          setSelectedRowEmployeeId(
                            employee.id
                          )
                        }
                        className={`cursor-pointer transition-colors ${
                          selected
                            ? 'bg-blue-100 hover:bg-blue-100'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="border border-slate-200 px-3 py-2 text-center">
                          {index + 1}
                        </td>

                        <td className="border border-slate-200 px-3 py-2 font-semibold text-blue-700">
                          {employee.employeeCode}
                        </td>

                        <td className="border border-slate-200 px-3 py-2">
                          <div className="font-semibold text-slate-800">
                            {employee.fullName}
                          </div>

                          {employee.employmentTypeCode && (
                            <div className="mt-1 text-xs text-slate-400">
                              {
                                employee.employmentTypeCode
                              }
                            </div>
                          )}
                        </td>

                        <td className="border border-slate-200 px-3 py-2">
                          {employee.preferredName ||
                            '-'}
                        </td>

                        <td className="border border-slate-200 px-3 py-2">
                          {employee.departmentCode ||
                            '-'}
                        </td>

                        <td className="border border-slate-200 px-3 py-2">
                          <div>
                            {employee.jobTitle ||
                              '-'}
                          </div>

                          {employee.positionCode && (
                            <div className="mt-1 text-xs text-slate-400">
                              {
                                employee.positionCode
                              }
                            </div>
                          )}
                        </td>

                        <td className="border border-slate-200 px-3 py-2">
                          {employee.managerName ? (
                            <>
                              <div>
                                {
                                  employee.managerName
                                }
                              </div>

                              <div className="mt-1 text-xs text-slate-400">
                                {
                                  employee.managerEmployeeCode
                                }
                              </div>
                            </>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td className="border border-slate-200 px-3 py-2">
                          <div>
                            {employee.workEmail ||
                              employee.personalEmail ||
                              '-'}
                          </div>

                          {employee.phoneNumber && (
                            <div className="mt-1 text-xs text-slate-500">
                              {
                                employee.phoneNumber
                              }
                            </div>
                          )}
                        </td>

                        <td className="border border-slate-200 px-3 py-2">
                          {employee.username ? (
                            <>
                              <div className="font-semibold text-blue-700">
                                {
                                  employee.username
                                }
                              </div>

                              <div className="mt-1 text-xs text-slate-500">
                                {employee.accountStatusId ===
                                0
                                  ? 'Tài khoản hoạt động'
                                  : 'Tài khoản ngừng'}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400">
                              Chưa tạo
                            </span>
                          )}
                        </td>

                        <td className="border border-slate-200 px-3 py-2 text-center">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              employee.statusId ===
                              0
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {employee.statusId ===
                            0
                              ? 'Hoạt động'
                              : 'Ngừng'}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
            </tbody>
          </table>
        </div>
      </div>

      {formMode === 'create' &&
        canCreate && (
          <EmployeeFormModal
            mode="create"
            managerOptions={
              managerOptions
            }
            saving={saving}
            onClose={handleCloseForm}
            onSave={
              handleSaveEmployee
            }
          />
        )}

      {formMode === 'edit' &&
        selectedEmployee &&
        canUpdate && (
          <EmployeeFormModal
            mode="edit"
            employee={
              selectedEmployee
            }
            managerOptions={
              managerOptions
            }
            saving={saving}
            onClose={handleCloseForm}
            onSave={
              handleSaveEmployee
            }
          />
        )}
    </div>
  );
}