import type {
    OperationClusterGroupPayload,
} from '../../../types';

/**
 * Chuyển một giá trị bất kỳ sang number.
 *
 * Nếu value không thể chuyển thành số hợp lệ
 * thì trả về defaultValue.
 */
export function toNumber(
    value: unknown,
    defaultValue = 0
): number {
    const numberValue =
        Number(value);

    return Number.isFinite(
        numberValue
    )
        ? numberValue
        : defaultValue;
}

/**
 * Chuẩn hóa input số thập phân.
 *
 * Cho phép user nhập:
 * ""
 * "."
 * "0."
 * "0.8"
 * "0.75"
 * "1"
 * "1.25"
 *
 * Nếu nhập dấu "," thì tự chuyển sang "."
 *
 * Nếu ký tự không hợp lệ thì trả về null.
 */
export function normalizeDecimalInput(
    value: string
): string | null {
    const nextValue =
        value.replace(',', '.');

    if (
        !/^\d*\.?\d*$/.test(
            nextValue
        )
    ) {
        return null;
    }

    return nextValue;
}

/**
 * Tạo một cụm công đoạn mới.
 */
export function createEmptyGroup():
    OperationClusterGroupPayload {
    return {
        line_no: 0,
        cluster_name: '',
        operations: [],
    };
}

/**
 * Đánh lại STT của các cụm.
 *
 * Ví dụ:
 * [
 *   { line_no: 5 },
 *   { line_no: 9 }
 * ]
 *
 * =>
 *
 * [
 *   { line_no: 1 },
 *   { line_no: 2 }
 * ]
 */
export function renumberGroups(
    items:
        OperationClusterGroupPayload[]
):
    OperationClusterGroupPayload[] {
    return items.map(
        (
            group,
            index
        ) => ({
            ...group,

            line_no:
                index + 1,
        })
    );
}