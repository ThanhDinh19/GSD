export interface GsdAnalysisImage {
    id?: number;
    imageUrl?: string;
    imageFileName?: string;
    note?: string | null;
    createdAt?: string;
    updatedAt?: string | null;
}


export interface SourceActionForAnalysis {
    sourceActionDetailId: number;
    lineNo: number;

    gsdCodeId?: number | null;

    actionName: string;

    gsdCode?: string | null;
    codeNew?: string | null;

    frequency?: number | null;

    tmu: number;

    note?: string | null;
}


export interface GsdAnalysisDetailPayload {
    sourceActionDetailId?:
        number | null;

    gsdCodeId?:
        number | null;

    gsdCode?:
        string | null;

    actionName:
        string;

    tmu:
        number;

    frequency:
        number;

    stepNo?:
        number | null;

    note?:
        string | null;

    isSelected?:
        boolean;
}


export interface GsdAnalysisPayload {
    sourceId?:
        number | null;

    machineId?:
        number | null;

    operationName:
        string;

    seamLength?:
        number | null;

    attachedActionTime?:
        number | null;

    stitchCount?:
        number | null;

    allowance?:
        number | null;

    machineSpeed?:
        number | null;

    difficultyPercent?:
        number | null;

    productMultiplier?:
        number | null;

    note?:
        string | null;

    details:
        GsdAnalysisDetailPayload[];

    images:
        GsdAnalysisImage[];
}


export interface GsdAnalysisCalculateResult {
    totalTmu:
        number;

    totalManualSeconds:
        number;

    machineSeconds:
        number;

    totalSmvBeforeDifficulty:
        number;

    difficultySeconds:
        number;

    finalSmv:
        number;

    skillGrade:
        number;

    stitchCount?:
        number;

    machineSpeed?:
        number;

    machineVelocity?:
        number;

    allowance?:
        number;

    details:
        Array<
            GsdAnalysisDetailPayload & {
                lineNo:
                    number;

                seconds:
                    number;
            }
        >;

    machine?: {
        id:
            number;

        machineCode:
            string;

        machineName:
            string;

        codeMMTB:
            string;

        stitchCount?:
            number | null;

        machineSpeed?:
            number | null;

        allowance?:
            number | null;

        skillGrade?:
            string | null;
    } | null;
}


export interface GsdAnalysisRow
    extends Omit<
        SourceActionForAnalysis,
        | 'sourceActionDetailId'
        | 'frequency'
    > {
    sourceActionDetailId?:
        number | null;

    sourceId?:
        number | null;

    sourceCode?:
        string;

    sourceName?:
        string | null;

    stepNo?:
        number |
        string |
        null;

    frequency:
        number;

    isSelected:
        boolean;
}


export interface GsdAnalysisSummary {
    id:
        number;

    analysisNo:
        string;

    analysisDate?:
        string;

    operationName:
        string;

    sourceCode?:
        string | null;

    machineCode?:
        string | null;

    machineName?:
        string | null;

    codeMMTB?:
        string | null;

    totalTmu:
        number;

    totalManualSeconds:
        number;

    machineSeconds:
        number;

    totalSmvBeforeDifficulty:
        number;

    difficultySeconds:
        number;

    finalSmv:
        number;

    skillGrade?:
        number | null;

    imageUrl?:
        string | null;

    imageFileName?:
        string | null;

    createdAt?:
        string;
}


export interface GsdAnalysisDetailRow {
    id:
        number;

    analysisId:
        number;

    lineNo:
        number;

    stepNo?:
        number | null;

    sourceActionDetailId?:
        number | null;

    gsdCodeId?:
        number | null;

    gsdCode?:
        string | null;

    actionName:
        string;

    tmu:
        number;

    frequency:
        number;

    seconds:
        number;

    note?:
        string | null;

    isSelected?:
        boolean;
}


export interface GsdAnalysisDetail
    extends GsdAnalysisSummary {
    sourceId?:
        number | null;

    sourceName?:
        string | null;

    machineId?:
        number | null;

    seamLength?:
        number | null;

    attachedActionTime?:
        number | null;

    difficultyPercent?:
        number | null;

    productMultiplier?:
        number | null;

    stitchCount?:
        number | null;

    machineSpeed?:
        number | null;

    machineVelocity?:
        number | null;

    allowance?:
        number | null;

    note?:
        string | null;

    updatedAt?:
        string | null;

    details:
        GsdAnalysisDetailRow[];
}

export interface DeactivateResponse {
  message?: string;
}