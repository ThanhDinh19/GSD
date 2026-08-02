const { createHttpError } =
    require('./httpError');

function parsePositiveId(value, fieldName = 'ID') {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        throw createHttpError(
            400,
            `${fieldName} không hợp lệ.`,
            'INVALID_ID'
        );
    }

    return id;
}

function requiredString(
    value,
    fieldName,
    maxLength = null
) {
    const text = String(value || '').trim();

    if (!text) {
        throw createHttpError(
            400,
            `${fieldName} là bắt buộc.`,
            'REQUIRED_FIELD'
        );
    }

    if (
        maxLength &&
        text.length > maxLength
    ) {
        throw createHttpError(
            400,
            `${fieldName} không được vượt quá ${maxLength} ký tự.`,
            'MAX_LENGTH_EXCEEDED'
        );
    }

    return text;
}

function optionalString(
    value,
    maxLength = null
) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null;
    }

    const text = String(value).trim();

    if (
        maxLength &&
        text.length > maxLength
    ) {
        throw createHttpError(
            400,
            `Giá trị không được vượt quá ${maxLength} ký tự.`,
            'MAX_LENGTH_EXCEEDED'
        );
    }

    return text;
}

module.exports = {
    parsePositiveId,
    requiredString,
    optionalString,
};