import type {
    OperationClusterHeader,
} from '../../operation-cluster/types/operationCluster.types';

import type {
    SewingProcessLine,
} from './sewingProcess.types';


export type OperationClusterPickerOperation = {
    key: string;

    id:
        number |
        string;

    gsdAnalysisId?:
        number |
        null;

    documentId:
        number;

    groupId:
        number |
        string;

    code:
        string;

    name:
        string;

    imageFileName:
        string;

    imageUrl:
        string;

    machineId?:
        number |
        null;

    machineCode?:
        string |
        null;

    machineName:
        string;

    codeMmtb:
        string;

    skillGradeId?:
        number |
        null;

    skillLevel:
        string;

    salaryCoefficient:
        number;

    samGsd:
        number;

    adjustedSam:
        number;

    requiredEfficiency:
        number;

    totalActions:
        number;

    totalActionSeconds:
        number;

    manpower:
        number;

    statusLabel:
        string;

    note?:
        string |
        null;

    raw:
        Record<
            string,
            any
        >;
};


export type OperationClusterPickerCluster = {
    key:
        string;

    id:
        number |
        string;

    lineNo:
        number;

    documentId:
        number;

    documentCode:
        string;

    name:
        string;

    note:
        string;

    statusLabel:
        string;

    inactive:
        boolean;

    requiredEfficiency:
        number;

    operations:
        OperationClusterPickerOperation[];
};


export type OperationClusterPickerCategory = {
    id:
        number;

    code:
        string;

    name:
        string;
};


export type OperationClusterPickerCategoryGroup = {
    id:
        number;

    code:
        string;

    name:
        string;
};


export type OperationClusterPickerDocument = {
    id:
        number;

    documentCode:
        string;

    note:
        string;

    statusLabel:
        string;

    inactive:
        boolean;

    requiredEfficiency:
        number;

    header:
        OperationClusterHeader;

    category:
        OperationClusterPickerCategory;

    group:
        OperationClusterPickerCategoryGroup;

    clusters:
        OperationClusterPickerCluster[];
};


export type OperationClusterPickerContext = {
    document:
        OperationClusterPickerDocument;

    category:
        OperationClusterPickerCategory;

    group:
        OperationClusterPickerCategoryGroup;

    cluster:
        OperationClusterPickerCluster;
};


export type OperationClusterPickerBucket = {
    key:
        string;

    category:
        OperationClusterPickerCategory;

    documents:
        OperationClusterPickerDocument[];
};


export type SelectedOperationClusterItem = {
    operation:
        OperationClusterPickerOperation;

    document:
        OperationClusterPickerDocument;

    cluster:
        OperationClusterPickerCluster;
};


export type OperationClusterTreePickerModalProps = {
    open:
        boolean;

    onClose:
        () => void;

    onConfirm:
        (
            rows:
                SewingProcessLine[]
        ) => void;
};