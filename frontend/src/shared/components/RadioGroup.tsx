import type { ReactNode } from 'react';

export type RadioValue = string | number;

export type RadioOption<T extends RadioValue = string> = {
  value: T;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

type RadioGroupProps<T extends RadioValue> = {
  name: string;
  value: T | null | undefined;
  options: RadioOption<T>[];
  onValueChange: (value: T) => void;

  label?: ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  direction?: 'horizontal' | 'vertical';
  className?: string;
};

export function RadioGroup<T extends RadioValue>({
  name,
  value,
  options,
  onValueChange,
  label,
  error,
  disabled = false,
  required = false,
  direction = 'horizontal',
  className = '',
}: RadioGroupProps<T>) {
  return (
    <fieldset className={className} disabled={disabled}>
      {label && (
        <legend className="mb-2 text-xs font-semibold text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </legend>
      )}

      <div className={direction === 'horizontal' ? 'flex flex-wrap items-center gap-4' : 'flex flex-col gap-2'}>
        {options.map((option, index) => {
          const id = `${name}-${index}`;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={String(option.value)}
              htmlFor={id}
              className={`flex items-start gap-2 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={String(option.value)}
                checked={value === option.value}
                disabled={isDisabled}
                onChange={() => onValueChange(option.value)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-blue-600"
              />

              <span>
                <span className="block text-sm font-medium text-slate-700">
                  {option.label}
                </span>

                {option.description && (
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </fieldset>
  );
}