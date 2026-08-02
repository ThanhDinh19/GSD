
type MetricTone =
  | 'blue'
  | 'orange'
  | 'amber'
  | 'green'
  | 'emerald';

export function MetricCard({
  label,
  subLabel = null,
  value,
  tone = 'blue',
  emphasis = false,
}: {
  label: string;
  subLabel?: string | null;
  value: string | number;
  tone?: MetricTone;
  emphasis?: boolean;
}) {
  const toneClasses: Record<
    MetricTone,
    {
      card: string;
      label: string;
      value: string;
    }
  > = {
    blue: {
      card:
        'bg-blue-50 border-blue-100',
      label:
        'text-blue-600',
      value:
        'text-blue-900',
    },

    orange: {
      card:
        'bg-orange-50 border-orange-100',
      label:
        'text-orange-600',
      value:
        'text-orange-900',
    },

    amber: {
      card:
        'bg-amber-50 border-amber-100',
      label:
        'text-amber-600',
      value:
        'text-amber-900',
    },

    green: {
      card:
        'bg-green-50 border-green-100',
      label:
        'text-green-600',
      value:
        'text-green-900',
    },

    emerald: {
      card:
        'bg-emerald-50 border-emerald-100',
      label:
        'text-emerald-600',
      value:
        'text-emerald-900',
    },
  };

  const classes =
    toneClasses[tone];

  return (
    <div
      className={`
        rounded-lg border p-3
        ${classes.card}
        ${
          emphasis
            ? 'ring-2 ring-emerald-100'
            : ''
        }
      `}
    >
      <div
        className={`
          flex items-center gap-2
          ${classes.label}
        `}
      >
        <span>
          {label}
        </span>

        {subLabel && (
          <div className="group relative">
            <button
              type="button"
              aria-label={subLabel}
              className="
                flex h-4 w-4
                items-center justify-center
                rounded-full
                border border-current
                text-[9px] font-bold
                opacity-60
                hover:opacity-100
              "
            >
              ?
            </button>

            <div
              className="
                invisible absolute
                bottom-full left-1/2
                z-50 mb-2
                w-max max-w-[250px]
                -translate-x-1/2
                rounded-lg bg-slate-900
                px-3 py-2
                text-[11px] font-normal
                leading-4 text-white
                opacity-0 shadow-lg
                transition
                group-hover:visible
                group-hover:opacity-100
                group-focus-within:visible
                group-focus-within:opacity-100
              "
            >
              {subLabel}

              <span
                className="
                  absolute left-1/2 top-full
                  -translate-x-1/2
                  border-4 border-transparent
                  border-t-slate-900
                "
              />
            </div>
          </div>
        )}
      </div>

      <div
        className={`
          mt-1 font-black
          ${classes.value}
          ${
            emphasis
              ? 'text-xl'
              : 'text-lg'
          }
        `}
      >
        {value}
      </div>
    </div>
  );
}