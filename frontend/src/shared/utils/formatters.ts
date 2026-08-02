export function formatNumber(
  value: number | null | undefined,
  digits = 4
): string {
  return Number(value || 0)
    .toFixed(digits);
}

export function formatSummaryNumber(
  value: number | null | undefined,
  digits = 2
): string {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return '-';
  }

  return new Intl.NumberFormat(
    'vi-VN',
    {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }
  ).format(Number(value));
}

export function formatSummaryMoney(
  value: number | null | undefined,
  digits = 2
): string {
  const formatted =
    formatSummaryNumber(
      value,
      digits
    );

  return formatted === '-'
    ? '-'
    : `${formatted} VND`;
}

export function numberInputValue(
  value: number | null | undefined
): number | '' {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return value;
}

export function dateInputValue(
  value: string | null | undefined
): string {
  if (!value) {
    return '';
  }

  return String(value)
    .slice(0, 10);
}

export function toNumberOrNull(
  value: string
): number | null {
  if (value === '') {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}


export function toNumber(value: unknown, defaultValue = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : defaultValue;
}