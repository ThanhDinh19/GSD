import React, { useState, useMemo } from 'react';
import { Style, RoutingStep, Worker, SkillLevel, WorkRole } from '../types';
import ExcelExportModal from './ExcelExportModal';

interface GsdRoutingViewProps {
  currentStyle: Style;
  allStyles: Style[];
  onStyleChange: (code: string) => void;
  onUpdateStyle: (updatedStyle: Style) => void;
  allWorkers: Worker[];
}

export default function GsdRoutingView({
  currentStyle,
  allStyles,
  onStyleChange,
  onUpdateStyle,
  allWorkers
}: GsdRoutingViewProps) {
  // Filters & local inputs
  const [selectedProductType, setSelectedProductType] = useState<string>('All');
  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedMachine, setSelectedMachine] = useState<string>('All');

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>(currentStyle.code);
  const [showStylesDropdown, setShowStylesDropdown] = useState<boolean>(false);

  // Modal open states
  const [isExcelOpen, setIsExcelOpen] = useState<boolean>(false);
  const [isGsdModalOpen, setIsGsdModalOpen] = useState<boolean>(false);
  const [selectedGsdStep, setSelectedGsdStep] = useState<RoutingStep | null>(null);

  // Edit / Add operation state
  const [editingStep, setEditingStep] = useState<RoutingStep | null>(null);
  const [isAddingStep, setIsAddingStep] = useState<boolean>(false);
  const [newStep, setNewStep] = useState<Partial<RoutingStep>>({
    opCode: 'OP',
    opName: '',
    machineType: '1N',
    sam: 1.0,
    smv: 0.9,
    difficulty: 'B',
    requiredSkill: 'B',
    assignedWorkersCount: 1
  });

  // Chart hover Tooltip state
  const [hoveredChartBar, setHoveredChartBar] = useState<number | null>(null);

  // Filter Styles list matching choices
  const productTypes = useMemo(() => ['All', ...Array.from(new Set(allStyles.map(s => s.productType)))], [allStyles]);
  const fabrics = useMemo(() => ['All', ...Array.from(new Set(allStyles.map(s => s.mainFabric)))], [allStyles]);
  const machinesList = useMemo(() => {
    const list = new Set<string>();
    currentStyle.routing.forEach(r => list.add(r.machineType));
    return ['All', ...Array.from(list)];
  }, [currentStyle]);

  // Compute calculated values
  const totalSam = useMemo(() => {
    return currentStyle.routing.reduce((acc, step) => acc + step.sam, 0);
  }, [currentStyle.routing]);

  const totalSmv = useMemo(() => {
    return currentStyle.routing.reduce((acc, step) => acc + step.smv, 0);
  }, [currentStyle.routing]);

  const totalAllocatedManpower = useMemo(() => {
    return currentStyle.routing.reduce((acc, step) => acc + step.assignedWorkersCount, 0);
  }, [currentStyle.routing]);

  // Calculated Line Takt Time = Working Time / Target Output
  const taktTime = useMemo(() => {
    if (currentStyle.targetOutput <= 0) return 0;
    return currentStyle.workingTime / currentStyle.targetOutput;
  }, [currentStyle.workingTime, currentStyle.targetOutput]);

  // Active planning metrics
  const [targetOutputInput, setTargetOutputInput] = useState<number>(currentStyle.targetOutput);
  const [workingTimeInput, setWorkingTimeInput] = useState<number>(currentStyle.workingTime);
  const [plannedEfficiency, setPlannedEfficiency] = useState<number>(currentStyle.historicEfficiency);

  // Sync inputs on style change
  React.useEffect(() => {
    setTargetOutputInput(currentStyle.targetOutput);
    setWorkingTimeInput(currentStyle.workingTime);
    setPlannedEfficiency(currentStyle.historicEfficiency);
    setSearchQuery(currentStyle.code);
  }, [currentStyle]);

  // Handle saving target/time inputs
  const handleUpdatePlanning = () => {
    onUpdateStyle({
      ...currentStyle,
      targetOutput: targetOutputInput,
      workingTime: workingTimeInput
    });
  };

  // Filter processes shown in the Routing Table
  const filteredRouting = useMemo(() => {
    return currentStyle.routing.filter(step => {
      const difficultyMatch = selectedDifficulty === 'All' || step.difficulty === selectedDifficulty;
      const machineMatch = selectedMachine === 'All' || step.machineType === selectedMachine;
      return difficultyMatch && machineMatch;
    }).sort((a, b) => a.stt - b.stt);
  }, [currentStyle.routing, selectedDifficulty, selectedMachine]);

  // Active Style options for Search input
  const searchedStyles = useMemo(() => {
    return allStyles.filter(s => 
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allStyles, searchQuery]);

  // Form submit for operation Edit
  const handleSaveStepEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep) return;

    // Recalculate percent ratios for all steps with new SAM values
    const currentSteps = currentStyle.routing.map(s => s.id === editingStep.id ? editingStep : s);
    const newTotalSam = currentSteps.reduce((acc, c) => acc + c.sam, 0);
    const updatedSteps = currentSteps.map(s => ({
      ...s,
      ratio: Number(((s.sam / newTotalSam) * 100).toFixed(2))
    }));

    onUpdateStyle({
      ...currentStyle,
      routing: updatedSteps
    });
    setEditingStep(null);
  };

  // Form submit for adding an operation
  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStep.opCode || !newStep.opName) return;

    const currentSteps = [...currentStyle.routing];
    const newId = (currentSteps.length + 1).toString();
    const stt = currentSteps.length + 1;

    const added: RoutingStep = {
      id: newId,
      stt,
      opCode: newStep.opCode || `OP${stt.toString().padStart(3, '0')}`,
      opName: newStep.opName || 'Công đoạn mới',
      machineType: newStep.machineType || '1N',
      sam: Number(newStep.sam) || 1.0,
      smv: Number(newStep.smv) || 0.9,
      ratio: 0, // calculated below
      difficulty: (newStep.difficulty as SkillLevel) || 'B',
      requiredSkill: (newStep.requiredSkill as SkillLevel) || 'B',
      assignedWorkersCount: Number(newStep.assignedWorkersCount) || 1,
      assignedWorkerIds: []
    };

    currentSteps.push(added);
    const newTotalSam = currentSteps.reduce((acc, c) => acc + c.sam, 0);
    const updatedSteps = currentSteps.map(s => ({
      ...s,
      ratio: Number(((s.sam / newTotalSam) * 100).toFixed(2))
    }));

    onUpdateStyle({
      ...currentStyle,
      routing: updatedSteps
    });

    setIsAddingStep(false);
    // Reset form
    setNewStep({
      opCode: `OP${(updatedSteps.length + 1) * 10}`,
      opName: '',
      machineType: '1N',
      sam: 1.0,
      smv: 0.9,
      difficulty: 'B',
      requiredSkill: 'B',
      assignedWorkersCount: 1
    });
  };

  // Handle operation Delete
  const handleDeleteStep = (id: string) => {
    const remaining = currentStyle.routing.filter(s => s.id !== id);
    const newTotalSam = remaining.reduce((acc, c) => acc + c.sam, 0);
    const updatedSteps = remaining.map((s, index) => ({
      ...s,
      stt: index + 1,
      ratio: Number(((s.sam / newTotalSam) * 100).toFixed(2))
    }));

    onUpdateStyle({
      ...currentStyle,
      routing: updatedSteps
    });
  };

  // Dynamic calculations for the worker details (from the 87 active personnel database)
  const workerStats = useMemo(() => {
    // Collect roles for workers assigned specifically to this Active Style
    const assignedIds = new Set<string>();
    currentStyle.routing.forEach(step => {
      step.assignedWorkerIds.forEach(id => assignedIds.add(id));
    });

    const activeWorkers = allWorkers.filter(w => assignedIds.has(w.id));
    // Fallback: If no workers assigned yet, show overall distribution to fit the mock stats perfectly
    const operators = activeWorkers.length > 0 ? activeWorkers.filter(w => w.role === 'Operator') : allWorkers.filter(w => w.role === 'Operator');
    const helpers = activeWorkers.length > 0 ? activeWorkers.filter(w => w.role === 'Helper') : allWorkers.filter(w => w.role === 'Helper');

    const total = operators.length + helpers.length;
    const operatorPerc = total > 0 ? Math.round((operators.length / total) * 1000) / 10 : 82.8;
    const helperPerc = total > 0 ? Math.round((helpers.length / total) * 1000) / 10 : 17.2;

    const skillA = activeWorkers.length > 0 ? activeWorkers.filter(w => w.skillLevel === 'A').length : allWorkers.filter(w => w.skillLevel === 'A').length;
    const skillB = activeWorkers.length > 0 ? activeWorkers.filter(w => w.skillLevel === 'B').length : allWorkers.filter(w => w.skillLevel === 'B').length;
    const skillC = activeWorkers.length > 0 ? activeWorkers.filter(w => w.skillLevel === 'C').length : allWorkers.filter(w => w.skillLevel === 'C').length;
    const skillD = activeWorkers.length > 0 ? activeWorkers.filter(w => w.skillLevel === 'D').length : allWorkers.filter(w => w.skillLevel === 'D').length;

    const skillTotal = skillA + skillB + skillC + skillD;

    return {
      total,
      operators: operators.length,
      helpers: helpers.length,
      operatorPerc,
      helperPerc,
      skillA,
      skillB,
      skillC,
      skillD,
      skillAPerc: skillTotal > 0 ? Math.round((skillA / skillTotal) * 1000) / 10 : 0,
      skillBPerc: skillTotal > 0 ? Math.round((skillB / skillTotal) * 1000) / 10 : 62.1,
      skillCPerc: skillTotal > 0 ? Math.round((skillC / skillTotal) * 1000) / 10 : 34.5,
      skillDPerc: skillTotal > 0 ? Math.round((skillD / skillTotal) * 1000) / 10 : 3.4,
    };
  }, [currentStyle.routing, allWorkers]);

  // Bottlenecks calculation
  const bottleneckAlerts = useMemo(() => {
    // Find operations where process SAM >= 1.20 mins or where is the highest
    const sortedBySam = [...currentStyle.routing].sort((a, b) => b.sam - a.sam);
    const list: Array<{ id: string; opCode: string; opName: string; type: 'error' | 'warning' | 'info'; text: string; subText: string }> = [];

    if (sortedBySam.length > 0) {
      // 1. Highest SAM
      const highest = sortedBySam[0];
      list.push({
        id: highest.id,
        opCode: highest.opCode,
        opName: highest.opName,
        type: 'error',
        text: `Công đoạn ${highest.opCode} - ${highest.opName}`,
        subText: `SAM cao nhất: ${highest.sam.toFixed(2)} phút (${highest.ratio.toFixed(2)}%)`
      });

      // 2. Second highest SAM
      if (sortedBySam.length > 1) {
        const second = sortedBySam[1];
        list.push({
          id: second.id,
          opCode: second.opCode,
          opName: second.opName,
          type: 'warning',
          text: `Công đoạn ${second.opCode} - ${second.opName}`,
          subText: `SAM cao: ${second.sam.toFixed(2)} phút (${second.ratio.toFixed(2)}%)`
        });
      }

      // 3. Difficulty/Skill checks (e.g. Operation Tra Tay OP040 requires Skill Level C)
      const highSkillOp = currentStyle.routing.find(r => r.requiredSkill === 'C' || r.requiredSkill === 'D');
      if (highSkillOp) {
        list.push({
          id: highSkillOp.id,
          opCode: highSkillOp.opCode,
          opName: highSkillOp.opName,
          type: 'info',
          text: `Công đoạn ${highSkillOp.opCode} - ${highSkillOp.opName}`,
          subText: `Cần đủ thợ may tay nghề ${highSkillOp.requiredSkill} trở lên`
        });
      }
    }
    return list;
  }, [currentStyle.routing]);

  return (
    <div className="space-y-6">
      {/* Search Filters Card */}
      <section id="gsd-search-filters" className="bg-white p-5 rounded-md shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-7 gap-4 items-end">
          <div className="lg:col-span-2 relative">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Mã hàng / Style</label>
            <div className="relative">
              <input 
                className="w-full text-sm border-slate-300 rounded-custom pr-10 py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary-container"
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowStylesDropdown(true);
                }}
                onFocus={() => setShowStylesDropdown(true)}
              />
              <button 
                onClick={() => setShowStylesDropdown(!showStylesDropdown)}
                className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 border-l border-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Style search results drop downs */}
            {showStylesDropdown && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-56 overflow-y-auto">
                {searchedStyles.length > 0 ? (
                  searchedStyles.map((style) => (
                    <button
                      key={style.code}
                      onClick={() => {
                        onStyleChange(style.code);
                        setSearchQuery(style.code);
                        setShowStylesDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs border-b border-slate-100 last:border-b-0"
                    >
                      <div className="font-bold text-slate-800">{style.code}</div>
                      <div className="text-slate-500 truncate text-[11px]">{style.name}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-400 text-center">Không tìm thấy mã hàng nào</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Loại sản phẩm</label>
            <select 
              value={selectedProductType}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedProductType(val);
                // Auto switch current style if matches
                const matching = allStyles.find(s => s.productType === val);
                if (matching) onStyleChange(matching.code);
              }}
              className="w-full text-sm border-slate-300 rounded-custom py-2 px-3 bg-white focus:ring-1 focus:ring-primary focus:border-primary-container"
            >
              {productTypes.map(pt => (
                <option key={pt} value={pt}>{pt === 'All' ? 'Tất cả sản phẩm' : pt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Loại vải chính</label>
            <select 
              value={selectedFabric}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedFabric(val);
                const matching = allStyles.find(s => s.mainFabric === val);
                if (matching) onStyleChange(matching.code);
              }}
              className="w-full text-sm border-slate-300 rounded-custom py-2 px-3 bg-white focus:ring-1 focus:ring-primary focus:border-primary-container"
            >
              {fabrics.map(fb => (
                <option key={fb} value={fb}>{fb === 'All' ? 'Tất cả loại vải' : fb}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Độ khó bậc công đoạn</label>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full text-sm border-slate-300 rounded-custom py-2 px-3 bg-white focus:ring-1 focus:ring-primary focus:border-primary-container"
            >
              <option value="All">Tất cả khó dễ</option>
              <option value="A">Bậc A (Rất dễ)</option>
              <option value="B">Bậc B (Trung bình)</option>
              <option value="C">Bậc C (Khó)</option>
              <option value="D">Bậc D (Rất khó)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Loại máy cần tuyển</label>
            <select 
              value={selectedMachine} 
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full text-sm border-slate-300 rounded-custom py-2 px-3 bg-white focus:ring-1 focus:ring-primary focus:border-primary-container"
            >
              {machinesList.map(m => (
                <option key={m} value={m}>{m === 'All' ? 'Tất cả các máy' : m}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (searchedStyles.length > 0) {
                  onStyleChange(searchedStyles[0].code);
                  setSearchQuery(searchedStyles[0].code);
                }
              }}
              className="flex-1 bg-primary text-white text-sm py-2 px-3 rounded-custom font-medium hover:bg-opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm kiếm
            </button>
            <button 
              onClick={() => {
                setSelectedProductType('All');
                setSelectedFabric('All');
                setSelectedDifficulty('All');
                setSelectedMachine('All');
                setSearchQuery(allStyles[0].code);
                onStyleChange(allStyles[0].code);
              }}
              title="Đặt lại bộ lọc"
              className="px-3 border border-slate-300 text-slate-500 rounded-custom hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid Dynamic Content */}
      <section id="gsd-kpi-grid" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4 shadow-sm relative group overflow-hidden">
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">SAM CHUẨN (PHÚT/SP)</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-slate-800">{totalSam.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 font-medium">phút</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">SMV: {totalSmv.toFixed(2)} phút</p>
          </div>
          <div className="absolute top-0 right-0 bg-blue-500 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4 shadow-sm relative group overflow-hidden">
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">HIỆU SUẤT KẾ HOẠCH</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <input 
                type="number"
                value={plannedEfficiency}
                onChange={(e) => setPlannedEfficiency(Math.min(100, Math.max(1, Number(e.target.value))))}
                className="w-14 text-xl font-extrabold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-300 focus:border-primary-container focus:bg-white text-center py-0 px-1 rounded-sm focus:outline-none"
              />
              <span className="text-xl font-extrabold text-slate-800">%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">Lịch sử: {currentStyle.historicEfficiency}%</p>
          </div>
          <div className="absolute top-0 right-0 bg-emerald-500 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4 shadow-sm relative group overflow-hidden text-ellipsis">
          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">MANPOWER KẾ HOẠCH</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-slate-800">{totalAllocatedManpower}</span>
              <span className="text-[10px] text-slate-400 font-medium">người</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Op: {workerStats.operators} | Hl: {workerStats.helpers}</p>
          </div>
          <div className="absolute top-0 right-0 bg-purple-500 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4 shadow-sm relative group overflow-hidden">
          <div className="w-11 h-11 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">OUTPUT TARGET / NGÀY</p>
            <div className="flex items-center gap-1 mt-0.5">
              <input 
                type="number"
                step="50"
                value={targetOutputInput}
                onChange={(e) => setTargetOutputInput(Number(e.target.value))}
                onBlur={handleUpdatePlanning}
                className="w-14 text-xl font-extrabold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-transparent hover:border-slate-300 focus:border-primary-container focus:bg-white text-center py-0 px-1 rounded-sm focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 font-medium shrink-0">pcs</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Thời gian: {workingTimeInput} phút</p>
          </div>
          <div className="absolute top-0 right-0 bg-orange-500 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4 shadow-sm relative group overflow-hidden">
          <div className="w-11 h-11 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">LINE TARGET (NHỊP)</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-slate-800">{taktTime.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 font-medium">phút/sp</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Nhịp máy (Takt Time): {taktTime.toFixed(2)}p</p>
          </div>
          <div className="absolute top-0 right-0 bg-sky-500 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-4 shadow-sm relative group overflow-hidden">
          <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">H.SUẤT THỰC TẾ (HÔM QUA)</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-slate-800">{currentStyle.historicEfficiency}%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Sản lượng: {currentStyle.historicOutput} pcs</p>
          </div>
          <div className="absolute top-0 right-0 bg-rose-500 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </section>

      {/* Main Data Area (Routing Table + SAM Bar Chart with Trend line) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Routing Detail Spreadsheet Container */}
        <section className="lg:col-span-2 bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b flex flex-wrap justify-between items-center bg-slate-50 gap-2">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">ROUTING &amp; SAM CHI TIẾT</h2>
              <p className="text-[10px] text-slate-400">Danh mục công đoạn may và phân bổ thời gian chuẩn (GSD)</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAddingStep(true)}
                className="bg-primary hover:bg-opacity-95 text-white text-xs px-3 py-1.5 rounded-custom flex items-center gap-1 cursor-pointer transition-colors"
                title="Đăng ký thêm công đoạn mới"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm công đoạn
              </button>
              <button 
                onClick={() => setIsExcelOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-custom flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Xuất Excel
              </button>
              <button 
                onClick={() => {
                  if (currentStyle.routing.length > 0) {
                    setSelectedGsdStep(currentStyle.routing[0]);
                    setIsGsdModalOpen(true);
                  }
                }}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs px-3 py-1.5 rounded-custom flex items-center gap-1 cursor-pointer transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Xem GSD
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] select-none uppercase font-bold">
                <tr>
                  <th className="px-4 py-3 text-center w-10">STT</th>
                  <th className="px-4 py-3">Mã CĐ</th>
                  <th className="px-4 py-3 min-w-[150px]">Tên Công Đoạn</th>
                  <th className="px-4 py-3 text-center">Thiết Bị</th>
                  <th className="px-3 py-3 text-right">SAM (Mins)</th>
                  <th className="px-3 py-3 text-right">SMV (Mins)</th>
                  <th className="px-3 py-3 text-right">Tỷ Lệ (%)</th>
                  <th className="px-3 py-3 text-center">Bậc CĐ</th>
                  <th className="px-3 py-3 text-center">Kỹ Năng</th>
                  <th className="px-4 py-3 text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRouting.map((step) => {
                  const isHighest = step.sam === Math.max(...currentStyle.routing.map(s => s.sam));
                  return (
                    <tr 
                      key={step.id} 
                      className={`hover:bg-slate-50/50 transition-colors ${isHighest ? 'bg-amber-50/30' : ''}`}
                    >
                      <td className="px-4 py-2.5 text-center text-slate-400 font-bold">{step.stt}</td>
                      <td className="px-4 py-2.5 font-semibold text-primary">{step.opCode}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">
                        {step.opName}
                        {isHighest && (
                          <span className="ml-2 px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded-[2px] text-[8px] font-bold uppercase tracking-wider">
                            Bottleneck
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm text-[10px] font-mono">
                          {step.machineType}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-slate-900">{step.sam.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-500 font-mono">{step.smv.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-700 font-semibold">{step.ratio.toFixed(2)}%</td>
                      <td className="px-3 py-2.5 text-center font-bold">
                        <span className={`px-1.5 py-px rounded-sm border ${
                          step.difficulty === 'D' ? 'bg-red-50 text-red-700 border-red-200' :
                          step.difficulty === 'C' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          step.difficulty === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {step.difficulty}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-semibold text-purple-700">{step.requiredSkill}</td>
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingStep(step)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-primary transition-colors"
                            title="Sửa công đoạn"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="Xóa công đoạn"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-amber-50 font-bold border-t border-amber-200 select-none text-[11px]">
                <tr>
                  <td className="px-4 py-2 text-right uppercase text-slate-600 font-bold" colSpan={4}>Tổng cộng Style</td>
                  <td className="px-3 py-2 text-right text-primary text-xs font-mono font-extrabold">{totalSam.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-slate-700 font-mono font-semibold">{totalSmv.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-emerald-800">100.00%</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-4 py-2 text-[9px] text-slate-400 italic bg-slate-50 border-t border-slate-100 select-none">
            Ghi chú: Độ khó kỹ năng thợ may: B (Dễ) &lt; C (Trung bình) &lt; D (Khó). 
            Tổng số công đoạn hiện hữu: <span className="font-bold text-slate-600">{currentStyle.routing.length}</span>.
          </div>
        </section>

        {/* Responsive Custom SVG Distribution Chart (Combination Chart) */}
        <section className="bg-white rounded-md shadow-sm border border-slate-200 p-5 flex flex-col h-full relative">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-bold text-slate-800 text-xs uppercase tracking-wider">PHÂN BỔ SAM THEO CÔNG ĐOẠN</h2>
            {/* Legend info container */}
            <div className="flex gap-3 text-[9px] select-none">
              <div className="flex items-center gap-1 font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
                <span>SAM (p)</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-slate-600">
                <span className="w-2.5 h-0.5 bg-orange-500 inline-block"></span>
                <span>Tỷ lệ (%)</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mb-6">Trực quan hóa trọng số thời điểm và biến thiên tải trọng thiết bị</p>

          <div className="relative flex-1 min-h-[220px] bg-slate-50/50 rounded border border-slate-100 p-3 flex flex-col justify-between">
            {/* Grid Line lines for chart backdrop */}
            <div className="absolute inset-0 px-3 py-6 flex flex-col justify-between pointer-events-none z-0">
              <div className="border-b border-dashed border-slate-200/60 w-full h-px"></div>
              <div className="border-b border-dashed border-slate-200/60 w-full h-px"></div>
              <div className="border-b border-dashed border-slate-200/60 w-full h-px"></div>
              <div className="border-b border-dashed border-slate-200/60 w-full h-px"></div>
            </div>

            {/* Custom Interactive Bars container using CSS percentages */}
            <div className="h-44 w-full flex items-end justify-between gap-1 relative z-10 px-2">
              {currentStyle.routing.map((step, idx) => {
                const maxSam = Math.max(...currentStyle.routing.map(s => s.sam)) || 1.0;
                const percentHeight = (step.sam / maxSam) * 100;
                const isHighest = step.sam === maxSam;

                return (
                  <div 
                    key={step.id} 
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                    onMouseEnter={() => setHoveredChartBar(idx)}
                    onMouseLeave={() => setHoveredChartBar(null)}
                  >
                    {/* Bar graphic */}
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isHighest ? 'bg-primary-container group-hover:bg-opacity-90' : 'bg-blue-400 group-hover:bg-blue-500'
                      }`}
                      style={{ height: `${percentHeight}%` }}
                    ></div>

                    {/* Quick indicator flag on hover */}
                    {hoveredChartBar === idx && (
                      <div className="absolute -top-12 z-40 bg-slate-900 border border-slate-800 text-white text-[9px] p-2 rounded shadow-xl font-mono min-w-[120px] transition-all duration-200 text-left">
                        <p className="font-bold text-primary-fixed">{step.opCode}</p>
                        <p className="truncate text-slate-300 font-sans">{step.opName}</p>
                        <p className="mt-0.5 text-orange-300">SAM: <span className="font-bold">{step.sam.toFixed(2)}p</span></p>
                        <p className="text-emerald-300">Tỷ lệ: <span className="font-bold">{step.ratio.toFixed(2)}%</span></p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dynamic SVG Sparklines / Spline Trend overlying columns */}
              <svg className="absolute inset-x-0 bottom-0 top-0 h-full w-full pointer-events-none z-20 overflow-visible" preserveAspectRatio="none">
                {currentStyle.routing.length > 1 && (
                  <path 
                    d={currentStyle.routing.map((step, idx) => {
                      const maxRatio = Math.max(...currentStyle.routing.map(s => s.ratio)) || 1.0;
                      // Determine layout coordinate width parameters
                      const wPercent = (idx / (currentStyle.routing.length - 1)) * 100;
                      const x = `calc(${wPercent}% - 0px)`;
                      // Y height mapping from top (0px) to bottom container height
                      const yVal = 176 - ((step.ratio / maxRatio) * 130);
                      return `${idx === 0 ? 'M' : 'L'} ${idx === 0 ? '5' : `calc(${wPercent}% + 3px)`} ${yVal}`;
                    }).join(' ')} 
                    fill="none" 
                    stroke="#f97316" 
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                )}
                {/* Visual Circle Dots points */}
                {currentStyle.routing.map((step, idx) => {
                  const maxRatio = Math.max(...currentStyle.routing.map(s => s.ratio)) || 1.0;
                  const wPercent = (idx / (currentStyle.routing.length - 1)) * 100;
                  const yVal = 176 - ((step.ratio / maxRatio) * 130);
                  // Highlight extreme values
                  const isTop = step.ratio === maxRatio;
                  if (idx % Math.ceil(currentStyle.routing.length / 5) === 0 || isTop) {
                    return (
                      <circle 
                        key={idx}
                        cx={`${wPercent}%`} 
                        cy={yVal} 
                        r={isTop ? "3.5" : "2.5"} 
                        className="transition-all"
                        fill="#ffffff" 
                        stroke="#f97316" 
                        strokeWidth="1.5"
                      />
                    );
                  }
                  return null;
                })}
              </svg>
            </div>

            {/* Rotated Bottom Axis labels */}
            <div className="w-full flex justify-between select-none px-2 pt-2 border-t border-slate-200 mt-2 text-[8px] font-bold text-slate-400 font-mono">
              {currentStyle.routing.map((step, i) => {
                const stepCount = currentStyle.routing.length;
                // Limit names displayed to avoid text overlapping issues on dense datasets
                const shouldDisplayCode = stepCount < 12 || i % Math.ceil(stepCount / 8) === 0 || i === stepCount - 1;
                return (
                  <span key={step.id} className="w-6 text-center shrink-0">
                    {shouldDisplayCode ? step.opCode : ''}
                  </span>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Row Grid: Comparisons, Manpower/Skill Donuts, Bottleneck notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Technical History comparison panel */}
        <section id="gsd-history-comparison" className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">SO SÁNH VỚI LỊCH SỬ</h3>
            <p className="text-[10px] text-slate-400 mb-4 font-medium">Báo cáo cân bằng và chênh lệch thống kê</p>
          </div>
          
          <div className="flex-1 flex flex-col justify-around">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="text-slate-400 font-semibold border-b border-slate-100 select-none">
                <tr>
                  <th className="pb-1.5 uppercase font-medium">Nội Dung</th>
                  <th className="text-right pb-1.5 font-medium">Lịch Sử (Tb)</th>
                  <th className="text-right pb-1.5 font-medium">Kế Hoạch</th>
                  <th className="text-right pb-1.5 font-medium">Chênh Lệch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 font-medium text-slate-600">SAM (phút)</td>
                  <td className="py-2.5 text-right font-mono">{currentStyle.historicSam.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-bold text-slate-950 font-mono">{totalSam.toFixed(2)}</td>
                  <td className={`py-2.5 text-right font-bold font-mono ${
                    totalSam > currentStyle.historicSam ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {totalSam > currentStyle.historicSam ? '+' : ''}{(totalSam - currentStyle.historicSam).toFixed(2)} 
                    <span className="text-[9px] font-normal block">
                      ({(((totalSam - currentStyle.historicSam) / currentStyle.historicSam) * 100).toFixed(2)}%)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-600">SMV (phút)</td>
                  <td className="py-2.5 text-right font-mono">{currentStyle.historicSmv.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-bold text-slate-950 font-mono">{totalSmv.toFixed(2)}</td>
                  <td className={`py-2.5 text-right font-bold font-mono ${
                    totalSmv > currentStyle.historicSmv ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {totalSmv > currentStyle.historicSmv ? '+' : ''}{(totalSmv - currentStyle.historicSmv).toFixed(2)}
                    <span className="text-[9px] font-normal block">
                      ({(((totalSmv - currentStyle.historicSmv) / currentStyle.historicSmv) * 100).toFixed(2)}%)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-600">Hiệu suất (%)</td>
                  <td className="py-2.5 text-right font-mono">{currentStyle.historicEfficiency}%</td>
                  <td className="py-2.5 text-right font-bold text-slate-950 font-mono">{plannedEfficiency}%</td>
                  <td className={`py-2.5 text-right font-bold font-mono ${
                    plannedEfficiency >= currentStyle.historicEfficiency ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {plannedEfficiency >= currentStyle.historicEfficiency ? '+' : ''}{(plannedEfficiency - currentStyle.historicEfficiency).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-slate-600">Sản lượng (ngày)</td>
                  <td className="py-2.5 text-right font-mono">{currentStyle.historicOutput.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-bold text-slate-950 font-mono">{targetOutputInput.toLocaleString()}</td>
                  <td className={`py-2.5 text-right font-bold font-mono ${
                    targetOutputInput >= currentStyle.historicOutput ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {targetOutputInput >= currentStyle.historicOutput ? '+' : ''}{(targetOutputInput - currentStyle.historicOutput).toLocaleString()}
                    <span className="text-[9px] font-normal block">
                      ({(((targetOutputInput - currentStyle.historicOutput) / currentStyle.historicOutput) * 100).toFixed(1)}%)
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Simulated Donut Chart 2: Manpower alloc details */}
        <section id="gsd-manpower-donut" className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col items-center justify-between">
          <div className="w-full">
            <h3 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">PHÂN BỔ MANPOWER</h3>
            <p className="text-[10px] text-slate-400 mb-3 font-medium">Bản đồ điều phối nhân công chuyền</p>
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center select-none my-2">
            <svg className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" fill="transparent" r="46" stroke="#f1f5f9" strokeWidth="9"></circle>
              {/* Highlight Operators sector */}
              <circle 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="46" 
                stroke="#1e40af" 
                strokeWidth="10"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * (workerStats.operatorPerc / 100))}
                className="transition-all duration-500 hover:scale-105"
              ></circle>
              {/* Combine helper offset */}
              <circle 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="46" 
                stroke="#4ade80" 
                strokeWidth="10"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * (workerStats.helperPerc / 100))}
                className="transition-all duration-500 origin-center rotate-180 hover:scale-105"
              ></circle>
            </svg>
            <div className="absolute text-center">
              <span className="block text-lg font-black text-slate-800 font-mono">{totalAllocatedManpower}</span>
              <span className="block text-[8px] text-slate-400 uppercase tracking-wider font-extrabold">Tổng số</span>
            </div>
          </div>

          <div className="w-full space-y-2 mt-2">
            <div className="flex justify-between items-center text-[11px] border-b border-slate-50 pb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                <span className="text-slate-600 font-medium">Operator (May)</span>
              </div>
              <span className="font-extrabold font-mono text-slate-800">{workerStats.operators} <span className="text-slate-400 font-normal">({workerStats.operatorPerc.toFixed(1)}%)</span></span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block"></span>
                <span className="text-slate-600 font-medium">Helper (Phụ trợ)</span>
              </div>
              <span className="font-extrabold font-mono text-slate-800">{workerStats.helpers} <span className="text-slate-400 font-normal">({workerStats.helperPerc.toFixed(1)}%)</span></span>
            </div>
          </div>
        </section>

        {/* Skill capability donut tracker */}
        <section id="gsd-skills-donut" className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col items-center justify-between">
          <div className="w-full">
            <h3 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider font-sans">PHÂN BỔ KỸ NĂNG</h3>
            <p className="text-[10px] text-slate-400 mb-3 font-medium">Phân cấp bậc nghề nghiệp của nhân lực</p>
          </div>

          <div className="relative w-28 h-28 flex items-center justify-center select-none my-2">
            <svg className="w-full h-full -rotate-90">
              <circle cx="56" cy="56" fill="transparent" r="46" stroke="#f1f5f9" strokeWidth="9"></circle>
              {/* Highlight skills segment slices */}
              <circle 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="46" 
                stroke="#3b82f6" 
                strokeWidth="10"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * (workerStats.skillBPerc / 100))}
              ></circle>
              <circle 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="46" 
                stroke="#10b981" 
                strokeWidth="10"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * (workerStats.skillCPerc / 100))}
                className="origin-center rotate-45"
              ></circle>
              <circle 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="46" 
                stroke="#f97316" 
                strokeWidth="10"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * (workerStats.skillDPerc / 100))}
                className="origin-center rotate-180"
              ></circle>
            </svg>
            <div className="absolute text-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-rose-500 rounded-sm"></span>
              <span className="text-slate-500 font-bold">A</span>
              <span className="text-slate-700 font-mono font-medium">{workerStats.skillA} ({workerStats.skillAPerc.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-sm"></span>
              <span className="text-slate-500 font-bold">B</span>
              <span className="text-slate-700 font-mono font-medium">{workerStats.skillB} ({workerStats.skillBPerc.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-sm"></span>
              <span className="text-slate-500 font-bold">C</span>
              <span className="text-slate-700 font-mono font-medium">{workerStats.skillC} ({workerStats.skillCPerc.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-sm"></span>
              <span className="text-slate-500 font-bold">D</span>
              <span className="text-slate-700 font-mono font-medium">{workerStats.skillD} ({workerStats.skillDPerc.toFixed(0)}%)</span>
            </div>
          </div>
        </section>

        {/* Bottleneck Alerts container */}
        <section id="gsd-bottleneck-alerts" className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">BOTTLENECK CẢNH BÁO</h3>
            <p className="text-[10px] text-slate-400 mb-4 font-medium">Báo động điểm thắt nút sụt giảm năng suất</p>
          </div>

          <div className="flex-1 space-y-3 flex flex-col justify-center">
            {bottleneckAlerts.map((alert, idx) => {
              const bgCircle = alert.type === 'error' ? 'bg-rose-500 text-white' : 
                               alert.type === 'warning' ? 'bg-orange-500 text-white' : 
                               'bg-blue-500 text-white';

              return (
                <div key={idx} className="flex gap-2.5 items-start">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${bgCircle}`}>
                    {alert.type === 'error' ? '!' : alert.type === 'warning' ? '▲' : 'i'}
                  </div>
                  <div className="text-[11px] leading-tight flex-1">
                    <p className="font-extrabold text-slate-800 font-sans">{alert.text}</p>
                    <p className="text-slate-500 mt-0.5">{alert.subText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Operation Action forms Modals */}
      {editingStep && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveStepEdit}
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col"
          >
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm">Chỉnh sửa công đoạn can thiệp</h4>
                <p className="text-xs text-blue-200 mt-0.5">{editingStep.opCode} - {editingStep.opName}</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingStep(null)}
                className="text-white/80 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tên công đoạn may</label>
                <input 
                  type="text" 
                  value={editingStep.opName}
                  onChange={(e) => setEditingStep({...editingStep, opName: e.target.value})}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mã công đoạn</label>
                  <input 
                    type="text" 
                    value={editingStep.opCode}
                    onChange={(e) => setEditingStep({...editingStep, opCode: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Thiết bị / Máy sử dụng</label>
                  <input 
                    type="text" 
                    value={editingStep.machineType}
                    onChange={(e) => setEditingStep({...editingStep, machineType: e.target.value})}
                    className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. 1N, 2N, Kansai"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">SAM Định mức (Phút)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editingStep.sam}
                    onChange={(e) => setEditingStep({...editingStep, sam: Number(e.target.value), smv: Number(e.target.value) * 0.92})}
                    className="w-full border border-slate-300 rounded p-2 font-mono font-bold text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">SMV Công ích (Phút)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editingStep.smv}
                    onChange={(e) => setEditingStep({...editingStep, smv: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 font-mono text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Số thợ may biên chế</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={editingStep.assignedWorkersCount}
                    onChange={(e) => setEditingStep({...editingStep, assignedWorkersCount: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Khó bậc CĐ</label>
                  <select
                    value={editingStep.difficulty}
                    onChange={(e) => setEditingStep({...editingStep, difficulty: e.target.value as SkillLevel})}
                    className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="A">Bậc A</option>
                    <option value="B">Bậc B</option>
                    <option value="C">Bậc C</option>
                    <option value="D">Bậc D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Kỹ năng Thợ</label>
                  <select
                    value={editingStep.requiredSkill}
                    onChange={(e) => setEditingStep({...editingStep, requiredSkill: e.target.value as SkillLevel})}
                    className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="A">Thợ A (Sơ cấp)</option>
                    <option value="B">Thợ B (Trung cấp)</option>
                    <option value="C">Thợ C (Cứng tay)</option>
                    <option value="D">Thợ D (Chuyên gia)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setEditingStep(null)}
                className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-primary text-white rounded hover:bg-opacity-95 text-xs font-semibold shadow transition-colors"
              >
                Lưu sửa đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Step Form Modal */}
      {isAddingStep && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddStepSubmit}
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col"
          >
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm">Thêm công đoạn dập quy trình mới</h4>
                <p className="text-xs text-blue-200 mt-0.5">Biên soạn bổ sung vào cấu trúc GSD đang vận hành</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddingStep(false)}
                className="text-white/80 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tên công đoạn định danh</label>
                <input 
                  type="text" 
                  value={newStep.opName || ''}
                  onChange={(e) => setNewStep({...newStep, opName: e.target.value})}
                  placeholder="e.g. May khóa nẹp chính"
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Mã công đoạn (OpCode)</label>
                  <input 
                    type="text" 
                    value={newStep.opCode || ''}
                    onChange={(e) => setNewStep({...newStep, opCode: e.target.value.toUpperCase()})}
                    placeholder="e.g. OP085"
                    className="w-full border border-slate-300 rounded p-2 font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Thiết bị may mặc</label>
                  <input 
                    type="text" 
                    value={newStep.machineType || ''}
                    onChange={(e) => setNewStep({...newStep, machineType: e.target.value})}
                    placeholder="e.g. 1N, 2N, Kansai, Thắt nút"
                    className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">SAM Tiêu chuẩn (Phút)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0.1"
                    value={newStep.sam}
                    onChange={(e) => setNewStep({...newStep, sam: Number(e.target.value), smv: Number(e.target.value) * 0.92})}
                    className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">SMV Công ích ước tính</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newStep.smv}
                    onChange={(e) => setNewStep({...newStep, smv: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 font-mono text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Độ khó bậc công đoạn</label>
                  <select
                    value={newStep.difficulty}
                    onChange={(e) => setNewStep({...newStep, difficulty: e.target.value as SkillLevel})}
                    className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="A">Bậc A (Dễ)</option>
                    <option value="B">Bậc B (Trung bình)</option>
                    <option value="C">Bậc C (Khó)</option>
                    <option value="D">Bậc D (Rất khó)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Trình độ thợ may</label>
                  <select
                    value={newStep.requiredSkill}
                    onChange={(e) => setNewStep({...newStep, requiredSkill: e.target.value as SkillLevel})}
                    className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="A">Bậc A</option>
                    <option value="B">Bậc B</option>
                    <option value="C">Bậc C</option>
                    <option value="D">Bậc D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Số thợ phân phối</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="12"
                    value={newStep.assignedWorkersCount}
                    onChange={(e) => setNewStep({...newStep, assignedWorkersCount: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setIsAddingStep(false)}
                className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-primary text-white rounded hover:bg-opacity-95 text-xs font-semibold shadow transition-colors"
              >
                Bổ sung quy trình
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Visual GSD Operation Flow Chart Modal */}
      {isGsdModalOpen && selectedGsdStep && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <div>
                <strong className="block text-sm">GSD Giao diện Vận Hành &amp; Sơ đồ chuyển dịch công đoạn</strong>
                <span className="text-xs text-blue-200 mt-1">{currentStyle.code} - {currentStyle.name}</span>
              </div>
              <button 
                onClick={() => setIsGsdModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Công đoạn đang xem</p>
                  <p className="text-lg font-bold text-primary mt-1">{selectedGsdStep.opCode}: {selectedGsdStep.opName}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 rounded text-indigo-700 font-bold font-mono">
                    SAM: {selectedGsdStep.sam.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Visual Process Sequence Graphic */}
              <div>
                <strong className="block text-xs text-slate-600 mb-3 uppercase tracking-wider">Chuỗi công đoạn dây chuyền may liền kề</strong>
                <div className="flex items-center justify-between gap-2 overflow-x-auto py-3">
                  {currentStyle.routing.slice(0, 5).map((step, index) => {
                    const isSelected = step.opCode === selectedGsdStep.opCode;
                    return (
                      <React.Fragment key={step.id}>
                        <div 
                          onClick={() => setSelectedGsdStep(step)}
                          className={`p-3 rounded border text-center shrink-0 w-24 cursor-pointer transition-all ${
                            isSelected ? 'bg-primary text-white border-primary-container shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <span className="block text-[9px] font-mono opacity-80">{step.opCode}</span>
                          <span className="block text-[10px] truncate font-bold mt-1">{step.opName}</span>
                          <span className="block text-[9px] font-mono mt-1 opacity-90">{step.sam.toFixed(2)}p</span>
                        </div>
                        {index < 4 && index < currentStyle.routing.slice(0, 5).length - 1 && (
                          <div className="text-slate-300 font-bold text-lg">➔</div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Technical breakdown description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                  <h5 className="font-extrabold text-slate-800 mb-2 uppercase">Thông số kỹ thuật may mặc</h5>
                  <ul className="space-y-1.5">
                    <li className="flex justify-between border-b border-white pb-1">
                      <span>Thiết bị tiêu chuẩn:</span>
                      <strong className="text-slate-800">{selectedGsdStep.machineType}</strong>
                    </li>
                    <li className="flex justify-between border-b border-white pb-1">
                      <span>Định giá SAM chu kỳ:</span>
                      <strong className="text-slate-800">{selectedGsdStep.sam.toFixed(2)} phút</strong>
                    </li>
                    <li className="flex justify-between border-b border-white pb-1">
                      <span>Chất lượng SMV chuẩn:</span>
                      <strong className="text-slate-800">{selectedGsdStep.smv.toFixed(2)} phút</strong>
                    </li>
                    <li className="flex justify-between pb-1">
                      <span>Trọng số tỷ trọng:</span>
                      <strong className="text-emerald-700">{selectedGsdStep.ratio.toFixed(2)}%</strong>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                  <h5 className="font-extrabold text-slate-800 mb-2 uppercase">Điều phối lao động & tay nghề</h5>
                  <ul className="space-y-1.5">
                    <li className="flex justify-between border-b border-white pb-1">
                      <span>Phân định độ khó:</span>
                      <strong className="text-indigo-700">Cấp {selectedGsdStep.difficulty}</strong>
                    </li>
                    <li className="flex justify-between border-b border-white pb-1">
                      <span>Trình độ yêu cầu tối thiểu:</span>
                      <strong className="text-purple-700">Mức {selectedGsdStep.requiredSkill}</strong>
                    </li>
                    <li className="flex justify-between border-b border-white pb-1">
                      <span>Định mức thợ yêu cầu:</span>
                      <strong className="text-slate-800">{selectedGsdStep.assignedWorkersCount} thợ may</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Nhân sự đang phụ trách:</span>
                      <strong className="text-blue-800 font-mono">
                        {selectedGsdStep.assignedWorkerIds.length} / {selectedGsdStep.assignedWorkersCount}
                      </strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end rounded-b-lg">
              <button
                onClick={() => setIsGsdModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 hover:bg-slate-300 rounded text-xs font-semibold cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel document report simulation popup */}
      <ExcelExportModal 
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        styleCode={currentStyle.code}
        styleName={currentStyle.name}
        routingData={currentStyle.routing}
      />
    </div>
  );
}
