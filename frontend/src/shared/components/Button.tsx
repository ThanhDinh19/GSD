import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

type ButtonVariant =
  | 'default'
  | 'primary'
  | 'danger'
  | 'warning'
  | 'success';

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
  };

const variantClasses: Record<
  ButtonVariant,
  string
> = {
  default:
    'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',

  primary:
    'border-blue-600 bg-blue-600 text-white hover:bg-blue-700',

  danger:
    'border-red-600 bg-red-600 text-white hover:bg-red-700',

  warning:
    'border-amber-500 bg-amber-500 text-white hover:bg-amber-600',

  success:
    'border-green-700 bg-green-700 text-white hover:bg-green-800',
};

const sizeClasses: Record<
  ButtonSize,
  string
> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function Button({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  loadingText = 'Đang xử lý...',
  disabled,
  className = '',
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  const isDisabled =
    disabled || loading;

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-sm
        border
        font-medium
        transition-colors

        ${variantClasses[variant]}
        ${sizeClasses[size]}

        disabled:cursor-not-allowed
        disabled:opacity-50

        ${className}
      `}
    >
      {loading ? loadingText : children}
    </button>
  );
}