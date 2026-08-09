import {
    useEffect,
} from 'react';

import type {
    OperationClusterFormState,
    OperationClusterGroupPayload,
} from '../types/operationCluster.types';

import {
    DEFAULT_OPERATION_CLUSTER_FORM,
    OPERATION_CLUSTER_DRAFT_KEY,
} from '../model/operationCluster.constants';

export type OperationClusterDraft = {
    form:
        OperationClusterFormState;

    groups:
        OperationClusterGroupPayload[];

    activeGroupIndex:
        number;

    viewAllGroups:
        boolean;
};

export function readOperationClusterDraft():
    OperationClusterDraft | null {
    try {
        const raw =
            localStorage.getItem(
                OPERATION_CLUSTER_DRAFT_KEY
            );

        if (!raw) {
            return null;
        }

        const parsed =
            JSON.parse(raw);

        return {
            form: {
                ...DEFAULT_OPERATION_CLUSTER_FORM,
                ...(parsed.form || {}),
            },

            groups:
                Array.isArray(
                    parsed.groups
                )
                    ? parsed.groups
                    : [],

            activeGroupIndex:
                Number(
                    parsed
                        .activeGroupIndex ||
                        0
                ),

            viewAllGroups:
                Boolean(
                    parsed
                        .viewAllGroups
                ),
        };
    } catch {
        return null;
    }
}

export function clearOperationClusterDraft() {
    localStorage.removeItem(
        OPERATION_CLUSTER_DRAFT_KEY
    );
}

export function useSaveOperationClusterDraft(
    draft: OperationClusterDraft
) {
    useEffect(() => {
        localStorage.setItem(
            OPERATION_CLUSTER_DRAFT_KEY,
            JSON.stringify(draft)
        );
    }, [
        draft.form,
        draft.groups,
        draft.activeGroupIndex,
        draft.viewAllGroups,
    ]);
}