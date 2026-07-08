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
        key: 'clusters',
        label: 'Cụm',
        description: 'Quản lý nhóm/cụm công đoạn',
    },
    {
        key: 'machine-equipments',
        label: 'MMTB',
        description: 'Quản lý máy móc thiết bị',
    },
    {
        key: 'skill-grade',
        label: 'Bậc thợ',
        description: 'Quản lý bậc thợ',
    },
    {
        key: 'salary-coefficient',
        label: 'Hệ số lương',
        description: 'Quản lý hệ số lương',
    },
    {
        key: 'sources',
        label: 'Source',
        description: 'Quản lý danh mục source name',
    },
    {
        key: 'works',
        label: 'Công việc',
        description: 'Quản lý danh mục công việc',
    },
    {
        key: 'product-category',
        label: 'Chủng loại',
        description: 'Quản lý danh mục chủng loại'
    },
    {
        key: 'product-category-group',
        label: 'Nhóm chủng loại',
        description: 'Quản lý danh mục nhóm chủng loại'
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
    {
        key: 'department-type',
        label: 'Loại phòng ban',
        description: 'Quản lý loại phòng ban',
    }
];



export default function MasterDataPage() {
    const [activeMasterTab, setActiveMasterTab] = useState<MasterTabKey>('clusters');

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

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="mb-4">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                        Danh mục
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Quản lý các danh mục nền dùng cho phân tích GSD/SAM.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-slate-200">
                    {masterTabs.map((tab) => {
                        const isActive = activeMasterTab === tab.key;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveMasterTab(tab.key)}
                                className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${isActive
                                    ? 'border-blue-700 text-blue-700 bg-blue-50'
                                    : 'border-transparent text-slate-500 hover:text-blue-700 hover:bg-slate-50'
                                    }`}
                                title={tab.description}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {renderContent()}
        </div>
    );
}
