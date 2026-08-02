import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import type {
  EmployeeFormPayload,
  EmployeeManagerOption,
  SystemEmployeeDetail,
} from '../types/systemEmployee.type';

type EmployeeFormMode =
  | 'create'
  | 'edit';

type EmployeeFormModalProps = {
  mode: EmployeeFormMode;
  employee?: SystemEmployeeDetail | null;
  managerOptions: EmployeeManagerOption[];
  saving: boolean;
  onClose: () => void;
  onSave: (
    payload: EmployeeFormPayload
  ) => Promise<void>;
};

type EmployeeFormState = {
  employeeCode: string;
  fullName: string;
  preferredName: string;

  departmentCode: string;
  positionCode: string;
  jobTitle: string;

  managerEmployeeId: string;

  workEmail: string;
  personalEmail: string;
  phoneNumber: string;

  employmentTypeCode: string;

  hireDate: string;
  probationEndDate: string;
  terminationDate: string;

  statusId: string;
};

const initialForm: EmployeeFormState = {
  employeeCode: '',
  fullName: '',
  preferredName: '',

  departmentCode: '',
  positionCode: '',
  jobTitle: '',

  managerEmployeeId: '',

  workEmail: '',
  personalEmail: '',
  phoneNumber: '',

  employmentTypeCode: '',

  hireDate: '',
  probationEndDate: '',
  terminationDate: '',

  statusId: '0',
};

function toDateInputValue(
  value: string | null | undefined
) {
  if (!value) return '';

  return String(value).slice(0, 10);
}

function nullableText(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

export function EmployeeFormModal({
  mode,
  employee = null,
  managerOptions,
  saving,
  onClose,
  onSave,
}: EmployeeFormModalProps) {
  const [form, setForm] =
    useState<EmployeeFormState>(
      initialForm
    );

  const [error, setError] =
    useState('');

  const isEditMode =
    mode === 'edit';

  useEffect(() => {
    if (
      isEditMode &&
      employee
    ) {
      setForm({
        employeeCode:
          employee.employeeCode || '',

        fullName:
          employee.fullName || '',

        preferredName:
          employee.preferredName || '',

        departmentCode:
          employee.departmentCode || '',

        positionCode:
          employee.positionCode || '',

        jobTitle:
          employee.jobTitle || '',

        managerEmployeeId:
          employee.managerEmployeeId
            ? String(
                employee.managerEmployeeId
              )
            : '',

        workEmail:
          employee.workEmail || '',

        personalEmail:
          employee.personalEmail || '',

        phoneNumber:
          employee.phoneNumber || '',

        employmentTypeCode:
          employee.employmentTypeCode || '',

        hireDate:
          toDateInputValue(
            employee.hireDate
          ),

        probationEndDate:
          toDateInputValue(
            employee.probationEndDate
          ),

        terminationDate:
          toDateInputValue(
            employee.terminationDate
          ),

        statusId:
          String(
            employee.statusId ?? 0
          ),
      });
    } else {
      setForm(initialForm);
    }

    setError('');
  }, [
    employee,
    isEditMode,
  ]);

  const availableManagers =
    useMemo(() => {
      const filtered =
        managerOptions.filter(
          (manager) =>
            manager.id !== employee?.id
        );

      if (
        !employee?.managerEmployeeId ||
        filtered.some(
          (manager) =>
            manager.id ===
            employee.managerEmployeeId
        )
      ) {
        return filtered;
      }

      return [
        {
          id:
            employee.managerEmployeeId,

          employeeCode:
            employee.managerEmployeeCode ||
            '',

          fullName:
            employee.managerName ||
            'Quản lý hiện tại',

          departmentCode: null,
          jobTitle: null,
        },
        ...filtered,
      ];
    }, [
      employee,
      managerOptions,
    ]);

  const updateForm = (
    field: keyof EmployeeFormState,
    value: string
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    setError('');
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const employeeCode =
      form.employeeCode
        .trim()
        .toUpperCase();

    const fullName =
      form.fullName.trim();

    const managerEmployeeId =
      form.managerEmployeeId
        ? Number(
            form.managerEmployeeId
          )
        : null;

    const statusId =
      Number(form.statusId);

    if (!employeeCode) {
      setError(
        'Vui lòng nhập mã nhân viên.'
      );

      return;
    }

    if (employeeCode.length > 32) {
      setError(
        'Mã nhân viên không được vượt quá 32 ký tự.'
      );

      return;
    }

    if (!fullName) {
      setError(
        'Vui lòng nhập họ tên nhân viên.'
      );

      return;
    }

    if (
      managerEmployeeId !== null &&
      (
        !Number.isInteger(
          managerEmployeeId
        ) ||
        managerEmployeeId <= 0
      )
    ) {
      setError(
        'Quản lý trực tiếp không hợp lệ.'
      );

      return;
    }

    if (
      ![0, 1].includes(statusId)
    ) {
      setError(
        'Trạng thái nhân viên không hợp lệ.'
      );

      return;
    }

    if (
      form.hireDate &&
      form.probationEndDate &&
      form.probationEndDate <
        form.hireDate
    ) {
      setError(
        'Ngày kết thúc thử việc phải lớn hơn hoặc bằng ngày vào làm.'
      );

      return;
    }

    if (
      form.hireDate &&
      form.terminationDate &&
      form.terminationDate <
        form.hireDate
    ) {
      setError(
        'Ngày nghỉ việc phải lớn hơn hoặc bằng ngày vào làm.'
      );

      return;
    }

    try {
      await onSave({
        employeeCode,
        fullName,

        preferredName:
          nullableText(
            form.preferredName
          ),

        departmentCode:
          nullableText(
            form.departmentCode
          )?.toUpperCase() || null,

        positionCode:
          nullableText(
            form.positionCode
          )?.toUpperCase() || null,

        jobTitle:
          nullableText(
            form.jobTitle
          ),

        managerEmployeeId,

        workEmail:
          nullableText(
            form.workEmail
          )?.toLowerCase() || null,

        personalEmail:
          nullableText(
            form.personalEmail
          )?.toLowerCase() || null,

        phoneNumber:
          nullableText(
            form.phoneNumber
          ),

        employmentTypeCode:
          nullableText(
            form.employmentTypeCode
          )?.toUpperCase() || null,

        hireDate:
          form.hireDate || null,

        probationEndDate:
          form.probationEndDate ||
          null,

        terminationDate:
          form.terminationDate ||
          null,

        statusId,
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Không lưu được nhân viên.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-sm bg-white shadow-xl">
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-800">
              {isEditMode
                ? 'Cập nhật nhân viên'
                : 'Thêm nhân viên'}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isEditMode
                ? 'Cập nhật hồ sơ và trạng thái nhân viên.'
                : 'Khai báo hồ sơ nhân viên mới trong hệ thống.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-xl leading-none text-slate-400 hover:text-slate-700 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Mã nhân viên
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  value={
                    form.employeeCode
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'employeeCode',
                      event.target.value
                    )
                  }
                  placeholder="Ví dụ: NV0001"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Họ tên
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  value={form.fullName}
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'fullName',
                      event.target.value
                    )
                  }
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Tên thường gọi
                </label>

                <input
                  value={
                    form.preferredName
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'preferredName',
                      event.target.value
                    )
                  }
                  placeholder="Văn A"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Quản lý trực tiếp
                </label>

                <select
                  value={
                    form.managerEmployeeId
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'managerEmployeeId',
                      event.target.value
                    )
                  }
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                >
                  <option value="">
                    -- Không có quản lý --
                  </option>

                  {availableManagers.map(
                    (manager) => (
                      <option
                        key={manager.id}
                        value={manager.id}
                      >
                        {manager.employeeCode}
                        {' - '}
                        {manager.fullName}

                        {manager.departmentCode
                          ? ` - ${manager.departmentCode}`
                          : ''}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Phòng ban
                </label>

                <input
                  value={
                    form.departmentCode
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'departmentCode',
                      event.target.value
                    )
                  }
                  placeholder="Ví dụ: IT"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Mã vị trí
                </label>

                <input
                  value={
                    form.positionCode
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'positionCode',
                      event.target.value
                    )
                  }
                  placeholder="Ví dụ: GSD_ENGINEER"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Chức danh
                </label>

                <input
                  value={form.jobTitle}
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'jobTitle',
                      event.target.value
                    )
                  }
                  placeholder="Ví dụ: Kỹ sư GSD"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Loại hình nhân sự
                </label>

                <input
                  value={
                    form.employmentTypeCode
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'employmentTypeCode',
                      event.target.value
                    )
                  }
                  placeholder="Ví dụ: OFFICIAL"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email công việc
                </label>

                <input
                  type="email"
                  value={form.workEmail}
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'workEmail',
                      event.target.value
                    )
                  }
                  placeholder="employee@company.com"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email cá nhân
                </label>

                <input
                  type="email"
                  value={
                    form.personalEmail
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'personalEmail',
                      event.target.value
                    )
                  }
                  placeholder="employee@gmail.com"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Số điện thoại
                </label>

                <input
                  value={
                    form.phoneNumber
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'phoneNumber',
                      event.target.value
                    )
                  }
                  placeholder="0901234567"
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Trạng thái
                </label>

                <select
                  value={form.statusId}
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'statusId',
                      event.target.value
                    )
                  }
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                >
                  <option value="0">
                    Hoạt động
                  </option>

                  <option value="1">
                    Ngừng sử dụng
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Ngày vào làm
                </label>

                <input
                  type="date"
                  value={form.hireDate}
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'hireDate',
                      event.target.value
                    )
                  }
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Kết thúc thử việc
                </label>

                <input
                  type="date"
                  value={
                    form.probationEndDate
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'probationEndDate',
                      event.target.value
                    )
                  }
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Ngày nghỉ việc
                </label>

                <input
                  type="date"
                  value={
                    form.terminationDate
                  }
                  disabled={saving}
                  onChange={(event) =>
                    updateForm(
                      'terminationDate',
                      event.target.value
                    )
                  }
                  className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>

              {error && (
                <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
                  {error}
                </div>
              )}
            </div>
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
              disabled={saving}
              className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Đang lưu...'
                : isEditMode
                  ? 'Cập nhật'
                  : 'Thêm nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}