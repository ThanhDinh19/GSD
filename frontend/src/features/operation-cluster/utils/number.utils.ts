export function toNumber(
    value: unknown,
    defaultValue = 0
) {
    const numberValue =
        Number(value);

    return Number.isFinite(
        numberValue
    )
        ? numberValue
        : defaultValue;
}

export function normalizeDecimalInput(
    value: string
) {
    const normalized =
        value.replace(',', '.');

    if (
        !/^\d*\.?\d*$/.test(
            normalized
        )
    ) {
        return null;
    }

    return normalized;
}