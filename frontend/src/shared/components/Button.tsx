import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

type ButtonVariant =
  | 'default'
  | 'primary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'ghost';

type ButtonSize =
  | 'sm'
  | 'md'
  | 'lg';

type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;

    variant?: ButtonVariant;
    size?: ButtonSize;

    loading?: boolean;
    loadingText?: string;

    leftIcon?: ReactNode;
    rightIcon?: ReactNode;

    fullWidth?: boolean;
  };

const variantClasses: Record<ButtonVariant, string> = {
  default: `
    border-slate-300
    bg-white
    text-slate-700
    hover:bg-slate-50
    hover:border-slate-400
    active:bg-slate-100
  `,

  primary: `
    border-blue-700
    bg-blue-700
    text-white
    hover:bg-blue-800
    hover:border-blue-800
    active:bg-blue-900
  `,

  danger: `
    border-red-600
    bg-red-600
    text-white
    hover:bg-red-700
    hover:border-red-700
    active:bg-red-800
  `,

  warning: `
    border-amber-500
    bg-amber-500
    text-white
    hover:bg-amber-600
    hover:border-amber-600
    active:bg-amber-700
  `,

  success: `
    border-emerald-700
    bg-emerald-700
    text-white
    hover:bg-emerald-800
    hover:border-emerald-800
    active:bg-emerald-900
  `,

  ghost: `
    border-transparent
    bg-transparent
    text-slate-600
    hover:bg-slate-100
    hover:text-slate-900
    active:bg-slate-200
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  // ERP thường cần compact
  sm: 'h-8 px-3 text-xs',

  // Default cho form / toolbar
  md: 'h-9 px-4 text-sm',

  // CTA hoặc dialog quan trọng
  lg: 'h-10 px-5 text-sm',
};

export function Button({
  children,

  variant = 'default',
  size = 'md',

  loading = false,
  loadingText = 'Đang xử lý...',

  leftIcon,
  rightIcon,

  fullWidth = false,

  disabled,
  className = '',

  type = 'button',

  ...buttonProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2

        whitespace-nowrap
        select-none

        rounded-md
        border

        font-medium
        leading-none

        transition-colors
        duration-150

        outline-none

        focus-visible:ring-2
        focus-visible:ring-blue-500/40
        focus-visible:ring-offset-1

        disabled:pointer-events-none
        disabled:opacity-50

        ${variantClasses[variant]}
        ${sizeClasses[size]}

        ${fullWidth ? 'w-full' : ''}

        ${className}
      `}
    >
      {loading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />

            <path
              className="opacity-75"
              fill="currentColor"
              d="
                M4 12
                a8 8 0 018-8
                v4
                a4 4 0 00-4 4
                H4z
              "
            />
          </svg>

          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span
              className="shrink-0 flex items-center"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <span>{children}</span>

          {rightIcon && (
            <span
              className="shrink-0 flex items-center"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
}