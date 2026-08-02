import type {
  ReactNode,
} from 'react';

type TitleTextProps = {
  title: ReactNode;
  text: ReactNode;

  hint?: string;

  className?: string;
  titleClassName?: string;
  textClassName?: string;
};

export function TitleText({
  title,
  text,
  hint,
  className = '',
  titleClassName = '',
  textClassName = '',
}: TitleTextProps) {
  return (
    <div
      className={`
        min-h-[74px]
        rounded-sm
        border border-slate-200
        bg-slate-50
        p-2

        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        <div
          className={`
            font-semibold
            leading-snug
            text-slate-500

            ${titleClassName}
          `}
        >
          {title}
        </div>

        {hint && (
          <div className="group relative">
            <button
              type="button"
              aria-label={hint}
              className="
                flex h-4 w-4
                shrink-0 cursor-help
                items-center justify-center
                rounded-full
                border border-slate-400
                text-[10px] font-bold
                text-slate-500
              "
            >
              ?
            </button>

            <div
              role="tooltip"
              className="
                pointer-events-none
                invisible absolute
                bottom-full left-1/2
                z-50 mb-2
                w-max max-w-[280px]
                -translate-x-1/2
                rounded bg-slate-800
                px-3 py-2
                text-xs font-normal
                leading-snug text-white
                opacity-0 shadow-lg

                group-hover:visible
                group-hover:opacity-100
                group-focus-within:visible
                group-focus-within:opacity-100
              "
            >
              {hint}

              <div
                className="
                  absolute left-1/2
                  top-full
                  -translate-x-1/2
                  border-4
                  border-transparent
                  border-t-slate-800
                "
              />
            </div>
          </div>
        )}
      </div>

      <div
        className={`
          mt-1 break-words
          font-bold text-slate-800

          ${textClassName}
        `}
      >
        {text || '-'}
      </div>
    </div>
  );
}