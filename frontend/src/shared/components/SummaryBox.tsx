import {
  formatSummaryMoney,
  formatSummaryNumber,
} from '../../shared/utils/formatters';

type SummaryBoxProps = {
  label: string;
  formula?: string;
  value: number | null | undefined;
  money?: boolean;
  digits?: number;
};

export function SummaryBox({
  label,
  formula,
  value,
  money = false,
  digits = 2,
}: SummaryBoxProps) {
  const displayValue = money
    ? formatSummaryMoney(value, digits)
    : formatSummaryNumber(value, digits);

  return (
    <div className="min-h-[74px] rounded-sm border border-slate-200 bg-slate-50 p-2">
      <div className="flex items-center gap-2">
        <div className="font-semibold leading-snug text-slate-500">
          {label}
        </div>

        {formula && (
          <div className="group relative">
            <button
              type="button"
              aria-label={formula}
              className="
                flex h-4 w-4 shrink-0
                cursor-help items-center
                justify-center rounded-full
                border border-slate-400
                text-[10px] font-bold
                text-slate-500
              "
            >
              ?
            </button>

            <div
              className="
                invisible absolute bottom-full
                left-1/2 z-50 mb-2
                w-max max-w-[280px]
                -translate-x-1/2
                rounded bg-slate-800
                px-3 py-2 text-xs
                font-normal leading-snug
                text-white opacity-0 shadow-lg
                pointer-events-none
                group-hover:visible
                group-hover:opacity-100
                group-focus-within:visible
                group-focus-within:opacity-100
              "
            >
              {formula}

              <div
                className="
                  absolute left-1/2 top-full
                  -translate-x-1/2
                  border-4 border-transparent
                  border-t-slate-800
                "
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-1 break-words font-bold text-slate-800">
        {displayValue}
      </div>
    </div>
  );
}