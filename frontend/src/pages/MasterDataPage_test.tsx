import { useState } from 'react';
import ClusterMasterPage from './ClusterMasterPage';
import GsdCodeMasterPage from './GsdCodeMasterPage';
import MachineEquipmentMasterPage from './MachineEquipmentMasterPage';
import SourceMasterPage from './SourceMasterPage';
import SourceActionMappingPage from './SourceActionMappingPage';
import WorkMasterPage from './WorkMasterPage';
import ProductCateMasterPage from './ProductCateMasterPage';
import ProductCateGroupMasterPage from './ProductCateGroupMasterPage';
import DepartmentTypeMasterPage from './DepartmentTypeMasterPage';
import SkillGradeMasterPage from './SkillGradeMasterPage';
import SalaryCoefficientMasterPage from './SalaryCoefficientMasterPage';

type MasterTabKey = 'salary-coefficient' | 'skill-grade' | 'clusters' | 'gsd-codes' | 'machine-equipments' | 'sources' | 'source-action-mapping' | 'works' | 'product-category' | 'product-category-group' | 'department-type';

interface MasterTab {
    key: MasterTabKey;
    label: string;
    description: string;
}

const masterTabs: MasterTab[] = [
    {
        key: 'department-type',
        label: 'Danh mục Phòng Phân xưởng',
        description: 'Quản lý loại phòng ban',
    },
    {
        key: 'clusters',
        label: 'Danh mục công đoạn',
        description: 'Quản lý nhóm/cụm công đoạn',
    },
    {
        key: 'works',
        label: 'Danh mục công việc',
        description: 'Quản lý danh mục công việc',
    },
    {
        key: 'product-category',
        label: 'Danh mục chủng loại',
        description: 'Quản lý danh mục chủng loại',
    },
    {
        key: 'product-category-group',
        label: 'Danh mục nhóm chủng loại',
        description: 'Quản lý danh mục nhóm chủng loại',
    },
    {
        key: 'machine-equipments',
        label: 'Danh mục MMTB',
        description: 'Quản lý máy móc thiết bị',
    },
    {
        key: 'skill-grade',
        label: 'Danh mục bậc thợ',
        description: 'Quản lý bậc thợ',
    },
    {
        key: 'salary-coefficient',
        label: 'Danh mục hệ số lương',
        description: 'Quản lý hệ số lương',
    },
    {
        key: 'sources',
        label: 'Danh mục Source',
        description: 'Quản lý danh mục source name',
    },
    {
        key: 'gsd-codes',
        label: 'Kho thao tác chuẩn',
        description: 'Quản lý thư viện thao tác chuẩn GSD',
    },
    {
        key: 'source-action-mapping',
        label: 'Khai báo thao tác',
        description: 'Mapping source với danh sách thao tác chuẩn',
    },
];

interface MasterDataPageTestProps {
    activeMasterTab: MasterTabKey;
}

export default function MasterDataPage_test({
    activeMasterTab,
}: MasterDataPageTestProps) {


    const renderContent = () => {
        switch (activeMasterTab) {
            case 'clusters':
                return <ClusterMasterPage />;

            case 'machine-equipments':
                return <MachineEquipmentMasterPage />;

            case 'skill-grade':
                return <SkillGradeMasterPage />;

            case 'salary-coefficient':
                return <SalaryCoefficientMasterPage />;

            case 'sources':
                return <SourceMasterPage />;

            case 'works':
                return <WorkMasterPage />;

            case 'product-category':
                return <ProductCateMasterPage />

            case 'product-category-group':
                return <ProductCateGroupMasterPage />

            case 'gsd-codes':
                return <GsdCodeMasterPage />;

            case 'source-action-mapping':
                return <SourceActionMappingPage />;

            case 'department-type':
                return <DepartmentTypeMasterPage />;

            default:
                return <ClusterMasterPage />;
        }
    };

    // return (
    //     <div className="grid grid-cols-[280px_1fr] gap-4 h-full">
    //         {/* Menu trái */}
    //         <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm p-3 h-fit">
    //             <div className="px-3 py-3 border-b border-slate-800 mb-2">
    //                 <h2 className="text-lg font-black text-emerald-400">
    //                     Master Data
    //                 </h2>
    //                 <p className="text-xs text-slate-400 mt-1">
    //                     Danh mục hệ thống
    //                 </p>
    //             </div>

    //             {/* <div className="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto no-scrollbar-y">
    //                 {masterTabs.map((tab) => {
    //                     const isActive = activeMasterTab === tab.key;

    //                     return (
    //                         <button
    //                             key={tab.key}
    //                             type="button"
    //                             onClick={() => setActiveMasterTab(tab.key)}
    //                             title={tab.description}
    //                             className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${isActive
    //                                     ? 'bg-emerald-900/60 text-emerald-400 font-bold'
    //                                     : 'text-slate-200 hover:bg-slate-800 hover:text-white'
    //                                 }`}
    //                         >
    //                             {tab.label}
    //                         </button>
    //                     );
    //                 })}
    //             </div> */}
    //         </div>

    //         {/* Nội dung phải */}
    //         <div className="min-w-0 space-y-4">
    //             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
    //                 <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
    //                     {masterTabs.find((item) => item.key === activeMasterTab)?.label}
    //                 </h2>

    //                 <p className="text-xs text-slate-500 mt-1">
    //                     {masterTabs.find((item) => item.key === activeMasterTab)?.description}
    //                 </p>
    //             </div>

    //             {renderContent()}
    //         </div>
    //     </div>
    // );
    return (
        <div className="space-y-5">
            {renderContent()}
        </div>
    );
}
