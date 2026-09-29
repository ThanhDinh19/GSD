/**
 * Bảng quy đổi Mức độ phức tạp (%) -> Bậc thợ.
 *
 * Mức Độ | Bậc
 *   0%   |  1
 *   3%   |  2
 *   6%   |  2
 *   9%   |  3
 *  12%   |  3
 *  15%   |  4
 *  18%   |  4
 *  21%   |  5
 *  24%   |  5
 *  27%   |  6
 *  30%   |  6
 */
export const LABOR_GRADE_BY_DIFFICULTY: {
    difficultyPercent: number;
    laborGrade: number;
}[] = [
    { difficultyPercent: 0, laborGrade: 1 },
    { difficultyPercent: 3, laborGrade: 2 },
    { difficultyPercent: 6, laborGrade: 2 },
    { difficultyPercent: 9, laborGrade: 3 },
    { difficultyPercent: 12, laborGrade: 3 },
    { difficultyPercent: 15, laborGrade: 4 },
    { difficultyPercent: 18, laborGrade: 4 },
    { difficultyPercent: 21, laborGrade: 5 },
    { difficultyPercent: 24, laborGrade: 5 },
    { difficultyPercent: 27, laborGrade: 6 },
    { difficultyPercent: 30, laborGrade: 6 },
];

/** Danh sách % cho dropdown "Mức độ phức tạp". */
export const DIFFICULTY_PERCENT_OPTIONS =
    LABOR_GRADE_BY_DIFFICULTY.map((item) => item.difficultyPercent);

/**
 * Lấy bậc thợ theo mức độ phức tạp.
 * Giá trị không nằm đúng trong bảng sẽ lấy theo mốc gần nhất phía dưới
 * (dữ liệu cũ 5% / 10% / 20% vẫn quy đổi được).
 */
export function getLaborGradeByDifficulty(
    value: number | null | undefined
): number {
    const percent = Number(value);

    if (value === null || value === undefined || Number.isNaN(percent) || percent <= 0) {
        return LABOR_GRADE_BY_DIFFICULTY[0].laborGrade;
    }

    let matched = LABOR_GRADE_BY_DIFFICULTY[0];

    for (const item of LABOR_GRADE_BY_DIFFICULTY) {
        if (percent >= item.difficultyPercent) {
            matched = item;
        }
    }

    return matched.laborGrade;
}
