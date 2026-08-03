import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastOptions = {
  duration?: number;
};

type ToastContextValue = {
  success: (
    message: string,
    options?: ToastOptions
  ) => void;

  error: (
    message: string,
    options?: ToastOptions
  ) => void;

  warning: (
    message: string,
    options?: ToastOptions
  ) => void;

  info: (
    message: string,
    options?: ToastOptions
  ) => void;

  remove: (id: string) => void;
};

type ToastProviderProps = {
  children: ReactNode;
};

const DEFAULT_DURATION = 3500;

const ToastContext =
  createContext<ToastContextValue | null>(
    null
  );

const toastStyles: Record<
  ToastType,
  {
    wrapper: string;
    icon: string;
    symbol: string;
    title: string;
  }
> = {
  success: {
    wrapper:
      'border-green-200 bg-green-50 text-green-800',
    icon:
      'bg-green-100 text-green-700',
    symbol: '✓',
    title: 'Thành công',
  },

  error: {
    wrapper:
      'border-red-200 bg-red-50 text-red-800',
    icon:
      'bg-red-100 text-red-700',
    symbol: '×',
    title: 'Có lỗi xảy ra',
  },

  warning: {
    wrapper:
      'border-amber-200 bg-amber-50 text-amber-800',
    icon:
      'bg-amber-100 text-amber-700',
    symbol: '!',
    title: 'Cảnh báo',
  },

  info: {
    wrapper:
      'border-blue-200 bg-blue-50 text-blue-800',
    icon:
      'bg-blue-100 text-blue-700',
    symbol: 'i',
    title: 'Thông báo',
  },
};

function createToastId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export function ToastProvider({
  children,
}: ToastProviderProps) {
  const [toasts, setToasts] =
    useState<ToastItem[]>([]);

  const timersRef = useRef<
    Map<string, number>
  >(new Map());

  const remove = useCallback(
    (id: string) => {
      setToasts((previous) =>
        previous.filter(
          (toast) => toast.id !== id
        )
      );

      const timerId =
        timersRef.current.get(id);

      if (timerId) {
        window.clearTimeout(timerId);
        timersRef.current.delete(id);
      }
    },
    []
  );

  const show = useCallback(
    (
      type: ToastType,
      message: string,
      options: ToastOptions = {}
    ) => {
      const normalizedMessage =
        message.trim();

      if (!normalizedMessage) {
        return;
      }

      const id = createToastId();

      setToasts((previous) => [
        ...previous,
        {
          id,
          type,
          message: normalizedMessage,
        },
      ]);

      const duration =
        options.duration ??
        DEFAULT_DURATION;

      if (duration > 0) {
        const timerId =
          window.setTimeout(() => {
            remove(id);
          }, duration);

        timersRef.current.set(
          id,
          timerId
        );
      }
    },
    [remove]
  );

  useEffect(() => {
    return () => {
      for (
        const timerId
        of timersRef.current.values()
      ) {
        window.clearTimeout(timerId);
      }

      timersRef.current.clear();
    };
  }, []);

  const value =
    useMemo<ToastContextValue>(
      () => ({
        success: (
          message,
          options
        ) => {
          show(
            'success',
            message,
            options
          );
        },

        error: (
          message,
          options
        ) => {
          show(
            'error',
            message,
            options
          );
        },

        warning: (
          message,
          options
        ) => {
          show(
            'warning',
            message,
            options
          );
        },

        info: (
          message,
          options
        ) => {
          show(
            'info',
            message,
            options
          );
        },

        remove,
      }),
      [
        remove,
        show,
      ]
    );

  return (
    <ToastContext.Provider
      value={value}
    >
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col gap-3">
        {toasts.map((toast) => {
          const style =
            toastStyles[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-sm border px-4 py-3 shadow-lg ${style.wrapper}`}
              role="alert"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold ${style.icon}`}
              >
                {style.symbol}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">
                  {style.title}
                </p>

                <p className="mt-1 break-words text-sm">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  remove(toast.id)
                }
                className="shrink-0 text-lg leading-none opacity-60 hover:opacity-100"
                aria-label="Đóng thông báo"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context =
    useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast phải được sử dụng bên trong ToastProvider.'
    );
  }

  return context;
}