import React, { useState, useEffect } from 'react';
import { Style, Worker } from './types';
import { defaultStyles, defaultWorkers, initializeAssignments } from './data';
import GsdRoutingView from './components/GsdRoutingView';
import SamDatabaseView from './components/SamDatabaseView';
import LineBalancingView from './components/LineBalancingView';
import ManpowerView from './components/ManpowerView';
import CapacityPlanningView from './components/CapacityPlanningView';
import OutputTrackingView from './components/OutputTrackingView';
import ExcelRoutingView from './components/ExcelRoutingView';
import ExcelEmployeeView from './components/ExcelEmployeeView';
import MasterDataView from './components/MasterDataView';
import GsdAnalysisView from './components/GsdAnalysisView';
import OrganizationChartPage from './pages/OrganizationChartPage';
import OrganizationChartPage_test from './pages/OrganizationChartPage_test';
import OperationClusterPage from './pages/OperationClusterPage';
import MasterDataPage_test from './pages/MasterDataPage_test';

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

const getBackendUrl = () => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_API_URL !== undefined) return metaEnv.VITE_API_URL;
  return '';
};
const API_BASE_URL = getBackendUrl();

export default function App_test() {
  // Initialize state with assigned workers
  const [appState, setAppState] = useState<{ styles: Style[]; workers: Worker[] }>(() => {
    return initializeAssignments(defaultStyles, defaultWorkers);
  });

  const [currentStyleCode, setCurrentStyleCode] = useState<string>('DOWN-JK-2201');
  const [activeTab, setActiveTab] = useState<string>('gsd-routing');
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
    | 'salary-coefficient';

  const [isMasterDataTestOpen, setIsMasterDataTestOpen] = useState<boolean>(false);
  const [activeMasterDataTestTab, setActiveMasterDataTestTab] =
    useState<MasterDataTestTabKey>('clusters');

  const masterDataTestTabs: {
    key: MasterDataTestTabKey;
    label: string;
  }[] = [
      { key: 'department-type', label: 'Danh mục Phòng Phân xưởng' },
      { key: 'clusters', label: 'Danh mục công đoạn' },
      { key: 'machine-equipments', label: 'Danh mục MMTB' },
      { key: 'skill-grade', label: 'Danh mục bậc thợ' },
      { key: 'salary-coefficient', label: 'Danh mục hệ số lương' },
      { key: 'sources', label: 'Danh mục Source' },
      { key: 'works', label: 'Danh mục công việc' },
      { key: 'product-category', label: 'Danh mục chủng loại' },
      { key: 'product-category-group', label: 'Danh mục nhóm chủng loại' },
      { key: 'gsd-codes', label: 'Kho thao tác chuẩn' },
      { key: 'source-action-mapping', label: 'Khai báo thao tác' },
    ];

  useEffect(() => {
    if (activeTab !== 'master-data-test') {
      setIsMasterDataTestOpen(false);
    }
  }, [activeTab]);

  const fetchDatabaseData = () => {
    fetch(`${API_BASE_URL}/api/routing`)
      .then(res => res.json())
      .then(dbRouting => {
        if (Array.isArray(dbRouting) && dbRouting.length > 0) {
          const mappedRouting = dbRouting.map((step: any) => ({
            id: step.op_code || `OP${String(step.stt).padStart(3, '0')}`,
            stt: Number(step.stt) || 1,
            opCode: step.op_code || '',
            opName: step.op_name || '',
            machineType: step.machine || '1N',
            sam: Number(step.sam) || 0,
            smv: Number(step.smv) || 0,
            ratio: Number(step.rate) || 0,
            difficulty: step.difficulty || 'B',
            requiredSkill: step.skill || 'B',
            assignedWorkersCount: 1,
            assignedWorkerIds: []
          }));

          setAppState(prev => ({
            ...prev,
            styles: prev.styles.map(s => {
              if (s.code === 'DOWN-JK-2201') {
                return {
                  ...s,
                  routing: mappedRouting
                };
              }
              return s;
            })
          }));
        }
      })
      .catch(err => console.error('Failed to load DB routing data:', err));
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  // Find active style
  const currentStyle = appState.styles.find(s => s.code === currentStyleCode) || appState.styles[0];

  // Callback to update specific Style configuration
  const handleUpdateStyle = (updatedStyle: Style) => {
    setAppState(prev => ({
      ...prev,
      styles: prev.styles.map(s => s.code === updatedStyle.code ? updatedStyle : s)
    }));
  };

  // Add freshly registered style to dataset
  const handleAddStyle = (newStyle: Style) => {
    setAppState(prev => ({
      ...prev,
      styles: [...prev.styles, newStyle]
    }));
    setCurrentStyleCode(newStyle.code);
  };

  const handleDeleteStyle = (code: string) => {
    setAppState(prev => {
      const remaining = prev.styles.filter(s => s.code !== code);
      return {
        ...prev,
        styles: remaining
      };
    });
    // Fallback current style selection
    const remaining = appState.styles.filter(s => s.code !== code);
    if (remaining.length > 0) {
      setCurrentStyleCode(remaining[0].code);
    }
  };

  // Crew state handlers
  const handleUpdateWorkers = (updatedWorkers: Worker[]) => {
    setAppState(prev => ({
      ...prev,
      workers: updatedWorkers
    }));
  };

  const handleAddWorker = (newWorker: Worker) => {
    setAppState(prev => ({
      ...prev,
      workers: [...prev.workers, newWorker]
    }));
  };

  const handleUpdateWorker = (updatedWorker: Worker) => {
    setAppState(prev => ({
      ...prev,
      workers: prev.workers.map(w => w.id === updatedWorker.id ? updatedWorker : w)
    }));
  };

  const handleDeleteWorker = (id: string) => {
    setAppState(prev => ({
      ...prev,
      workers: prev.workers.filter(w => w.id !== id)
    }));
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

        {/* Modules navigation list */}
        <nav className="flex-1 py-4 overflow-y-auto text-xs space-y-5 scrollbar-thin select-none">

          <div>
            <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              Chức năng chính
            </h3>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => { setActiveTab('gsd-routing'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'gsd-routing' ? 'bg-[#1e40af] border-r-4 border-white font-bold' : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="GSD / SAM Routing"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                  </svg>
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">GSD / SAM Routing</span>}
                </button>

                <button
                  onClick={() => { setActiveTab('gsd-analysis'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'gsd-analysis'
                    ? 'bg-[#1e40af] border-r-4 border-white font-bold'
                    : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="Tổng quan GSD"
                >
                  <span className="h-4 w-4 shrink-0">∑</span>
                  {!isSidebarCollapsed && (
                    <span className="whitespace-nowrap">Tổng quan GSD</span>
                  )}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              IE Module
            </h3>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('Khai báo cụm công đoạn cho chủng loại hàng');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'Khai báo cụm công đoạn cho chủng loại hàng'
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
              <li>
                <button
                  onClick={() => { setActiveTab('sam-db'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'sam-db' ? 'bg-[#1e40af] border-r-4 border-white font-bold' : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="Style & SAM Database"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">Style &amp; SAM Database</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('line-balancing'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'line-balancing' ? 'bg-[#1e40af] border-r-4 border-white font-bold' : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="Châm Cân Bằng Chuyền (LOB)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">Châm Cân Bằng Chuyền (LOB)</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('manpower'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'manpower' ? 'bg-[#1e40af] border-r-4 border-white font-bold' : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="Nhân Sự & Tay Nghề"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">Nhân Sự &amp; Tay Nghề</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('capacity'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'capacity' ? 'bg-[#1e40af] border-r-4 border-white font-bold' : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="Capacity Planning"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">Capacity Planning</span>}
                </button>
              </li>
            </ul>
          </div>


          <div>
            <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              Danh mục hệ thống
            </h3>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => { setActiveTab('master-data'); setMobileMenuOpen(false); }}
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
                    <span className="whitespace-nowrap">Danh mục</span>
                  )}
                </button>
              </li>


              <li>
                <button
                  type="button"
                  onClick={() => {
                    setIsMasterDataTestOpen((prev) => !prev);
                    setActiveTab('master-data-test');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'master-data-test'
                    ? 'bg-[#1e40af] border-r-4 border-white font-bold'
                    : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="Danh mục test"
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
                      <span className="whitespace-nowrap flex-1">Danh mục (test)</span>

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
                        activeTab === 'master-data-test' &&
                        activeMasterDataTestTab === tab.key;

                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => {
                            setActiveTab('master-data-test');
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

              {/* <li>
                <button
                  onClick={() => {
                    setActiveTab('organization-chart');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'organization-chart'
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
                    <span className="whitespace-nowrap">Sơ đồ tổ chức (old)</span>
                  )}
                </button>
              </li> */}
            </ul>
          </div>


          <div>
            <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              Human Resource Management
            </h3>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('organization-chart-test');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'organization-chart-test'
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
            </ul>
          </div>




          <div>
            <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              Nhà xưởng module
            </h3>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => { setActiveTab('output-tracking'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'output-tracking' ? 'bg-[#1e40af] border-r-4 border-white font-bold' : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="Đầu Ra Từng Giờ"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">Đầu Ra Từng Giờ</span>}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={`px-5 text-[9px] font-extrabold text-blue-300 uppercase tracking-widest mb-1.5 opacity-50 whitespace-nowrap ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              QUẢN TRỊ EXCEL (CSDL)
            </h3>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => { setActiveTab('excel-routing'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'excel-routing' ? 'bg-[#1e40af] border-r-4 border-white font-bold' : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="Nhập liệu Routing (Excel)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">Nhập liệu Routing (Excel)</span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('excel-manpower'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-5 py-2.5 flex items-center gap-2.5 transition-all outline-none cursor-pointer ${activeTab === 'excel-manpower' ? 'bg-[#1e40af] border-r-4 border-white font-bold' : 'hover:bg-blue-800/40 text-blue-100'
                    }`}
                  title="Nhập liệu Nhân sự (Excel)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {!isSidebarCollapsed && <span className="whitespace-nowrap">Nhập liệu Nhân sự (Excel)</span>}
                </button>
              </li>
            </ul>
          </div>
        </nav>

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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm shrink-0">
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
            <div className="relative cursor-pointer hover:bg-slate-50 p-1.5 rounded-full transition-colors select-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                8
              </span>
            </div>

            {/* Profile operator element */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 select-none">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">IE User Representative</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Industrial Engineering</p>
              </div>
              <div className="w-9 h-9 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center font-bold font-mono">
                IE
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Workspace View Area */}
        <div className={`p-6 flex-1 w-full mx-auto transition-all duration-300 ${isSidebarCollapsed ? 'max-w-full' : 'max-w-7xl'}`}>
          {activeTab === 'gsd-routing' && (
            <GsdRoutingView
              currentStyle={currentStyle}
              allStyles={appState.styles}
              onStyleChange={setCurrentStyleCode}
              onUpdateStyle={handleUpdateStyle}
              allWorkers={appState.workers}
            />
          )}

          {activeTab === 'sam-db' && (
            <SamDatabaseView
              styles={appState.styles}
              onSelectStyle={setCurrentStyleCode}
              onAddStyle={handleAddStyle}
              onUpdateStyle={handleUpdateStyle}
              onDeleteStyle={handleDeleteStyle}
              onSwitchTab={setActiveTab}
            />
          )}

          {activeTab === 'line-balancing' && (
            <LineBalancingView
              currentStyle={currentStyle}
              allWorkers={appState.workers}
              onUpdateStyle={handleUpdateStyle}
              onUpdateWorkers={handleUpdateWorkers}
            />
          )}

          {activeTab === 'manpower' && (
            <ManpowerView
              workers={appState.workers}
              onAddWorker={handleAddWorker}
              onUpdateWorker={handleUpdateWorker}
              onDeleteWorker={handleDeleteWorker}
            />
          )}

          {activeTab === 'capacity' && (
            <CapacityPlanningView
              styles={appState.styles}
              currentStyle={currentStyle}
            />
          )}

          {activeTab === 'output-tracking' && (
            <OutputTrackingView
              currentStyle={currentStyle}
            />
          )}

          {activeTab === 'excel-routing' && (
            <ExcelRoutingView
              onRefreshData={fetchDatabaseData}
            />
          )}

          {activeTab === 'excel-manpower' && (
            <ExcelEmployeeView
              onRefreshData={fetchDatabaseData}
            />
          )}

          {activeTab === 'master-data' && (
            <MasterDataView />
          )}

          {activeTab === 'master-data-test' && (
            <MasterDataPage_test activeMasterTab={activeMasterDataTestTab} />
          )}

          {activeTab === 'organization-chart' && (
            <OrganizationChartPage />
          )}

          {activeTab === 'organization-chart-test' && (
            <OrganizationChartPage_test />
          )}

          {activeTab === 'gsd-analysis' && (
            <GsdAnalysisView />
          )}

          {/*  dinh 07/08/2026 */}
          {activeTab === 'Khai báo cụm công đoạn cho chủng loại hàng' && (
            <OperationClusterPage />
          )}
        </div>

        {/* Footer info brand elements */}
        <footer className="mt-auto px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap justify-between items-center text-[10px] text-slate-400 gap-2 select-none">
          <p>© 2026 IE Planning System - Apparel Manufacturing Solution</p>
          <p className="font-medium">All rights reserved by Manufacturing Technology Group.</p>
        </footer>
      </div>
    </div>
  );
}
