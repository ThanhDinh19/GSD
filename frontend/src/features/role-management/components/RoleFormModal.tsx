import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import type {
  CreateRolePayload,
  RoleDetail,
  UpdateRolePayload,
} from '../types/roleManagement.type';

type RoleFormMode = 'create' | 'edit';

type RoleFormModalProps = {
  mode: RoleFormMode;
  role?: RoleDetail | null;
  saving: boolean;
  onClose: () => void;
  onSave: (
    payload:
      | CreateRolePayload
      | UpdateRolePayload
  ) => Promise<void>;
};

type RoleFormState = {
  roleCode: string;
  roleName: string;
  description: string;
  roleTypeCode: string;
  priorityNo: string;
  statusId: string;
};

const initialForm: RoleFormState = {
  roleCode: '',
  roleName: '',
  description: '',
  roleTypeCode: 'BUSINESS',
  priorityNo: '100',
  statusId: '0',
};

const roleTypeOptions = [
  {
    value: 'SYSTEM',
    label: 'Hệ thống',
  },
  {
    value: 'BUSINESS',
    label: 'Nghiệp vụ',
  },
  {
    value: 'WORKFLOW',
    label: 'Quy trình',
  },
  {
    value: 'TEMPORARY',
    label: 'Tạm thời',
  },
];

export function RoleFormModal({
  mode,
  role = null,
  saving,
  onClose,
  onSave,
}: RoleFormModalProps) {
  const [form, setForm] =
    useState<RoleFormState>(
      initialForm
    );

  const [error, setError] =
    useState('');

  const isEditMode =
    mode === 'edit';

  const isSystemRole =
    Boolean(role?.isSystemRole);

  useEffect(() => {
    if (
      mode === 'edit' &&
      role
    ) {
      setForm({
        roleCode:
          role.roleCode || '',

        roleName:
          role.roleName || '',

        description:
          role.description || '',

        roleTypeCode:
          role.roleTypeCode ||
          'BUSINESS',

        priorityNo:
          String(
            role.priorityNo ?? 100
          ),

        statusId:
          String(
            role.statusId ?? 0
          ),
      });
    } else {
      setForm(initialForm);
    }

    setError('');
  }, [
    mode,
    role,
  ]);

  const updateForm = (
    field: keyof RoleFormState,
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

    const roleCode =
      form.roleCode
        .trim()
        .toUpperCase();

    const roleName =
      form.roleName.trim();

    const description =
      form.description.trim();

    const priorityNo =
      Number(form.priorityNo);

    const statusId =
      Number(form.statusId);

    if (!roleCode) {
      setError(
        'Vui lòng nhập mã vai trò.'
      );

      return;
    }

    if (!roleName) {
      setError(
        'Vui lòng nhập tên vai trò.'
      );

      return;
    }

    if (
      !Number.isInteger(
        priorityNo
      ) ||
      priorityNo < 0
    ) {
      setError(
        'Độ ưu tiên phải là số nguyên lớn hơn hoặc bằng 0.'
      );

      return;
    }

    try {
      if (isEditMode) {
        await onSave({
          roleCode,
          roleName,
          description:
            description || null,
          roleTypeCode:
            form.roleTypeCode,
          priorityNo,
          statusId,
        });
      } else {
        await onSave({
          roleCode,
          roleName,
          description:
            description || null,
          roleTypeCode:
            form.roleTypeCode,
          priorityNo,
        });
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Không lưu được vai trò.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[620px] overflow-hidden rounded-sm bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold uppercase text-slate-800">
              {isEditMode
                ? 'Cập nhật vai trò'
                : 'Tạo vai trò'}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {isEditMode
                ? 'Cập nhật thông tin vai trò trong hệ thống.'
                : 'Khai báo vai trò mới để cấu hình quyền truy cập.'}
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
        >
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Mã vai trò
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                value={form.roleCode}
                disabled={
                  saving ||
                  isSystemRole
                }
                onChange={(event) =>
                  updateForm(
                    'roleCode',
                    event.target.value
                  )
                }
                placeholder="Ví dụ: GSD_REVIEWER"
                className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-blue-500 disabled:bg-slate-100"
              />

              {isSystemRole && (
                <p className="mt-1 text-xs text-amber-600">
                  Không thể đổi mã vai trò hệ thống.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Tên vai trò
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                value={form.roleName}
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'roleName',
                    event.target.value
                  )
                }
                placeholder="Ví dụ: Người xem xét GSD"
                className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Loại vai trò
              </label>

              <select
                value={
                  form.roleTypeCode
                }
                disabled={
                  saving ||
                  isSystemRole
                }
                onChange={(event) =>
                  updateForm(
                    'roleTypeCode',
                    event.target.value
                  )
                }
                className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              >
                {roleTypeOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Độ ưu tiên
              </label>

              <input
                type="number"
                min={0}
                step={1}
                value={
                  form.priorityNo
                }
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'priorityNo',
                    event.target.value
                  )
                }
                className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              />
            </div>

            {isEditMode && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Trạng thái
                </label>

                <select
                  value={
                    form.statusId
                  }
                  disabled={
                    saving ||
                    isSystemRole
                  }
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
            )}

            <div className={isEditMode ? '' : 'md:col-span-2'}>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Mô tả
              </label>

              <textarea
                rows={4}
                value={
                  form.description
                }
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'description',
                    event.target.value
                  )
                }
                placeholder="Mô tả chức năng và phạm vi sử dụng của vai trò..."
                className="w-full resize-none rounded-sm border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              />
            </div>

            {error && (
              <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 md:col-span-2">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
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
              className="rounded-sm bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? 'Đang lưu...'
                : isEditMode
                  ? 'Cập nhật'
                  : 'Tạo vai trò'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}