import { useState, useEffect, useRef } from 'react';
import GsdAnalysisPage from './features/gsd-analysis/pages/GsdAnalysisPage';
import OrganizationChartPage from './pages/OrganizationChartPage';
import OrganizationChartPage_test from './pages/OrganizationChartPage_test';
import MasterDataPage_test from './pages/MasterDataPage_test';
import SewingProcessPage from '../src/features/sewing-process/pages/SewingProcessPage'; // đã tách file
import OperationClusterPage from '../src/features/operation-cluster/pages/operationClusterPage'; // đã tách file
import OperationClusterTreeRealDataTest from '../src/features/operation-cluster/pages/OperationClusterTreeRealDataTest';
import UserPermissionsPage from '../src/features/access-control/pages/UserPermissionsPage';
import { useAuth } from './features/auth/hooks/useAuth';
import SystemUsersPage from './features/system-users/pages/SystemUsersPage';
import RoleManagementPage from './features/role-management/pages/RoleManagementPage';
import SystemEmployeesPage from './features/system-employees/pages/SystemEmployeesPage';
import { ChevronDown, LogOut, UserRound, } from 'lucide-react';
import MyPage from './features/myPage/page/mypage';

// Import Syncfusion Spreadsheet CSS files
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-splitbuttons/styles/material.css";
import "@syncfusion/ej2-lists/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-grids/styles/material.css";
import "@syncfusion/ej2-spreadsheet/styles/material.css";

import {
  usePermissions,
} from '../src/features/auth/hooks/usePermissions';
import {
  SCREEN,
} from '../src/features/auth/constants/permission.constants';

const getBackendUrl = () => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_API_URL !== undefined) return metaEnv.VITE_API_URL;
  return '';
};

const API_BASE_URL = getBackendUrl();

export default function App_test() {
  const permissionsSystemScreen = usePermissions(SCREEN.SYSTEM_SCREENS);
  const permissionsOperationCluster = usePermissions(SCREEN.OPERATION_CLUSTER);
  const permissionsSewingProcess = usePermissions(SCREEN.SEWING_PROCESS);
  const permissionsGsdAnalysis = usePermissions(SCREEN.GSD_ANALYSIS);
  const permissionsOperationClusterNew = usePermissions(SCREEN.OPERATION_CLUSTER_NEW);
  const permissionsMasterData = usePermissions(SCREEN.MASTER_DATA);
  const permissionsOrganizationChart = usePermissions(SCREEN.ORGANIZATION_CHART);
  const permissionsUserPermissions = usePermissions(SCREEN.SYSTEM_USER_PERMISSIONS);
  const permissionsUsers = usePermissions(SCREEN.SYSTEM_USERS);
  const permissionsRoles = usePermissions(SCREEN.SYSTEM_ROLES);

  const {
    session,
    logout,
  } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  type MasterDataTestTabKey =
    | 'clusters'
    | 'gsd-codes'
    | 'machine-equipments'
    | 'sources'
    | 'source-action-mapping'
    | 'works'
    | 'product-category'
    | 'product-category-group'
    | 'department-type'
    | 'skill-grade'
    | 'salary-coefficient'
    | 'customer';

  const [isMasterDataTestOpen, setIsMasterDataTestOpen] = useState<boolean>(false);
  const [activeMasterDataTestTab, setActiveMasterDataTestTab] = useState<MasterDataTestTabKey>('clusters');

  const masterDataTestTabs: {
    key: MasterDataTestTabKey;
    label: string;
  }[] = [
      { key: 'clusters', label: 'Danh mục cụm' },
      { key: 'machine-equipments', label: 'Danh mục MMTB' },
      { key: 'skill-grade', label: 'Danh mục bậc thợ' },
      { key: 'salary-coefficient', label: 'Danh mục hệ số lương' },
      { key: 'sources', label: 'Danh mục Source' },
      { key: 'works', label: 'Danh mục công việc' },
      { key: 'product-category', label: 'Danh mục chủng loại' },
      { key: 'product-category-group', label: 'Danh mục nhóm chủng loại' },
      { key: 'gsd-codes', label: 'Kho thao tác chuẩn' },
      { key: 'source-action-mapping', label: 'Khai báo thao tác' },
      { key: 'department-type', label: 'Loại phòng ban' },
      { key: 'customer', label: 'Khách hàng' },
    ];


  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // useEffect(() => {
  //   if (activeTab !== 'master-data-test') {
  //     setIsMasterDataTestOpen(false);
  //   }
  // }, [activeTab]);

  useEffect(() => {
    if (activeTab) {
      return;
    }

    if (permissionsGsdAnalysis.canView) {
      setActiveTab('GSD chuyền may');
      return;
    }

    if (permissionsOperationCluster.canView) {
      setActiveTab(
        'Kho cụm công đoạn'
      );
      return;
    }

    if (permissionsOperationClusterNew.canView) {
      setActiveTab('Kho cụm công đoạn mới');
      return;
    }

    if (permissionsSewingProcess.canView) {
      setActiveTab('Bảng quy trình may');
      return;
    }

    if (permissionsMasterData.canView) {
      setActiveTab('master-data');
      return;
    }

    if (permissionsOrganizationChart.canView) {
      setActiveTab('Sơ đồ tổ chức');
      return;
    }

    if (permissionsUserPermissions.canView) {
      setActiveTab('Phân quyền sử dụng');
      return;
    }

    if (permissionsUsers.canView) {
      setActiveTab('Quản lý người dùng');
      return;
    }

    if (permissionsRoles.canView) {
      setActiveTab('Cấu hình vai trò');
      return;
    }

    setActiveTab('no-access');
  }, [
    activeTab,
    permissionsGsdAnalysis.canView,
    permissionsOperationCluster.canView,
    permissionsOperationClusterNew.canView,
    permissionsSewingProcess.canView,
    permissionsMasterData.canView,
    permissionsOrganizationChart.canView,
    permissionsUserPermissions.canView,
    permissionsUsers.canView,
    permissionsRoles.canView,
  ]);

  const handleLogout = async (): Promise<void> => {
    if (isLoggingOut) {
      return;
    }

    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn đăng xuất?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsLoggingOut(true);

      await logout();
    } catch (error) {
      console.error('Đăng xuất thất bại:', error);
    } finally {
      setIsLoggingOut(false);

      /*
       * Dùng replace để người dùng không bấm Back
       * quay lại trang đã đăng nhập.
       */
      window.location.replace('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f0f2f5] text-slate-800 font-sans">
      {/* Sidebar navigation panel */}
      <aside className={`bg-[#0d47a1] text-white flex flex-col fixed h-full z-50 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
        {/* Brand identity banner */}
        <div className="p-5 border-b border-blue-800/60 flex items-center justify-between relative">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-white p-1 rounded-sm shrink-0">
              <div className="w-8 h-8 bg-[#0d47a1] rounded flex items-center justify-center font-black text-white text-xs select-none">
                IE
              </div>
            </div>
            <div className={`transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              <h1 className="font-bold text-sm tracking-tight leading-none text-white whitespace-nowrap">IE Planning System</h1>
              <p className="text-[9px] font-bold opacity-60 uppercase mt-1 tracking-wider whitespace-nowrap">SAM &amp; Line Planning</p>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex absolute -right-3 top-6 bg-white text-blue-900 border border-slate-200 rounded-full w-6 h-6 items-center justify-center z-50 hover:bg-slate-100 shadow-sm transition-transform cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>



        <nav className="flex-1 py-4 overflow-y-auto text-xs space-y-5 scrollbar-thin select-none">

          {(permissionsGsdAnalysis.canView) && (
            <div>
              <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                Chức năng chính
              </h3>
              <ul className="space-y-0.5">

                {permissionsGsdAnalysis.canView && (
                  <li>
                    <button
                      onClick={() => { setActiveTab('GSD chuyền may'); setMobileMenuOpen(false); }}
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'GSD chuyền may'
                        ? 'bg-[#1e40af] border-r-4 border-white font-bold'
                        : 'hover:bg-blue-800/40 text-blue-100'
                        }`}
                      title="GSD chuyền may"
                    >
                      <span className="h-4 w-4 shrink-0">∑</span>
                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">GSD chuyền may</span>
                      )}
                    </button>

                  </li>
                )}

                {/* <li>
                  <button
                    onClick={() => { setActiveTab('My page'); setMobileMenuOpen(false); }}
                    className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'My page'
                      ? 'bg-[#1e40af] border-r-4 border-white font-bold'
                      : 'hover:bg-blue-800/40 text-blue-100'
                      }`}
                    title="My page"
                  >
                    <span className="h-4 w-4 shrink-0">∑</span>
                    {!isSidebarCollapsed && (
                      <span className="whitespace-nowrap">My page</span>
                    )}
                  </button>

                </li> */}
              </ul>
            </div>
          )}

          {(permissionsOperationCluster.canView || permissionsOperationClusterNew.canView || permissionsSewingProcess.canView) && (
            <div>
              <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                IE Module
              </h3>
              <ul className="space-y-0.5">

                {permissionsOperationCluster.canView && (
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab('Kho cụm công đoạn');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'Kho cụm công đoạn'
                        ? 'bg-[#1e40af] border-r-4 border-white font-bold'
                        : 'hover:bg-blue-800/40 text-blue-100'
                        }`}
                      title="Kho cụm công đoạn"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h8M4 18h16"
                        />
                      </svg>

                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">Kho cụm công đoạn</span>
                      )}
                    </button>
                  </li>
                )}

                {permissionsOperationClusterNew.canView && (
                  <li>

                    <button
                      onClick={() => {
                        setActiveTab('Kho cụm công đoạn mới');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'Kho cụm công đoạn mới'
                        ? 'bg-[#1e40af] border-r-4 border-white font-bold'
                        : 'hover:bg-blue-800/40 text-blue-100'
                        }`}
                      title="Kho cụm công đoạn mới"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h8M4 18h16"
                        />
                      </svg>

                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">Kho cụm công đoạn (New)</span>
                      )}
                    </button>

                  </li>
                )}

                {permissionsSewingProcess.canView && (
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab('Bảng quy trình may');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'Bảng quy trình may'
                        ? 'bg-[#1e40af] border-r-4 border-white font-bold'
                        : 'hover:bg-blue-800/40 text-blue-100'
                        }`}
                      title="Bảng quy trình may"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5h6m-7 4h8m-8 4h8m-8 4h5M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
                        />
                      </svg>

                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">Bảng quy trình may</span>
                      )}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}

          {(permissionsMasterData.canView) && (
            <div>
              <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                Danh mục hệ thống
              </h3>
              <ul className="space-y-0.5">

                {permissionsMasterData.canView && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMasterDataTestOpen((prev) => !prev);
                        setActiveTab('master-data');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'master-data'
                        ? 'bg-[#1e40af] border-r-4 border-white font-bold'
                        : 'hover:bg-blue-800/40 text-blue-100'
                        }`}
                      title="Danh mục"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>

                      {!isSidebarCollapsed && (
                        <>
                          <span className="whitespace-nowrap flex-1">Danh mục</span>

                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 transition-transform duration-200 ${isMasterDataTestOpen ? 'rotate-90' : ''
                              }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </>
                      )}
                    </button>

                    {!isSidebarCollapsed && isMasterDataTestOpen && (
                      <div className="mt-1 ml-8 space-y-0.5">
                        {masterDataTestTabs.map((tab) => {
                          const isActive =
                            activeTab === 'master-data' &&
                            activeMasterDataTestTab === tab.key;

                          return (
                            <button
                              key={tab.key}
                              type="button"
                              onClick={() => {
                                setActiveTab('master-data');
                                setActiveMasterDataTestTab(tab.key);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-md text-[12px] transition-all ${isActive
                                ? 'bg-blue-900/60 text-white font-bold'
                                : 'text-blue-100 hover:bg-blue-800/40 hover:text-white'
                                }`}
                              title={tab.label}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                )}
              </ul>
            </div>
          )}

          {(permissionsOrganizationChart.canView) && (
            <div>
              <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                Human Resource Management
              </h3>
              <ul className="space-y-0.5">

                {permissionsOrganizationChart.canView && (
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab('Sơ đồ tổ chức');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'Sơ đồ tổ chức'
                        ? 'bg-[#1e40af] border-r-4 border-white font-bold'
                        : 'hover:bg-blue-800/40 text-blue-100'
                        }`}
                      title="Sơ đồ tổ chức"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 3h12v6H6V3zM6 15h5v6H6v-6zM13 15h5v6h-5v-6zM12 9v3m-3 0h6m-6 0v3m6-3v3"
                        />
                      </svg>

                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">Sơ đồ tổ chức</span>
                      )}
                    </button>
                  </li>
                )}

              </ul>
            </div>
          )}

          {(permissionsUserPermissions.canView || permissionsUsers.canView || permissionsRoles.canView) && (
            <div>
              <h3
                className={`px-5 mb-1.5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}
              >
                Phân quyền sử dụng
              </h3>

              <ul className="space-y-0.5">
                {/* Phân quyền người dùng */}
                {permissionsUserPermissions.canView && (
                  <li>

                    <button
                      onClick={() => {
                        setActiveTab(
                          'Phân quyền sử dụng'
                        );
                        setMobileMenuOpen(false);
                      }}
                      className={` w-full px-5 py-2.5 flex items-center gap-2.5 text-left outline-none cursor-pointer transition-all  ${activeTab === 'Phân quyền sử dụng' ? 'bg-[#1e40af] border-r-4 border-white font-bold text-white'
                        : 'text-blue-100 hover:bg-blue-800/40'
                        }
                        `}
                      title="Phân quyền người dùng"
                    >
                      {/* Icon khiên + dấu check */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="
                        M12 3
                        4.5 6v5.25
                        c0 4.64 3.18 8.8 7.5 9.75
                        4.32-.95 7.5-5.11 7.5-9.75V6
                        L12 3z
                        m-3 9 2 2 4-4
                      "
                        />
                      </svg>

                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">
                          Phân quyền người dùng
                        </span>
                      )}
                    </button>

                  </li>
                )}


                {/* Quản lý người dùng */}
                {permissionsUsers.canView && (
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab(
                          'Quản lý người dùng'
                        );
                        setMobileMenuOpen(false);
                      }}
                      className={`
                    w-full px-5 py-2.5
                    flex items-center gap-2.5
                    text-left outline-none
                    cursor-pointer transition-all
                    ${activeTab ===
                          'Quản lý người dùng'
                          ? 'bg-[#1e40af] border-r-4 border-white font-bold text-white'
                          : 'text-blue-100 hover:bg-blue-800/40'
                        }
                  `}
                      title="Quản lý người dùng"
                    >
                      {/* Icon nhóm người dùng */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="
                      M16 21v-2
                      a4 4 0 0 0-4-4H6
                      a4 4 0 0 0-4 4v2
                      M9 11
                      a4 4 0 1 0 0-8
                      a4 4 0 0 0 0 8
                      M22 21v-2
                      a4 4 0 0 0-3-3.87
                      M16 3.13
                      a4 4 0 0 1 0 7.75
                    "
                        />
                      </svg>

                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">
                          Quản lý người dùng
                        </span>
                      )}
                    </button>

                  </li>
                )}


                {/* Cấu hình vai trò */}
                {permissionsRoles.canView && (
                  <li>
                    <button
                      onClick={() => {
                        setActiveTab(
                          'Cấu hình vai trò'
                        );
                        setMobileMenuOpen(false);
                      }}
                      className={`
                    w-full px-5 py-2.5
                    flex items-center gap-2.5
                    text-left outline-none
                    cursor-pointer transition-all
                    ${activeTab ===
                          'Cấu hình vai trò'
                          ? 'bg-[#1e40af] border-r-4 border-white font-bold text-white'
                          : 'text-blue-100 hover:bg-blue-800/40'
                        }
                  `}
                      title="Cấu hình vai trò"
                    >
                      {/* Icon chìa khóa */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="
                        M15.5 7.5
                        a4.5 4.5 0 1 1-6.36 6.36
                        A4.5 4.5 0 0 1 15.5 7.5z
                        M14 10
                        l7-7
                        M18 3h3v3
                        M17 7l2 2
                      "
                        />
                      </svg>

                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">
                          Cấu hình vai trò
                        </span>
                      )}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}

        </nav>

        {activeTab === 'no-access' && (
          <main className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 3l7.5 3v5.25c0 4.64-3.18 8.8-7.5 9.75-4.32-.95-7.5-5.11-7.5-9.75V6L12 3z"
                  />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-slate-800">
                Chưa được cấp quyền sử dụng
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tài khoản của bạn hiện chưa được cấp quyền truy cập
                vào chức năng nào trong hệ thống.
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Vui lòng liên hệ quản trị viên để được cấp quyền.
              </p>
            </div>
          </main>
        )}


        {/* Sidebar Footer info */}
        <div className={`p-4 border-t border-blue-800 text-[10px] opacity-50 flex select-none shrink-0 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed && <span>Phiên bản v1.0.0</span>}
          {!isSidebarCollapsed && <span>IE Team</span>}
          {isSidebarCollapsed && <span>v1</span>}
        </div>
      </aside>

      {/* Screen Backdrop for mobile sidebar toggler */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-45 md:hidden"
        ></div>
      )}

      {/* Main Content Arena */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

        {/* Top Header Navigation */}
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-500 hover:bg-slate-100 p-2 rounded md:hidden cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 font-semibold select-none">
              <span>Hệ Thống</span>
              <span>/</span>
              <span className="text-slate-800 capitalize font-bold font-sans">
                {activeTab.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification alert block */}
            {/* <div className="relative cursor-pointer hover:bg-slate-50 p-1.5 rounded-full transition-colors select-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                8
              </span>
            </div> */}

            {/* Profile operator element */}
            <div
              ref={userMenuRef}
              className="
                relative
                flex items-center
                 border-slate-200
                pl-4
                select-none
              "
            >
              {/* User trigger */}
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen((prev) => !prev);
                }}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="
                  flex
                  items-center
                  gap-2.5

                  rounded-md
                  px-2
                  py-1.5

                  text-left

                  transition-colors
                  duration-150

                  hover:bg-slate-100

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-blue-500/30

                  cursor-pointer
                "
              >
                {/* User info */}
                <div className="hidden text-right sm:block">
                  <p
                    className="
                      max-w-[180px]
                      truncate
                      text-xs
                      font-semibold
                      leading-4
                      text-slate-800
                    "
                  >
                    {session?.user.fullName ?? 'Người dùng'}
                  </p>

                  <p
                    className="
                      mt-0.5
                      max-w-[180px]
                      truncate
                      text-[10px]
                      font-medium
                      leading-4
                      text-slate-500
                    "
                  >
                    {session?.user.departmentCode ??
                      session?.user.username ??
                      'IE Planning System'}
                  </p>
                </div>

                {/* Avatar */}
                <div
                  className="
                    flex
                    h-8 w-8
                    shrink-0
                    items-center
                    justify-center

                    rounded
                    border border-slate-300

                    bg-slate-100

                    text-[11px]
                    font-semibold
                    text-slate-600
                  "
                >
                  {session?.user.fullName
                    ?.trim()
                    .split(/\s+/)
                    .slice(-2)
                    .map((word) => word.charAt(0))
                    .join('')
                    .toUpperCase() || 'IE'}
                </div>

                <ChevronDown
                  className={`
                    hidden
                    h-3.5 w-3.5
                    shrink-0
                    text-slate-400

                    transition-transform
                    duration-150

                    sm:block

                    ${userMenuOpen ? 'rotate-180' : ''}
                  `}
                />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div
                  role="menu"
                  className="
                    absolute
                    right-0
                    top-[calc(100%+8px)]
                    z-50

                    w-64
                    
                    overflow-hidden

                    rounded-md
                    border border-slate-200

                    bg-white

                    shadow-lg
                    shadow-slate-900/10

                  "
                >
                  {/* Account header */}
                  <div className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="
                          flex
                          h-9 w-9
                          shrink-0
                          items-center
                          justify-center

                          rounded
                          bg-blue-50

                          text-blue-700
                        "
                      >
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-slate-800
                          "
                        >
                          {session?.user.fullName ?? 'Người dùng'}
                        </p>

                        <p
                          className="
                            mt-0.5
                            truncate
                            text-xs
                            text-slate-500
                          "
                        >
                          {session?.user.username ?? ''}
                        </p>
                      </div>
                    </div>

                    {session?.user.departmentCode && (
                      <div
                        className="
                          mt-3
                          flex
                          items-center
                          justify-between

                          border-t border-slate-100
                          pt-2.5

                          text-xs
                        "
                      >
                        <span className="text-slate-400">
                          Đơn vị
                        </span>

                        <span className="font-medium text-slate-700">
                          {session.user.departmentCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="
                      border-t border-slate-200
                      bg-slate-50
                      p-1.5
                    "
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        void handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="
                        flex
                        w-full
                        items-center
                        gap-2.5

                        rounded
                        px-3
                        py-2

                        text-left
                        text-xs
                        font-medium
                        text-slate-700

                        transition-colors

                        hover:bg-white
                        hover:text-red-600

                        disabled:pointer-events-none
                        disabled:opacity-50

                        cursor-pointer
                      "
                    >
                      <LogOut className="h-4 w-4" />

                      <span>
                        {isLoggingOut
                          ? 'Đang đăng xuất...'
                          : 'Đăng xuất'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* {activeTab === 'master-data' && (
          <MasterDataView />
        )} */}

        {activeTab === 'master-data' && (
          <MasterDataPage_test activeMasterTab={activeMasterDataTestTab} />
        )}

        {activeTab === 'organization-chart' && (
          <OrganizationChartPage />
        )}

        {activeTab === 'Sơ đồ tổ chức' && (
          <OrganizationChartPage_test />
        )}

        {activeTab === 'GSD chuyền may' && (
          <GsdAnalysisPage />
        )}

        {/*  dinh 07/08/2026 */}
        {/* {activeTab === 'Khai báo cụm công đoạn cho chủng loại hàng' && (
            <OperationClusterPage />
          )} */}

        {/* {activeTab === 'Khai báo cụm công đoạn cho chủng loại hàng' && (
            <OperationClusterPage_test_v2 />
          )} */}
        {activeTab === 'Kho cụm công đoạn' && (
          <OperationClusterPage />
        )}

        {activeTab === 'Kho cụm công đoạn mới' && (
          <OperationClusterTreeRealDataTest />
        )}

        {activeTab === 'Bảng quy trình may' && (
          <SewingProcessPage />
        )}

        {activeTab === 'Phân quyền sử dụng' && (
          <UserPermissionsPage />
        )}

        {activeTab === 'Quản lý người dùng' && (
          <SystemUsersPage />
        )}

        {activeTab === 'Cấu hình vai trò' && (
          <RoleManagementPage />
        )}

        {activeTab === 'employees' && (
          <SystemEmployeesPage />
        )}

        {activeTab === 'My page' && (
          <MyPage/>
        )}

        {/* Footer info brand elements */}
        <footer className="mt-auto px-6 py-2 bg-white border-t border-slate-200 flex flex-wrap justify-between items-center text-[10px] text-slate-800 gap-2 select-none">
          <p className="text-[13px] font-medium">© 2026 IE Planning System - HQ5 VSN</p>
          <p className="text-[13px] font-medium">{session?.user.unitName}</p>
          {/* <p className="font-medium">All rights reserved by HQ5 VSN.</p> */}
        </footer>

      </div>
    </div>

  );
}
