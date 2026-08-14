const XLSX = require('xlsx');

const {
    calculateSewingProcess,
} = require('./sewingProcess.service');


const COLUMN_RULES = [
    {
        aliases: [
            'STT',
            'NO',
        ],
        field: 'lineNo',
        type: 'integer',
        saveInput: true,
    },

    {
        aliases: [
            'BUOC CONG VIEC',
            'TYPE OF OPERATION',
            'TYPE OF OPERERATION',
        ],
        field: 'operationName',
        type: 'string',
        required: true,
        maxLength: 200,
        saveInput: true,
    },

    {
        aliases: [
            'BAC THO',
            'LEVEL',
        ],
        field: 'skillGradeLevel',
        type: 'integer',
        saveInput: true,
    },

    {
        aliases: [
            'NHU CAU CC+DC,MMTB',
            'NHU CAU CC + DC, MMTB',
            'KIND MACHINES',
        ],
        field: 'machineName',
        type: 'string',
        maxLength: 200,
        saveInput: true,
    },

    {
        aliases: [
            'CODE MMTB',
        ],
        field: 'machineCode',
        type: 'string',
        maxLength: 32,
        saveInput: true,
    },

    {
        aliases: [
            'THOI GIAN CHUAN',
            'SMV TIME',
        ],
        field: 'samGsd',
        type: 'decimal',
        saveInput: true,
    },

    {
        aliases: [
            'HE SO BAC THO',
            'WORKER RANK',
        ],
        field: 'salaryCoefficient',
        type: 'decimal',
        saveInput: true,
    },

    {
        aliases: [
            'NHAN SU',
            'PERSON',
        ],
        field: 'laborCount',
        type: 'decimal',
        calculated: true,
        saveInput: false,
    },

    {
        aliases: [
            'DON GIA CHUAN',
            'PRICE',
        ],
        field: 'standardPrice',
        type: 'decimal',
        calculated: true,
        saveInput: false,
    },

    {
        aliases: [
            'HIEU SUAT YEU CAU',
        ],
        field: 'requiredEfficiency',
        type: 'percent',
        saveInput: true,
    },

    {
        aliases: [
            'SAM THEO HS YEU CAU',
        ],
        field: 'adjustedSam',
        type: 'decimal',
        calculated: true,
        saveInput: false,
    },

    {
        aliases: [
            'NHAN SU MAY CD',
            'NAME',
        ],
        field: 'sewingEmployee',
        type: 'string',
        maxLength: 200,
        saveInput: true,
    },

    {
        aliases: [
            'THOI GIAN CBC',
        ],
        field: 'cbcTime',
        type: 'decimal',
        saveInput: true,
    },

    {
        aliases: [
            'GHI CHU',
            'NOTE',
        ],
        field: 'note',
        type: 'string',
        maxLength: 200,
        saveInput: true,
    },
];


function normalizeText(value) {
    return String(
        value ?? ''
    )
        .normalize('NFD')
        .replace(
            /[\u0300-\u036f]/g,
            ''
        )
        .replace(
            /đ/g,
            'd'
        )
        .replace(
            /Đ/g,
            'D'
        )
        .replace(
            /\s+/g,
            ' '
        )
        .trim()
        .toUpperCase();
}


function findColumnRule(title) {
    const normalizedTitle =
        normalizeText(title);

    if (!normalizedTitle) {
        return null;
    }

    return COLUMN_RULES.find(
        (rule) =>
            rule.aliases.some(
                (alias) =>
                    normalizeText(alias) ===
                    normalizedTitle
            )
    ) || null;
}


function isEmptyValue(value) {
    return (
        value === null ||
        value === undefined ||
        String(value).trim() === ''
    );
}


function isEmptyRow(row) {
    return !row.some(
        (value) =>
            !isEmptyValue(value)
    );
}


function parseNumber(value) {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null;
    }

    if (
        typeof value === 'number'
    ) {
        return Number.isFinite(value)
            ? value
            : null;
    }

    let text =
        String(value)
            .trim()
            .replace(
                /\s/g,
                ''
            )
            .replace(
                /%$/,
                ''
            );

    if (!text) {
        return null;
    }

    const commaIndex =
        text.lastIndexOf(',');

    const dotIndex =
        text.lastIndexOf('.');

    if (
        commaIndex >= 0 &&
        dotIndex >= 0
    ) {
        if (
            commaIndex >
            dotIndex
        ) {
            text =
                text
                    .replace(
                        /\./g,
                        ''
                    )
                    .replace(
                        ',',
                        '.'
                    );
        } else {
            text =
                text.replace(
                    /,/g,
                    ''
                );
        }
    } else if (
        commaIndex >= 0
    ) {
        text =
            text.replace(
                ',',
                '.'
            );
    }

    const result =
        Number(text);

    return Number.isFinite(result)
        ? result
        : null;
}


function normalizePercent(value) {
    const numberValue =
        parseNumber(value);

    if (
        numberValue === null
    ) {
        return null;
    }

    if (
        numberValue <= 0
    ) {
        return null;
    }

    if (
        numberValue > 100
    ) {
        return null;
    }

    if (
        numberValue > 1
    ) {
        return numberValue / 100;
    }

    return numberValue;
}


function validateValue(
    value,
    rule
) {
    if (!rule) {
        return null;
    }

    if (
        isEmptyValue(value)
    ) {
        if (rule.required) {
            return 'Không được để trống.';
        }

        return null;
    }

    if (
        rule.type === 'integer'
    ) {
        const numberValue =
            parseNumber(value);

        if (
            numberValue === null ||
            !Number.isInteger(
                numberValue
            )
        ) {
            return 'Phải là số nguyên.';
        }
    }

    if (
        rule.type === 'decimal'
    ) {
        if (
            parseNumber(value) ===
            null
        ) {
            return 'Phải là số.';
        }
    }

    if (
        rule.type === 'percent'
    ) {
        if (
            normalizePercent(
                value
            ) === null
        ) {
            return 'Hiệu suất phải lớn hơn 0 và không vượt quá 100%.';
        }
    }

    if (
        rule.type === 'string' &&
        rule.maxLength
    ) {
        if (
            String(value).length >
            rule.maxLength
        ) {
            return `Tối đa ${rule.maxLength} ký tự.`;
        }
    }

    return null;
}


function normalizeValue(
    value,
    rule
) {
    if (!rule) {
        return value ?? null;
    }

    if (
        isEmptyValue(value)
    ) {
        return null;
    }

    if (
        rule.type === 'integer'
    ) {
        const numberValue =
            parseNumber(value);

        return numberValue === null
            ? null
            : Math.trunc(
                numberValue
            );
    }

    if (
        rule.type === 'decimal'
    ) {
        return parseNumber(
            value
        );
    }

    if (
        rule.type === 'percent'
    ) {
        return normalizePercent(
            value
        );
    }

    return String(value).trim();
}


function detectHeaderRow(rows) {
    let bestIndex = -1;
    let bestScore = 0;

    const limit =
        Math.min(
            rows.length,
            15
        );

    for (
        let rowIndex = 0;
        rowIndex < limit;
        rowIndex += 1
    ) {
        const row =
            rows[rowIndex] || [];

        let score = 0;

        for (
            const value
            of row
        ) {
            if (
                findColumnRule(
                    value
                )
            ) {
                score += 1;
            }
        }

        if (
            score >
            bestScore
        ) {
            bestScore = score;
            bestIndex = rowIndex;
        }
    }

    if (
        bestIndex < 0 ||
        bestScore < 2
    ) {
        const error =
            new Error(
                'Không xác định được dòng tiêu đề trong file Excel.'
            );

        error.statusCode = 400;

        throw error;
    }

    return bestIndex;
}


function isMetadataRow(
    row,
    columns
) {
    const operationColumn =
        columns.find(
            (column) =>
                column.field ===
                'operationName'
        );

    if (
        !operationColumn
    ) {
        return false;
    }

    const operationValue =
        row[
            operationColumn.sourceIndex
        ];

    const normalized =
        normalizeText(
            operationValue
        );

    return (
        normalized ===
            'TYPE OF OPERATION' ||
        normalized ===
            'TYPE OF OPERERATION'
    );
}


function isGroupRow(
    row,
    columns
) {
    const operationColumn =
        columns.find(
            (column) =>
                column.field ===
                'operationName'
        );

    if (
        !operationColumn
    ) {
        return false;
    }

    const value =
        row[
            operationColumn.sourceIndex
        ];

    const normalized =
        normalizeText(
            value
        );

    return (
        normalized === 'CUM' ||
        normalized.startsWith(
            'CUM '
        )
    );
}


function buildColumns(
    headerRow,
    rows
) {
    const maxColumnCount =
        Math.max(
            headerRow.length,
            ...rows.map(
                (row) =>
                    row.length
            )
        );

    let unknownIndex = 0;

    const columns = [];

    for (
        let index = 0;
        index < maxColumnCount;
        index += 1
    ) {
        const rawTitle =
            headerRow[index];

        const title =
            isEmptyValue(rawTitle)
                ? `Unknown_${++unknownIndex}`
                : String(
                    rawTitle
                ).trim();

        const rule =
            findColumnRule(
                rawTitle
            );

        columns.push({
            key:
                `col_${index}`,

            title,

            sourceIndex:
                index,

            mapped:
                Boolean(rule),

            field:
                rule?.field ??
                null,

            dataType:
                rule?.type ??
                'unknown',

            calculated:
                Boolean(
                    rule?.calculated
                ),

            saveInput:
                Boolean(
                    rule?.saveInput
                ),
        });
    }

    return columns;
}


function buildOperationRow({
    row,
    excelRow,
    columns,
    clusterNo,
    clusterName,
    defaultLineNo,
}) {
    const values = {};
    const errors = {};
    const normalizedInput = {};

    for (
        const column
        of columns
    ) {
        const rawValue =
            row[
                column.sourceIndex
            ];

        values[
            column.key
        ] =
            rawValue ??
            null;

        const rule =
            findColumnRule(
                column.title
            );

        if (!rule) {
            continue;
        }

        const error =
            validateValue(
                rawValue,
                rule
            );

        if (error) {
            errors[
                column.key
            ] = error;

            continue;
        }

        if (
            rule.saveInput
        ) {
            normalizedInput[
                rule.field
            ] =
                normalizeValue(
                    rawValue,
                    rule
                );
        }
    }


    if (
        !normalizedInput.lineNo
    ) {
        normalizedInput.lineNo =
            defaultLineNo;
    }

    normalizedInput.lineOrder =
        defaultLineNo;

    normalizedInput.clusterNo =
        clusterNo || null;

    normalizedInput.clusterName =
        clusterName || null;


    const isValid =
        Object.keys(
            errors
        ).length === 0;


    return {
        excelRow,

        rowType:
            'DATA',

        clusterNo:
            clusterNo || null,

        clusterName:
            clusterName || null,

        values,

        errors,

        normalizedInput,

        isValid,

        checked:
            isValid,
    };
}


function buildGroupRow({
    row,
    excelRow,
    columns,
    clusterNo,
    clusterName,
}) {
    const values = {};

    for (
        const column
        of columns
    ) {
        values[
            column.key
        ] =
            row[
                column.sourceIndex
            ] ??
            null;
    }

    return {
        excelRow,

        rowType:
            'GROUP',

        clusterNo,

        clusterName,

        values,

        errors: {},

        normalizedInput:
            null,

        isValid:
            true,

        checked:
            false,
    };
}


function applyCalculatedValues(
    previewRows,
    calculatedLines,
    columns
) {
    const dataRows =
        previewRows.filter(
            (row) =>
                row.rowType ===
                'DATA'
        );

    const calculatedColumns =
        columns.filter(
            (column) =>
                column.calculated
        );

    dataRows.forEach(
        (
            row,
            index
        ) => {
            const calculatedLine =
                calculatedLines[
                    index
                ];

            if (
                !calculatedLine
            ) {
                return;
            }

            row.calculated = {
                laborCount:
                    calculatedLine
                        .laborCount,

                standardPrice:
                    calculatedLine
                        .standardPrice,

                adjustedSam:
                    calculatedLine
                        .adjustedSam,

                usedEfficiency:
                    calculatedLine
                        .usedEfficiency,
            };

            for (
                const column
                of calculatedColumns
            ) {
                if (
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            calculatedLine,
                            column.field
                        )
                ) {
                    row.calculated[
                        column.field
                    ] =
                        calculatedLine[
                            column.field
                        ];
                }
            }
        }
    );
}


function canCalculate(
    header,
    rows
) {
    if (
        !header ||
        typeof header !==
            'object'
    ) {
        return false;
    }

    const productionManpower =
        parseNumber(
            header.productionManpower ??
            header.production_manpower
        );

    const workingHours =
        parseNumber(
            header.workingHours ??
            header.working_hours
        );

    const dataRows =
        rows.filter(
            (row) =>
                row.rowType ===
                'DATA'
        );

    return (
        productionManpower > 0 &&
        workingHours > 0 &&
        dataRows.length > 0 &&
        dataRows.every(
            (row) =>
                row.isValid
        )
    );
}


async function previewSewingProcessImport(
    fileBuffer,
    header = {}
) {
    if (
        !fileBuffer ||
        !Buffer.isBuffer(
            fileBuffer
        )
    ) {
        const error =
            new Error(
                'Không có file Excel để đọc.'
            );

        error.statusCode = 400;

        throw error;
    }


    const workbook =
        XLSX.read(
            fileBuffer,
            {
                type:
                    'buffer',

                cellDates:
                    true,

                raw:
                    true,
            }
        );


    const sheetName =
        workbook.SheetNames[0];

    if (!sheetName) {
        const error =
            new Error(
                'File Excel không có worksheet.'
            );

        error.statusCode = 400;

        throw error;
    }


    const worksheet =
        workbook.Sheets[
            sheetName
        ];


    const rows =
        XLSX.utils
            .sheet_to_json(
                worksheet,
                {
                    header: 1,

                    defval:
                        null,

                    raw:
                        true,

                    blankrows:
                        true,
                }
            );


    if (
        !Array.isArray(rows) ||
        rows.length === 0
    ) {
        const error =
            new Error(
                'File Excel không có dữ liệu.'
            );

        error.statusCode = 400;

        throw error;
    }


    const headerRowIndex =
        detectHeaderRow(
            rows
        );


    const headerRow =
        rows[
            headerRowIndex
        ] || [];


    const columns =
        buildColumns(
            headerRow,
            rows
        );


    const previewRows = [];

    let currentClusterNo = 0;
    let currentClusterName =
        null;

    let lineNumber = 0;


    for (
        let rowIndex =
            headerRowIndex + 1;

        rowIndex <
            rows.length;

        rowIndex += 1
    ) {
        const row =
            rows[
                rowIndex
            ] || [];


        if (
            isEmptyRow(
                row
            )
        ) {
            continue;
        }


        if (
            isMetadataRow(
                row,
                columns
            )
        ) {
            continue;
        }


        const excelRow =
            rowIndex + 1;


        if (
            isGroupRow(
                row,
                columns
            )
        ) {
            const operationColumn =
                columns.find(
                    (column) =>
                        column.field ===
                        'operationName'
                );


            currentClusterNo += 1;

            currentClusterName =
                String(
                    row[
                        operationColumn
                            .sourceIndex
                    ] ?? ''
                ).trim();


            previewRows.push(
                buildGroupRow({
                    row,
                    excelRow,
                    columns,
                    clusterNo:
                        currentClusterNo,
                    clusterName:
                        currentClusterName,
                })
            );


            continue;
        }


        lineNumber += 1;


        previewRows.push(
            buildOperationRow({
                row,
                excelRow,
                columns,

                clusterNo:
                    currentClusterNo,

                clusterName:
                    currentClusterName,

                defaultLineNo:
                    lineNumber,
            })
        );
    }


    const dataRows =
        previewRows.filter(
            (row) =>
                row.rowType ===
                'DATA'
        );


    let calculation =
        null;

    let calculationError =
        null;


    if (
        canCalculate(
            header,
            previewRows
        )
    ) {
        try {
            const payload = {
                ...header,

                lines:
                    dataRows.map(
                        (row) =>
                            row.normalizedInput
                    ),
            };


            calculation =
                calculateSewingProcess(
                    payload
                );


            applyCalculatedValues(
                previewRows,
                calculation.lines,
                columns
            );

        } catch (error) {
            calculationError =
                error instanceof Error
                    ? error.message
                    : 'Không tính được dữ liệu import.';
        }
    }


    const invalidRows =
        dataRows.filter(
            (row) =>
                !row.isValid
        );


    return {
        sheetName,

        headerRow:
            headerRowIndex + 1,

        columns,

        rows:
            previewRows,

        summary: {
            totalRows:
                dataRows.length,

            validRows:
                dataRows.length -
                invalidRows.length,

            invalidRows:
                invalidRows.length,

            checkedRows:
                dataRows.filter(
                    (row) =>
                        row.checked
                ).length,
        },

        calculation:
            calculation
                ? {
                    summary:
                        calculation.summary,

                    machineNeeds:
                        calculation.machineNeeds,
                }
                : null,

        calculationError,
    };
}


module.exports = {
    previewSewingProcessImport,
};