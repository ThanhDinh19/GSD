import {
    Button,
} from '../../../shared/components';
import {
  Plus,
  Trash2,
  Save,
  Download,
  RefreshCw,
  Search,
  Pencil,
  Edit,
  Copy,
  Import,
  FileDown,
  RefreshCcw,
  X
} from 'lucide-react';

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
            {/* <div>
                <h1 className="text-lg font-bold uppercase text-slate-800">
                    DANH SÁCH KHO CỤM CÔNG ĐOẠN
                </h1>
            </div> */}

            <div className="flex items-center gap-2">
                {canCreate && (
                    <Button
                        variant="primary"
                        onClick={onNew}
                        size='sm'
                        leftIcon={<Plus className='w-4 h-4'/>}
                    >
                        New
                    </Button>
                )}

                {canUpdate && (
                    <Button
                        variant="warning"
                        onClick={onEdit}
                        disabled={!selectedId}
                        size='sm'
                        leftIcon={<Edit className='w-4 h-4'/>}
                    >
                        Edit
                    </Button>
                )}

                {canCreate && (
                    <Button
                        onClick={onCopy}
                        size='sm'
                        leftIcon={<Copy className='w-4 h-4'/>}
                    >
                        Copy
                    </Button>
                )}

                {canExport && (
                    <Button
                        onClick={onExport}
                        size='sm'
                        leftIcon={<FileDown className='w-4 h-4'/>}
                    >
                        Export
                    </Button>
                )}

                <Button
                    onClick={onRefresh}
                    loading={loading}
                    loadingText="Loading..."
                    size='sm'
                    leftIcon={<RefreshCcw className='w-4 h-4'/>}
                >
                    Refresh
                </Button>
            </div>
        </div>
    );
}