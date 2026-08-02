import {
    useEffect,
    useState,
} from 'react';

import type {
    OperationClusterHeader,
    OperationClusterDetail,
    OperationClusterPayload,
    GsdOption,
    OperationClusterOperationPayload,
    OperationClusterGroupPayload,
    CreateOperationClusterPayload
} from '../types/operationCluster.type';

import {
    operationClusterService,
} from '../../operation-cluster/services/operationCluster.service';

const initialForm:
    CreateOperationClusterPayload = {
    document_code: '',

    work_id: null,

    product_category_id: null,

    product_category_group_id:
        null,

    required_efficiency: 0,

    price_method: 'GSD',

    note: '',

    status_id: 0,

    // operations: [],

    groups: [],
};

export function useOperationClusters() {
    const [items, setItems] = useState<OperationClusterHeader[]>([]);
    const [selectedItemDetail, setSelectedItemDetail] = useState<OperationClusterDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<CreateOperationClusterPayload>(initialForm);

    const resetForm = () => {
        setForm({
            ...initialForm,
            groups: [],
        });
    };

    const updateForm = <
        K extends keyof CreateOperationClusterPayload
    >(
        key: K,
        value:
            CreateOperationClusterPayload[K]
    ) => {
        setForm((previous) => ({
            ...previous,
            [key]: value,
        }));
    };

    const createOperationCluster = async () => {
       return await operationClusterService.createOperationCluster(form)
    }

    const loadOperationCluster = async () => {
        setLoading(true);

        try {
            const data = await operationClusterService.getOperationCluster();
            setItems(data);
        } finally {
            setLoading(false);
        }
    };

    const loadOperationClusterDetail = async (id: number) => {
        setLoading(true)

        try {
            const data = await operationClusterService.getOperationClusterById(id);
            setSelectedItemDetail(data);
        } finally {
            setLoading(false);
        }
    };

    const refresh = async () => {
        await loadOperationCluster();
    };

    const handleExportExcel = async () => {
        alert("Tính năng này hiện vẫn đang nguyên cứu cách làm !");
    }

    useEffect(() => {
        void loadOperationCluster();
    }, []);

    return {
        items,
        form,
        selectedItemDetail,
        loading,
        setForm,
        updateForm,
        resetForm,
        loadOperationCluster,
        loadOperationClusterDetail,
        refresh,
        handleExportExcel,
        createOperationCluster,
    };
}