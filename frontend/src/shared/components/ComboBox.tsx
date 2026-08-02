import type {
  SelectHTMLAttributes,
} from 'react';

export type ComboBoxValue =
  | string
  | number;

export type ComboBoxOption = {
  value: ComboBoxValue;
  label: string;
  disabled?: boolean;
};

type ComboBoxProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'onChange'
> & {
  value: ComboBoxValue | null | undefined;

  options: ComboBoxOption[];

  placeholder?: string;

  onValueChange: (
    value: string
  ) => void;

  loading?: boolean;

  error?: string;
};

export function ComboBox({
  value,
  options,
  placeholder = '-- Chọn dữ liệu --',
  onValueChange,
  loading = false,
  error,
  disabled,
  className = '',
  id,
  ...selectProps
}: ComboBoxProps) {
  const isDisabled =
    disabled || loading;

  return (
    <div className="w-full">
      <select
        {...selectProps}
        id={id}
        disabled={isDisabled}
        value={value ?? ''}
        onChange={(event) =>
          onValueChange(
            event.target.value
          )
        }
        className={`
          w-full rounded-lg border
          px-3 py-2 text-sm
          outline-none
          transition-colors

          ${
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-slate-300 focus:border-blue-500'
          }

          ${
            isDisabled
              ? 'cursor-not-allowed bg-slate-100 text-slate-500'
              : 'bg-white text-slate-800'
          }

          ${className}
        `}
      >
        <option value="">
          {loading
            ? 'Đang tải dữ liệu...'
            : placeholder}
        </option>

        {options.map((option) => (
          <option
            key={String(
              option.value
            )}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <div className="mt-1 text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}