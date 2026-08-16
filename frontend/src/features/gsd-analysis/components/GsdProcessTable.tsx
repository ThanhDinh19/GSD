import { useState } from 'react';
import { GsdAnalysisSummary } from '../types/gsdAnalysis.types';
import { getGsdAnalysisImageUrl } from '../services/gsdAnalysis.service';
import { useGsdAnalysis } from '../hooks/useGsdAnalysis';
import {
    usePermissions,
} from '../../../../src/features/auth/hooks/usePermissions';
import {
    SCREEN,
} from '../../../../src/features/auth/constants/permission.constants';

import {
    Button
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
    RefreshCcw
} from 'lucide-react';

interface GsdProcessTableProps {
    analyses: GsdAnalysisSummary[];
    loading?: boolean;

    selectedId?: number | null;
    onRowClick?: (analysisId: number) => void;
    onDetailClick?: (analysisId: number) => void;

    onCreate?: () => void;
    onEdit?: () => void;
    onCopy?: () => void;
    onRefresh?: () => void;

    showActionButtons?: boolean;
}

function formatDateTime(value?: string) {
    if (!value) return '';

    const normalized = value.replace(' ', 'T');
    const [datePart, timePart = ''] = normalized.split('T');

    const [year, month, day] = datePart.split('-');
    const [hour = '00', minute = '00', secondRaw = '00'] =
        timePart.split(':');

    const second = secondRaw.split('.')[0];

    if (!year || !month || !day) return value;

    return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
}


export default function GsdProcessTable({
    analyses,
    loading = false,

    selectedId = null,
    onRowClick,
    onDetailClick,

    onCreate,
    onEdit,
    onCopy,
    onRefresh,

    showActionButtons = true,
}: GsdProcessTableProps) {

    const {
        deactivatingId,
        deactivateGsdAnalysis,
    } = useGsdAnalysis();

    const permissions = usePermissions(SCREEN.GSD_ANALYSIS);
    const columnCount = onDetailClick ? 8 : 7;
    const [previewImageUrl, setPreviewImageUrl] = useState('');


    const handleMoveToTrash =
        async (id: number) => {
            const confirmed = window.confirm(
                'Bạn có chắc muốn chuyển chứng từ này vào thùng rác?'
            );

            if (!confirmed) {
                return;
            }

            try {
                const response =
                    await deactivateGsdAnalysis(id);

                alert(response.message);
            } catch (error) {
                alert(
                    error instanceof Error
                        ? error.message
                        : 'Không thể chuyển vào thùng rác'
                );
            }
        };

    return (
        <div className="bg-white border-slate-200 p-5">
            <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                        Quy trình công đoạn
                    </h2>
                </div>

                {showActionButtons && (
                    <div className="flex items-center gap-2">
                        {permissions.canCreate && onCreate && (
                            <Button
                                variant='primary'
                                onClick={onCreate}
                                size='sm'
                                leftIcon={<Plus className='w-4 h-4' />}
                            >
                                New
                            </Button>
                        )}

                        {permissions.canUpdate && onEdit && (
                            <Button
                                variant='warning'
                                onClick={onEdit}
                                disabled={!selectedId}
                                size='sm'
                                leftIcon={<Edit className='w-4 h-4' />}
                            >
                                Edit
                            </Button>
                        )}

                        {permissions.canCreate && onCopy && (
                            <Button
                                type="button"
                                onClick={onCopy}
                                disabled={!selectedId}
                                size='sm'
                                leftIcon={<Copy className='w-4 h-4' />}
                            >
                                Copy
                            </Button>
                        )}

                        {/* 
                        {permissions.canDelete && (
                            <Button
                                variant='danger'
                                disabled={!selectedId}
                                onClick={() =>
                                    void handleMoveToTrash(Number(selectedId))
                                }
                            >
                                Trash
                            </Button>
                        )} */}

                        {onRefresh && (
                            <Button
                                onClick={onRefresh}
                                disabled={loading}
                                size='sm'
                                leftIcon={<RefreshCcw className='w-4 h-4' />}
                            >
                                {loading ? 'Loading...' : 'Refresh'}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="h-[534px] overflow-auto border border-slate-200 rounded-lg">
                <table className="min-w-[1100px] w-full text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-1.5 border border-slate-200 text-left">
                                STT
                            </th>

                            {onDetailClick && (
                                <th className="px-4 py-1.5 border border-slate-200 text-left">
                                    Bước công việc
                                </th>
                            )}

                            <th className="px-4 py-1.5 border border-slate-200 text-center">
                                Hình ảnh
                            </th>

                            <th className="px-4 py-1.5 border border-slate-200 text-right">
                                Bậc thợ
                            </th>

                            <th className="px-4 py-1.5 border border-slate-200 text-left">
                                Nhu cầu CC+DC, MMTB
                            </th>

                            <th className="px-4 py-1.5 border border-slate-200 text-left">
                                MMTB Code
                            </th>

                            <th className="px-4 py-1.5 border border-slate-200 text-right">
                                Thời gian chuẩn
                            </th>

                            <th className="px-4 py-1.5 border border-slate-200 text-left  whitespace-nowrap">
                                Ngày tạo
                            </th>


                            {/* <th className="px-4 py-3 border border-slate-200 text-center">
                                Chi tiết
                            </th> */}

                        </tr>
                    </thead>

                    <tbody>
                        {loading && (
                            <tr>
                                <td
                                    colSpan={columnCount}
                                    className="px-4 py-6 border border-slate-200 text-center text-slate-400"
                                >
                                    Đang tải quy trình công đoạn...
                                </td>
                            </tr>
                        )}

                        {!loading && analyses.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columnCount}
                                    className="px-4 py-6 border border-slate-200 text-center text-slate-400"
                                >
                                    Chưa có công đoạn nào được phân tích.
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            analyses.map((item, index) => {
                                // const isSelected =
                                //     selectedId === item.id;

                                let isSelected;
                                if (selectedId === item.id) {
                                    isSelected = true;
                                }
                                else {
                                    isSelected = false;
                                }

                                const imageFileName = item.imageFileName || item.imageUrl || '';
                                const imageSrc = getGsdAnalysisImageUrl(imageFileName);

                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() =>
                                            onRowClick?.(item.id)
                                        }
                                        className={`
                                            cursor-pointer
                                            transition-colors
                                            ${isSelected
                                                ? 'bg-blue-100'
                                                : 'bg-white hover:bg-blue-50'
                                            }
                                        `}
                                        title="Chọn công đoạn"
                                    >


                                        <td className="px-4 py-3 border border-slate-200 font-mono text-slate-500 text-sm">
                                            {index + 1}
                                        </td>
                                        {/* 
                                        <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                            {item.operationName}
                                        </td> */}

                                        {onDetailClick && (
                                            <td className="px-4 py-3 border border-slate-200 text-left text-[15px]">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();

                                                        onDetailClick(
                                                            item.id
                                                        );
                                                    }}
                                                    className="text-blue-700 hover:underline"
                                                >
                                                    {item.operationName}
                                                </button>
                                            </td>
                                        )}

                                        <td className="border border-slate-200 px-3 py-2 text-center">
                                            {imageSrc ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImageUrl(imageSrc);
                                                    }}
                                                    className="inline-flex items-center justify-center w-12 h-12 border border-slate-200 rounded-sm bg-slate-50 overflow-hidden hover:ring-2 hover:ring-blue-400"
                                                    title="Xem hình"
                                                >
                                                    <img
                                                        src={imageSrc}
                                                        alt="Hình mã hàng"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-right text-sm">
                                            {item.skillGrade ?? '-'}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                            {item.machineName || '-'}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-slate-700 text-sm">
                                            {item.codeMMTB || '-'}
                                        </td>

                                        <td className="px-4 py-3 border border-slate-200 text-right text-green-700 text-sm">
                                            {Number(
                                                item.finalSmv || 0
                                            ).toFixed(0)}
                                        </td>

                                        <td className="px-4 py-1.5 border border-slate-200 text-slate-500 text-sm whitespace-nowrap">
                                            {formatDateTime(item.createdAt || item.analysisDate)}
                                        </td>

                                        {/* {onDetailClick && (
                                            <td className="px-4 py-3 border border-slate-200 text-center">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();

                                                        onDetailClick(
                                                            item.id
                                                        );
                                                    }}
                                                    className="text-blue-700 font-bold hover:underline"
                                                >
                                                    Xem
                                                </button>
                                            </td>
                                        )} */}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>


            {previewImageUrl && (
                <ImagePreviewModal
                    imageUrl={previewImageUrl}
                    onClose={() => setPreviewImageUrl('')}
                />
            )}
        </div>
    );
}

function ImagePreviewModal({
    imageUrl,
    onClose,
}: {
    imageUrl: string;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-6"
            onClick={onClose} // bấm ngoài ảnh, đóng pop up
        >
            <img
                src={imageUrl}
                alt="Hình mã hàng"
                className="w-[30vw] h-[50vh] object-contain bg-white"
                onClick={(e) => e.stopPropagation()} // bấm vào ảnh ko đóng pop up
            />
        </div>
    );
}