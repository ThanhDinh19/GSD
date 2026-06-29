import { useState } from 'react';
import GsdAnalysisPage from './GsdAnalysisPage';
import GsdProcessTable from '../components/gsd-analysis/GsdProcessTable';
import { useGsdOverview } from '../hooks/useGsdOverview';
import { GsdAnalysisDetail } from '../types';
import { gsdAnalysisService } from '../services/gsdAnalysis.service';
import GsdAnalysisDetailModal from '../components/gsd-analysis/GsdAnalysisDetailModal';

type WorkTab = 'analysis' | 'process';

export default function GsdOverviewPage() {
    const {
        analyses,
        loading,
        stats,
        loadAnalyses,
    } = useGsdOverview();

    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<WorkTab>('analysis');
    const [selectedAnalysis, setSelectedAnalysis] = useState<GsdAnalysisDetail | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const openNewOperationWorkspace = () => {
        setIsWorkspaceOpen(true);
        setActiveTab('analysis');
    };

    const handleOpenAnalysisDetail = async (analysisId: number) => {
        setLoadingDetail(true);

        try {
            const data = await gsdAnalysisService.getAnalysisById(analysisId);
            setSelectedAnalysis(data);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Không tải được chi tiết phân tích.');
        } finally {
            setLoadingDetail(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            Tổng quan phân tích GSD
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Theo dõi công đoạn đã phân tích và khai báo công đoạn mới.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openNewOperationWorkspace}
                        className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
                    >
                        + Khai báo công đoạn mới
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="text-xs text-blue-600 font-semibold">
                            Tổng công đoạn
                        </div>
                        <div className="text-2xl font-black text-blue-900 mt-1">
                            {stats.totalAnalysis}
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                        <div className="text-xs text-green-600 font-semibold">
                            SMV trung bình
                        </div>
                        <div className="text-2xl font-black text-green-900 mt-1">
                            {stats.averageSmv.toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                        <div className="text-xs text-indigo-600 font-semibold">
                            Tổng TMU
                        </div>
                        <div className="text-2xl font-black text-indigo-900 mt-1">
                            {stats.totalTmu.toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                        <div className="text-xs text-orange-600 font-semibold">
                            Số máy đã dùng
                        </div>
                        <div className="text-2xl font-black text-orange-900 mt-1">
                            {stats.machineCount}
                        </div>
                    </div>
                </div>
            </div>

            {!isWorkspaceOpen && (
                <GsdProcessTable
                    analyses={analyses}
                    loading={loading}
                    onRefresh={loadAnalyses}
                    onRowClick={handleOpenAnalysisDetail}
                />
            )}

            {isWorkspaceOpen && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="px-5 pt-5">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div>
                                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                                    Khai báo công đoạn mới
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Thực hiện phân tích công đoạn và xem quy trình tổng hợp.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsWorkspaceOpen(false);
                                    loadAnalyses();
                                }}
                                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50"
                            >
                                Đóng
                            </button>
                        </div>

                        <div className="border-b border-slate-200 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('analysis')}
                                className={`px-4 py-3 text-xs font-bold border-b-2 ${activeTab === 'analysis'
                                    ? 'border-blue-700 text-blue-700 bg-blue-50'
                                    : 'border-transparent text-slate-500 hover:text-blue-700'
                                    }`}
                            >
                                Phân tích
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('process');
                                    loadAnalyses();
                                }}
                                className={`px-4 py-3 text-xs font-bold border-b-2 ${activeTab === 'process'
                                    ? 'border-blue-700 text-blue-700 bg-blue-50'
                                    : 'border-transparent text-slate-500 hover:text-blue-700'
                                    }`}
                            >
                                Quy trình
                            </button>
                        </div>
                    </div>

                    <div className="p-5 bg-slate-10">
                        <div style={{ display: activeTab === 'analysis' ? 'block' : 'none' }}>
                            <GsdAnalysisPage />
                        </div>

                        <div style={{ display: activeTab === 'process' ? 'block' : 'none' }}>
                            <GsdProcessTable
                                analyses={analyses}
                                loading={loading}
                                onRefresh={loadAnalyses}
                                onRowClick={handleOpenAnalysisDetail}
                            />
                        </div>
                    </div>
                </div>
            )}

            {loadingDetail && (
                <div className="fixed inset-0 bg-black/30 z-[130] flex items-center justify-center">
                    <div className="bg-white rounded-xl px-5 py-4 shadow-xl text-sm font-bold text-slate-700">
                        Đang tải chi tiết...
                    </div>
                </div>
            )}

            {selectedAnalysis && (
                <GsdAnalysisDetailModal
                    analysis={selectedAnalysis}
                    onClose={() => setSelectedAnalysis(null)}
                />
            )}
        </div>
    );
}