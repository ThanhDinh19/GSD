import JSZip from 'jszip';

import type {
    SewingProcessLine,
    SewingProcessMachineNeed,
    SewingProcessResult,
} from '../types/sewingProcess.types';


const TEMPLATE_PATH =
    `${import.meta.env.BASE_URL}templates/sewing-process-template.xlsx`;

const SHEET_NAME =
    '1-Quy trình';

const FIRST_DATA_ROW = 13;
const LAST_DATA_ROW = 406;

const GROUP_TEMPLATE_ROW = 13;
const OPERATION_TEMPLATE_ROW = 14;
const MACHINE_TEMPLATE_ROW = 13;
const FOOTER_START_ROW = 408;


const PROCESS_COLUMNS = [
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
] as const;


const MACHINE_COLUMNS = [
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
] as const;


type CellValue =
    | string
    | number
    | null
    | undefined;


type CellPatch = {
    value: CellValue;
    style?: string;
};


type PatchPlan =
    Map<
        number,
        Map<string, CellPatch>
    >;


type StyleMap =
    Record<string, string>;


/* =========================================================
   BASIC
   ========================================================= */

function escapeRegExp(
    value: string
) {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );
}
function collapseUnusedRows(
    sheetXml: string,
    lastUsedRow: number
) {
    return sheetXml.replace(
        /<row\b([^>]*)\br="(\d+)"([^>]*)>/g,
        (
            fullTag,
            beforeRow,
            rowValue,
            afterRow
        ) => {
            const rowNumber =
                Number(rowValue);

            const shouldHide =
                rowNumber > lastUsedRow &&
                rowNumber < FOOTER_START_ROW;

            let attributes =
                `${beforeRow} r="${rowValue}"${afterRow}`;

            // Xóa hidden cũ nếu có
            attributes =
                attributes.replace(
                    /\s+hidden="[^"]*"/g,
                    ''
                );

            if (shouldHide) {
                return `<row${attributes} hidden="1">`;
            }

            return `<row${attributes}>`;
        }
    );
}

function escapeXmlText(
    value: string
) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


function toNumber(
    value: unknown,
    fallback = 0
): number {
    const result =
        Number(value);

    return Number.isFinite(result)
        ? result
        : fallback;
}


function nullableNumber(
    value: unknown
): number | null {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return null;
    }

    const result =
        Number(value);

    return Number.isFinite(result)
        ? result
        : null;
}


function toExcelPercent(
    value: unknown
): number | null {
    const result =
        nullableNumber(value);

    if (result === null) {
        return null;
    }

    return Math.abs(result) > 1
        ? result / 100
        : result;
}


function safeFileName(
    value: string
) {
    return String(
        value || 'Sewing-Process'
    )
        .replace(
            /[\\/:*?"<>|]/g,
            '-'
        )
        .trim();
}


function formatDate(
    value?: string | null
) {
    if (!value) {
        return '';
    }

    const isoMatch =
        String(value).match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );

    if (isoMatch) {
        const [
            ,
            year,
            month,
            day,
        ] = isoMatch;

        return `${day}/${month}/${year}`;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return [
        String(
            date.getDate()
        ).padStart(2, '0'),

        String(
            date.getMonth() + 1
        ).padStart(2, '0'),

        date.getFullYear(),
    ].join('/');
}


/* =========================================================
   XLSX PATH
   ========================================================= */

function getAttribute(
    tag: string,
    name: string
): string | null {
    const pattern =
        new RegExp(
            `${escapeRegExp(name)}="([^"]*)"`
        );

    return (
        tag.match(pattern)?.[1] ??
        null
    );
}


function normalizeZipPath(
    target: string
) {
    if (
        target.startsWith('/')
    ) {
        return target.substring(1);
    }

    const parts =
        [
            'xl',
            ...target.split('/'),
        ];

    const normalized:
        string[] = [];

    for (const part of parts) {
        if (
            !part ||
            part === '.'
        ) {
            continue;
        }

        if (part === '..') {
            normalized.pop();
            continue;
        }

        normalized.push(part);
    }

    return normalized.join('/');
}


async function getWorksheetPath(
    zip: JSZip,
    sheetName: string
) {
    const workbookFile =
        zip.file(
            'xl/workbook.xml'
        );

    const relationshipFile =
        zip.file(
            'xl/_rels/workbook.xml.rels'
        );

    if (
        !workbookFile ||
        !relationshipFile
    ) {
        throw new Error(
            'File Excel mẫu không hợp lệ.'
        );
    }


    const workbookXml =
        await workbookFile.async(
            'string'
        );

    const relationshipXml =
        await relationshipFile.async(
            'string'
        );


    const sheetTags =
        workbookXml.match(
            /<sheet\b[^>]*\/>/g
        ) ?? [];


    const sheetTag =
        sheetTags.find(
            (tag) =>
                getAttribute(
                    tag,
                    'name'
                ) === sheetName
        );


    if (!sheetTag) {
        throw new Error(
            `Không tìm thấy sheet "${sheetName}".`
        );
    }


    const relationshipId =
        getAttribute(
            sheetTag,
            'r:id'
        );


    if (!relationshipId) {
        throw new Error(
            `Không xác định được relationship của sheet "${sheetName}".`
        );
    }


    const relationshipTags =
        relationshipXml.match(
            /<Relationship\b[^>]*\/>/g
        ) ?? [];


    const relationship =
        relationshipTags.find(
            (tag) =>
                getAttribute(
                    tag,
                    'Id'
                ) === relationshipId
        );


    if (!relationship) {
        throw new Error(
            `Không xác định được file XML của sheet "${sheetName}".`
        );
    }


    const target =
        getAttribute(
            relationship,
            'Target'
        );


    if (!target) {
        throw new Error(
            `Relationship của sheet "${sheetName}" không có Target.`
        );
    }


    return normalizeZipPath(
        target
    );
}


/* =========================================================
   ROW / CELL XML
   ========================================================= */

function getRowNumber(
    address: string
) {
    return Number(
        address.match(
            /\d+$/
        )?.[0] || 0
    );
}


function getColumnName(
    address: string
) {
    return (
        address.match(
            /^[A-Z]+/i
        )?.[0] || ''
    ).toUpperCase();
}


function columnToNumber(
    column: string
) {
    return column
        .split('')
        .reduce(
            (
                total,
                character
            ) =>
                total * 26 +
                character.charCodeAt(0) -
                64,
            0
        );
}


function getRowXml(
    sheetXml: string,
    rowNumber: number
): string {
    const pattern =
        new RegExp(
            `<row\\b(?=[^>]*\\br="${rowNumber}"(?:\\s|>))[^>]*>[\\s\\S]*?<\\/row>`
        );

    const row =
        sheetXml.match(
            pattern
        )?.[0];

    if (!row) {
        throw new Error(
            `Template thiếu row ${rowNumber}.`
        );
    }

    return row;
}


const CELL_XML_PATTERN =
    /<c\b[^>]*\/>|<c\b[^>]*>[\s\S]*?<\/c>/g;


function getCellXml(
    rowXml: string,
    address: string
): string | null {
    const cells =
        rowXml.match(
            CELL_XML_PATTERN
        ) ?? [];

    return (
        cells.find(
            (cell) =>
                getAttribute(
                    cell,
                    'r'
                ) === address
        ) ?? null
    );
}


function parseCellAttributes(
    cellXml: string | null
) {
    const result:
        Record<string, string> = {};

    if (!cellXml) {
        return result;
    }


    const startTag =
        cellXml.match(
            /^<c\b([^>]*?)(?:\/>|>)/
        )?.[1] ?? '';


    const attributePattern =
        /([A-Za-z_:][A-Za-z0-9_:.-]*)="([^"]*)"/g;


    let match:
        RegExpExecArray | null;


    while (
        (
            match =
            attributePattern.exec(
                startTag
            )
        )
    ) {
        result[
            match[1]
        ] = match[2];
    }


    return result;
}


function buildCellXml(
    existingCellXml: string | null,
    address: string,
    patch: CellPatch
) {
    const attributes =
        parseCellAttributes(
            existingCellXml
        );


    const originalStyle =
        attributes.s;


    const style =
        patch.style !== undefined
            ? patch.style
            : originalStyle;


    delete attributes.r;
    delete attributes.s;
    delete attributes.t;


    const extraAttributes =
        Object.entries(
            attributes
        )
            .map(
                (
                    [
                        name,
                        value,
                    ]
                ) =>
                    ` ${name}="${value}"`
            )
            .join('');


    const styleAttribute =
        style
            ? ` s="${style}"`
            : '';


    const value =
        patch.value;


    /* -------------------------
       BLANK
       ------------------------- */

    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return (
            `<c r="${address}"` +
            styleAttribute +
            extraAttributes +
            '/>'
        );
    }


    /* -------------------------
       NUMBER
       ------------------------- */

    if (
        typeof value ===
        'number'
    ) {
        if (
            !Number.isFinite(value)
        ) {
            return (
                `<c r="${address}"` +
                styleAttribute +
                extraAttributes +
                '/>'
            );
        }

        return (
            `<c r="${address}"` +
            styleAttribute +
            extraAttributes +
            `><v>${value}</v></c>`
        );
    }


    /* -------------------------
       TEXT
       ------------------------- */

    const text =
        String(value);

    const preserveSpace =
        text.trim() !== text ||
        text.includes('\n');


    const spaceAttribute =
        preserveSpace
            ? ' xml:space="preserve"'
            : '';


    return (
        `<c r="${address}"` +
        styleAttribute +
        extraAttributes +
        ` t="inlineStr">` +
        `<is><t${spaceAttribute}>` +
        escapeXmlText(text) +
        `</t></is></c>`
    );
}


function insertCellIntoRow(
    rowXml: string,
    address: string,
    cellXml: string
) {
    const targetColumn =
        columnToNumber(
            getColumnName(
                address
            )
        );

    const cells =
        rowXml.match(
            CELL_XML_PATTERN
        ) ?? [];

    for (const cell of cells) {
        const currentAddress =
            getAttribute(
                cell,
                'r'
            );

        if (!currentAddress) {
            continue;
        }

        const currentColumn =
            columnToNumber(
                getColumnName(
                    currentAddress
                )
            );

        if (
            currentColumn >
            targetColumn
        ) {
            const position =
                rowXml.indexOf(
                    cell
                );

            return (
                rowXml.slice(
                    0,
                    position
                ) +
                cellXml +
                rowXml.slice(
                    position
                )
            );
        }
    }

    return rowXml.replace(
        '</row>',
        `${cellXml}</row>`
    );
}


function patchCellInRow(
    rowXml: string,
    address: string,
    patch: CellPatch
) {
    const existingCell =
        getCellXml(
            rowXml,
            address
        );

    const nextCell =
        buildCellXml(
            existingCell,
            address,
            patch
        );

    if (!existingCell) {
        return insertCellIntoRow(
            rowXml,
            address,
            nextCell
        );
    }

    return rowXml.replace(
        existingCell,
        nextCell
    );
}

function normalizeRowCellOrder(
    rowXml: string
) {
    const match =
        rowXml.match(
            /^(<row\b[^>]*>)([\s\S]*)(<\/row>)$/
        );

    if (!match) {
        return rowXml;
    }

    const [
        ,
        openingTag,
        innerXml,
        closingTag,
    ] = match;

    const cells =
        innerXml.match(
            CELL_XML_PATTERN
        ) ?? [];

    const remainder =
        innerXml.replace(
            CELL_XML_PATTERN,
            ''
        );

    if (remainder.trim()) {
        return rowXml;
    }

    cells.sort(
        (first, second) => {
            const firstAddress =
                getAttribute(
                    first,
                    'r'
                ) ?? '';

            const secondAddress =
                getAttribute(
                    second,
                    'r'
                ) ?? '';

            return (
                columnToNumber(
                    getColumnName(
                        firstAddress
                    )
                ) -
                columnToNumber(
                    getColumnName(
                        secondAddress
                    )
                )
            );
        }
    );

    return (
        openingTag +
        cells.join('') +
        closingTag
    );
}


/* =========================================================
   STYLE
   ========================================================= */

function captureStyles(
    sheetXml: string,
    rowNumber: number,
    columns:
        readonly string[]
): StyleMap {
    const rowXml =
        getRowXml(
            sheetXml,
            rowNumber
        );


    const styles:
        StyleMap = {};


    for (
        const column
        of columns
    ) {
        const address =
            `${column}${rowNumber}`;

        const cell =
            getCellXml(
                rowXml,
                address
            );


        if (!cell) {
            throw new Error(
                `Template thiếu cell ${address}.`
            );
        }


        const style =
            parseCellAttributes(
                cell
            ).s;


        if (!style) {
            throw new Error(
                `Template thiếu style của cell ${address}.`
            );
        }


        styles[column] =
            style;
    }


    return styles;
}


/* =========================================================
   PATCH PLAN
   ========================================================= */

function setPatch(
    plan: PatchPlan,
    address: string,
    value: CellValue,
    style?: string
) {
    const rowNumber =
        getRowNumber(
            address
        );

    const column =
        getColumnName(
            address
        );


    if (
        !rowNumber ||
        !column
    ) {
        throw new Error(
            `Địa chỉ ô không hợp lệ: ${address}`
        );
    }


    let rowPlan =
        plan.get(
            rowNumber
        );


    if (!rowPlan) {
        rowPlan =
            new Map<
                string,
                CellPatch
            >();

        plan.set(
            rowNumber,
            rowPlan
        );
    }


    rowPlan.set(
        column,
        {
            value,
            style,
        }
    );
}


function clearDataArea(
    plan: PatchPlan
) {
    for (
        let row =
            FIRST_DATA_ROW;
        row <=
        LAST_DATA_ROW;
        row += 1
    ) {
        for (
            const column
            of PROCESS_COLUMNS
        ) {
            setPatch(
                plan,
                `${column}${row}`,
                null
            );
        }


        for (
            const column
            of MACHINE_COLUMNS
        ) {
            setPatch(
                plan,
                `${column}${row}`,
                null
            );
        }
    }
}


/* =========================================================
   HEADER
   ========================================================= */

function planHeader(
    plan: PatchPlan,
    data: SewingProcessResult
) {
    const header =
        data.header;


    const customer =
        [
            header.customerCode,
            header.customerName,
        ]
            .filter(Boolean)
            .join(' - ');


    setPatch(
        plan,
        'D3',
        customer
    );

    setPatch(
        plan,
        'D4',
        header.itemCode ?? ''
    );

    setPatch(
        plan,
        'D5',
        header.productionLine ?? ''
    );

    setPatch(
        plan,
        'D6',
        nullableNumber(
            header.productionRound
        )
    );

    setPatch(
        plan,
        'D7',
        nullableNumber(
            header.manpower
        )
    );

    setPatch(
        plan,
        'D8',
        nullableNumber(
            header.productionManpower
        )
    );

    setPatch(
        plan,
        'D9',
        nullableNumber(
            header.workingHours
        )
    );


    setPatch(
        plan,
        'I3',
        nullableNumber(
            header.quantity
        )
    );


    setPatch(
        plan,
        'H2',
        header.issuedDate
            ? `Ngày ban hành:\n${formatDate(
                header.issuedDate
            )}`
            : 'Ngày ban hành:'
    );


    setPatch(
        plan,
        'J2',
        header.effectiveDate
            ? `Ngày áp dụng:\n${formatDate(
                header.effectiveDate
            )}`
            : 'Ngày áp dụng:'
    );
}


/* =========================================================
   SUMMARY
   ========================================================= */

function planSummary(
    plan: PatchPlan,
    data: SewingProcessResult
) {
    const summary =
        data.summary;

    const lines =
        Array.isArray(
            data.lines
        )
            ? data.lines
            : [];


    const totalTime =
        toNumber(
            summary.totalTime
        );


    const taktTime =
        toNumber(
            summary.taktTime
        );


    setPatch(
        plan,
        'I4',
        totalTime
    );


    setPatch(
        plan,
        'J4',
        toNumber(
            summary.c1,
            totalTime / 60
        )
    );


    setPatch(
        plan,
        'K4',
        toNumber(
            summary.totalSamGsd
        )
    );


    setPatch(
        plan,
        'I5',
        taktTime
    );


    setPatch(
        plan,
        'J5',
        toNumber(
            summary.c3,
            taktTime / 60
        )
    );


    setPatch(
        plan,
        'K5',
        toNumber(
            summary.c4
        )
    );


    setPatch(
        plan,
        'I6',
        toNumber(
            summary.standardOutput
        )
    );


    setPatch(
        plan,
        'J6',
        toNumber(
            summary.c5
        )
    );


    setPatch(
        plan,
        'K6',
        toNumber(
            summary.c6
        )
    );


    setPatch(
        plan,
        'I7',
        toNumber(
            summary.totalStandardPrice
        )
    );


    setPatch(
        plan,
        'I8',
        toNumber(
            summary.totalPriceByOutput
        )
    );


    setPatch(
        plan,
        'I9',
        toNumber(
            summary.averagePrice
        )
    );


    const requiredEfficiency =
        lines.find(
            (line) =>
                line.requiredEfficiency !==
                null &&
                line.requiredEfficiency !==
                undefined
        )?.requiredEfficiency;


    setPatch(
        plan,
        'K12',
        toExcelPercent(
            requiredEfficiency
        )
    );


    const totalAdjustedSam =
        lines.reduce(
            (
                total,
                line
            ) =>
                total +
                toNumber(
                    line.adjustedSam
                ),
            0
        );


    setPatch(
        plan,
        'L12',
        totalAdjustedSam ||
        totalTime
    );


    const totalUsedEfficiency =
        lines.reduce(
            (
                total,
                line
            ) =>
                total +
                (
                    toExcelPercent(
                        line.usedEfficiency
                    ) ?? 0
                ),
            0
        );


    setPatch(
        plan,
        'P10',
        totalUsedEfficiency
    );
}


/* =========================================================
   PROCESS ROWS
   ========================================================= */

function planProcessLines(
    plan: PatchPlan,
    lines: SewingProcessLine[],
    groupStyles: StyleMap,
    operationStyles: StyleMap
) {
    let excelRow =
        FIRST_DATA_ROW;

    let previousClusterKey =
        '';


    for (
        const line
        of lines
    ) {
        const clusterName =
            String(
                line.clusterName ?? ''
            ).trim();


        const clusterKey =
            clusterName
                .trim()
                .toUpperCase();


        /* -------------------------
           GROUP
           ------------------------- */

        if (
            clusterName &&
            clusterKey !==
            previousClusterKey
        ) {
            if (
                excelRow >
                LAST_DATA_ROW
            ) {
                throw new Error(
                    'Số dòng quy trình vượt quá giới hạn template.'
                );
            }


            for (
                const column
                of PROCESS_COLUMNS
            ) {
                setPatch(
                    plan,
                    `${column}${excelRow}`,
                    column === 'C'
                        ? clusterName
                        : null,
                    groupStyles[
                    column
                    ]
                );
            }


            excelRow += 1;

            previousClusterKey =
                clusterKey;
        }


        /* -------------------------
           OPERATION
           ------------------------- */

        if (
            excelRow >
            LAST_DATA_ROW
        ) {
            throw new Error(
                'Số dòng quy trình vượt quá giới hạn template.'
            );
        }


        const rowValues:
            Record<
                string,
                CellValue
            > = {
            B:
                nullableNumber(
                    line.lineNo
                ),

            C:
                line.operationName ??
                '',

            D:
                nullableNumber(
                    line.skillGradeLevel
                ),

            E:
                line.machineName ??
                '',

            F:
                line.machineCode ??
                '',

            G:
                nullableNumber(
                    line.samGsd
                ),

            H:
                nullableNumber(
                    line.salaryCoefficient
                ),

            I:
                nullableNumber(
                    line.laborCount
                ),

            J:
                nullableNumber(
                    line.standardPrice
                ),

            K:
                toExcelPercent(
                    line.requiredEfficiency
                ),

            L:
                nullableNumber(
                    line.adjustedSam
                ),

            M:
                line.sewingEmployee ??
                '',

            N:
                nullableNumber(
                    line.cbcTime
                ),

            O:
                line.note ??
                '',

            P:
                toExcelPercent(
                    line.usedEfficiency
                ),
        };


        for (
            const column
            of PROCESS_COLUMNS
        ) {
            setPatch(
                plan,
                `${column}${excelRow}`,
                rowValues[
                column
                ],
                operationStyles[
                column
                ]
            );
        }


        excelRow += 1;
    }
    return excelRow - 1;
}


/* =========================================================
   MACHINE NEED
   ========================================================= */

function planMachineNeeds(
    plan: PatchPlan,
    machineNeeds:
        SewingProcessMachineNeed[],
    machineStyles:
        StyleMap
) {
    machineNeeds.forEach(
        (
            machine,
            index
        ) => {
            const row =
                FIRST_DATA_ROW +
                index;


            if (
                row >
                LAST_DATA_ROW
            ) {
                throw new Error(
                    'Số dòng nhu cầu MMTB vượt quá giới hạn template.'
                );
            }


            const rowValues:
                Record<
                    string,
                    CellValue
                > = {
                R:
                    index + 1,

                S:
                    machine.machineCode ??
                    '',

                T:
                    machine.machineName ??
                    '',

                U:
                    nullableNumber(
                        machine.machineNeed
                    ),

                V:
                    nullableNumber(
                        machine.machineQuantity
                    ),

                W:
                    toExcelPercent(
                        machine.usedEfficiency
                    ),
            };


            for (
                const column
                of MACHINE_COLUMNS
            ) {
                setPatch(
                    plan,
                    `${column}${row}`,
                    rowValues[
                    column
                    ],
                    machineStyles[
                    column
                    ]
                );
            }
        }
    );
    return machineNeeds.length > 0
        ? FIRST_DATA_ROW +
        machineNeeds.length -
        1
        : FIRST_DATA_ROW - 1;
}


/* =========================================================
   APPLY PLAN
   ========================================================= */

function applyPatchPlan(
    sheetXml: string,
    plan: PatchPlan
) {
    const touchedRows =
        new Set<number>();


    const nextXml =
        sheetXml.replace(
            /<row\b(?=[^>]*\br="\d+"(?:\s|>))[^>]*>[\s\S]*?<\/row>/g,
            (
                rowXml
            ) => {
                const rowNumber =
                    Number(
                        rowXml.match(
                            /\br="(\d+)"/
                        )?.[1]
                    );


                const rowPlan =
                    plan.get(
                        rowNumber
                    );


                if (!rowPlan) {
                    return rowXml;
                }


                touchedRows.add(
                    rowNumber
                );


                let nextRowXml =
                    rowXml;


                for (
                    const [
                        column,
                        patch,
                    ]
                    of rowPlan
                ) {
                    nextRowXml =
                        patchCellInRow(
                            nextRowXml,
                            `${column}${rowNumber}`,
                            patch
                        );
                }

                return normalizeRowCellOrder(
                    nextRowXml
                );
            }
        );


    for (
        const rowNumber
        of plan.keys()
    ) {
        if (
            !touchedRows.has(
                rowNumber
            )
        ) {
            throw new Error(
                `Template thiếu row ${rowNumber}.`
            );
        }
    }


    return nextXml;
}


/* =========================================================
   CALC CHAIN
   ========================================================= */

async function removeCalcChain(
    zip: JSZip
) {
    /* -------------------------
       REMOVE FILE
       ------------------------- */

    zip.remove(
        'xl/calcChain.xml'
    );


    /* -------------------------
       REMOVE RELATIONSHIP
       ------------------------- */

    const relationshipPath =
        'xl/_rels/workbook.xml.rels';


    const relationshipFile =
        zip.file(
            relationshipPath
        );


    if (relationshipFile) {
        let xml =
            await relationshipFile.async(
                'string'
            );


        xml =
            xml.replace(
                /<Relationship\b(?=[^>]*\bTarget="calcChain\.xml")[^>]*\/>/g,
                ''
            );


        zip.file(
            relationshipPath,
            xml
        );
    }


    /* -------------------------
       REMOVE CONTENT TYPE
       ------------------------- */

    const contentTypesFile =
        zip.file(
            '[Content_Types].xml'
        );


    if (contentTypesFile) {
        let xml =
            await contentTypesFile.async(
                'string'
            );


        xml =
            xml.replace(
                /<Override\b(?=[^>]*\bPartName="\/xl\/calcChain\.xml")[^>]*\/>/g,
                ''
            );


        zip.file(
            '[Content_Types].xml',
            xml
        );
    }


    /* -------------------------
       FORCE RECALC
       ------------------------- */

    const workbookFile =
        zip.file(
            'xl/workbook.xml'
        );


    if (workbookFile) {
        let xml =
            await workbookFile.async(
                'string'
            );


        const calcPrPattern =
            /<calcPr\b([^>]*)\/>/;


        if (
            calcPrPattern.test(
                xml
            )
        ) {
            xml =
                xml.replace(
                    calcPrPattern,
                    (
                        _match,
                        attributes:
                            string
                    ) => {
                        const cleanAttributes =
                            attributes.replace(
                                /\s+(calcMode|fullCalcOnLoad|forceFullCalc|calcOnSave)="[^"]*"/g,
                                ''
                            );


                        return (
                            `<calcPr${cleanAttributes}` +
                            ` calcMode="auto"` +
                            ` fullCalcOnLoad="1"` +
                            ` forceFullCalc="1"` +
                            ` calcOnSave="1"/>`
                        );
                    }
                );
        } else {
            xml =
                xml.replace(
                    '</workbook>',
                    '<calcPr calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1" calcOnSave="1"/></workbook>'
                );
        }


        zip.file(
            'xl/workbook.xml',
            xml
        );
    }
}


/* =========================================================
   DOWNLOAD
   ========================================================= */

function downloadBlob(
    blob: Blob,
    fileName: string
) {
    const url =
        URL.createObjectURL(
            blob
        );


    const anchor =
        document.createElement(
            'a'
        );


    anchor.href =
        url;

    anchor.download =
        fileName;


    document.body.appendChild(
        anchor
    );


    anchor.click();


    anchor.remove();


    window.setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        1000
    );
}


/* =========================================================
   EXPORT
   ========================================================= */

export async function exportSewingProcessExcel(
    data: SewingProcessResult
) {
    /* -------------------------------------------------------
       1. LOAD TEMPLATE
       ------------------------------------------------------- */

    const response =
        await fetch(
            TEMPLATE_PATH,
            {
                cache: 'no-store',
            }
        );


    if (!response.ok) {
        throw new Error(
            `Không tải được file mẫu Excel (${response.status}).`
        );
    }


    const buffer =
        await response.arrayBuffer();


    /* -------------------------------------------------------
       2. OPEN XLSX AS ZIP
       ------------------------------------------------------- */

    const zip =
        await JSZip.loadAsync(
            buffer
        );


    /* -------------------------------------------------------
       3. FIND MAIN SHEET
       ------------------------------------------------------- */

    const worksheetPath =
        await getWorksheetPath(
            zip,
            SHEET_NAME
        );


    const worksheetFile =
        zip.file(
            worksheetPath
        );


    if (!worksheetFile) {
        throw new Error(
            `Không đọc được ${worksheetPath}.`
        );
    }


    const originalSheetXml =
        await worksheetFile.async(
            'string'
        );


    /* -------------------------------------------------------
       4. CAPTURE ORIGINAL TEMPLATE STYLES
       ------------------------------------------------------- */

    const groupStyles =
        captureStyles(
            originalSheetXml,
            GROUP_TEMPLATE_ROW,
            PROCESS_COLUMNS
        );


    const operationStyles =
        captureStyles(
            originalSheetXml,
            OPERATION_TEMPLATE_ROW,
            PROCESS_COLUMNS
        );


    const machineStyles =
        captureStyles(
            originalSheetXml,
            MACHINE_TEMPLATE_ROW,
            MACHINE_COLUMNS
        );


    /* -------------------------------------------------------
       5. BUILD PATCH PLAN
       ------------------------------------------------------- */

    const plan:
        PatchPlan =
        new Map();


    clearDataArea(
        plan
    );


    planHeader(
        plan,
        data
    );


    planSummary(
        plan,
        data
    );


    const lastProcessRow =
        planProcessLines(
            plan,
            Array.isArray(data.lines)
                ? data.lines
                : [],
            groupStyles,
            operationStyles
        );

    const lastMachineRow =
        planMachineNeeds(
            plan,
            Array.isArray(data.machineNeeds)
                ? data.machineNeeds
                : [],
            machineStyles
        );

    const lastUsedRow =
        Math.max(
            lastProcessRow,
            lastMachineRow,
            FIRST_DATA_ROW
        );


    /* -------------------------------------------------------
       6. PATCH ORIGINAL XML DIRECTLY
  
       KHÔNG:
       - DOMParser
       - XMLSerializer
       - mergeCells
       - ExcelJS
  
       => giữ nguyên toàn bộ XML/template gốc.
       ------------------------------------------------------- */

    let nextSheetXml =
        applyPatchPlan(
            originalSheetXml,
            plan
        );

    nextSheetXml =
        collapseUnusedRows(
            nextSheetXml,
            lastUsedRow
        );


    zip.file(
        worksheetPath,
        nextSheetXml
    );


    /* -------------------------------------------------------
       7. REMOVE OLD CALC CHAIN
       ------------------------------------------------------- */

    await removeCalcChain(
        zip
    );


    /* -------------------------------------------------------
       8. BUILD XLSX
       ------------------------------------------------------- */

    const outputBlob =
        await zip.generateAsync({
            type: 'blob',

            compression:
                'DEFLATE',

            compressionOptions: {
                level: 6,
            },

            mimeType:
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });


    /* -------------------------------------------------------
       9. DOWNLOAD
       ------------------------------------------------------- */

    const documentCode =
        safeFileName(
            data.header
                .documentCode ||
            'Sewing-Process'
        );


    downloadBlob(
        outputBlob,
        `Bang-quy-trinh-${documentCode}.xlsx`
    );
}