import {
    Button,
} from '../../../shared/components';

type OperationClusterToolbarProps = {
    canCreate: boolean;
    canUpdate: boolean;
    canExport: boolean;

    selectedId: number | null;
    loading: boolean;

    onNew: () => void;
    onEdit: () => void;
    onCopy: () => void;
    onExport: () => void;
    onRefresh: () => void;
};

export default function OperationClusterToolbar({
    canCreate,
    canUpdate,
    canExport,
    selectedId,
    loading,
    onNew,
    onEdit,
    onCopy,
    onExport,
    onRefresh,
}: OperationClusterToolbarProps) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div>
                <h1 className="text-lg font-bold uppercase text-slate-800">
                    DANH SÁCH KHO CỤM CÔNG ĐOẠN
                </h1>
            </div>

            <div className="flex items-center gap-2">
                {canCreate && (
                    <Button
                        variant="primary"
                        onClick={onNew}
                    >
                        New
                    </Button>
                )}

                {canUpdate && (
                    <Button
                        variant="warning"
                        onClick={onEdit}
                        disabled={!selectedId}
                    >
                        Edit
                    </Button>
                )}

                {canCreate && (
                    <Button
                        onClick={onCopy}
                    >
                        Copy
                    </Button>
                )}

                {canExport && (
                    <Button
                        onClick={onExport}
                    >
                        Export
                    </Button>
                )}

                <Button
                    onClick={onRefresh}
                    loading={loading}
                    loadingText="Loading..."
                >
                    Refresh
                </Button>
            </div>
        </div>
    );
}