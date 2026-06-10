import React, { useState, useMemo } from 'react';
import { Style, RoutingStep, Worker } from '../types';

interface LineBalancingViewProps {
  currentStyle: Style;
  allWorkers: Worker[];
  onUpdateStyle: (updatedStyle: Style) => void;
  onUpdateWorkers: (updatedWorkers: Worker[]) => void;
}

export default function LineBalancingView({
  currentStyle,
  allWorkers,
  onUpdateStyle,
  onUpdateWorkers
}: LineBalancingViewProps) {
  // Currently selected operation card for assignment intervention
  const [selectedOpCode, setSelectedOpCode] = useState<string | null>(null);

  // Filter available workers in assignment pool
  const [personnelRole, setPersonnelRole] = useState<'All' | 'Operator' | 'Helper'>('All');
  const [personnelSkill, setPersonnelSkill] = useState<'All' | 'A' | 'B' | 'C' | 'D'>('All');
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState<boolean>(false);

  // Computations
  const totalSam = useMemo(() => {
    return currentStyle.routing.reduce((acc, step) => acc + step.sam, 0);
  }, [currentStyle.routing]);

  // Takt Time limit = Working time / Target output
  const taktTime = useMemo(() => {
    if (currentStyle.targetOutput <= 0) return 0.50;
    return currentStyle.workingTime / currentStyle.targetOutput;
  }, [currentStyle.workingTime, currentStyle.targetOutput]);

  // Detailed routing step metrics including calculated station time (SAM / Assigned operator count)
  const balancingData = useMemo(() => {
    return currentStyle.routing.map(step => {
      const allocatedWorkers = step.assignedWorkersCount || 1;
      const calculatedCycleTime = step.sam / allocatedWorkers;
      const isBottleneck = calculatedCycleTime > taktTime;

      return {
        ...step,
        allocatedWorkers,
        calculatedCycleTime,
        isBottleneck,
        utilizationRatio: Number(((calculatedCycleTime / taktTime) * 100).toFixed(1))
      };
    }).sort((a, b) => a.stt - b.stt);
  }, [currentStyle.routing, taktTime]);

  // Overall Line of Balance (LOB) calculation
  // Formula: LOB % = Sum(SAM) / (Station Count * Max Station Cycle Time) * 100
  const lobMetrics = useMemo(() => {
    if (balancingData.length === 0) return { lob: 0, smoothness: 0, maxCycle: 0, bottleneckCount: 0 };

    const maxCycleTime = Math.max(...balancingData.map(d => d.calculatedCycleTime));
    const stationCount = balancingData.length;
    
    // Balanced Line Efficiency
    const lob = maxCycleTime > 0 ? (totalSam / (stationCount * maxCycleTime)) * 100 : 0;
    
    // Smoothness index (standard deviation approximation of cycle times)
    let sumSquares = 0;
    balancingData.forEach(d => {
      sumSquares += Math.pow(maxCycleTime - d.calculatedCycleTime, 2);
    });
    const smoothness = Math.sqrt(sumSquares / stationCount);

    const bottleneckCount = balancingData.filter(d => d.isBottleneck).length;

    return {
      lob,
      smoothness,
      maxCycle: maxCycleTime,
      bottleneckCount
    };
  }, [balancingData, totalSam]);

  // Find currently focused operation
  const activeOp = useMemo(() => {
    return currentStyle.routing.find(r => r.opCode === selectedOpCode);
  }, [currentStyle.routing, selectedOpCode]);

  // Filtered workers list for assignment modal
  const filteredPersonnel = useMemo(() => {
    return allWorkers.filter(w => {
      const roleMatch = personnelRole === 'All' || w.role === personnelRole;
      const skillMatch = personnelSkill === 'All' || w.skillLevel === personnelSkill;
      const assignmentMatch = !showOnlyUnassigned || !w.assignedOpId || w.assignedOpId === selectedOpCode;
      return roleMatch && skillMatch && assignmentMatch;
    });
  }, [allWorkers, personnelRole, personnelSkill, showOnlyUnassigned, selectedOpCode]);

  // Toggle employee assignment to the active operation
  const handleAssignWorker = (workerId: string) => {
    if (!selectedOpCode) return;

    // Check current step
    const targetStepIndex = currentStyle.routing.findIndex(r => r.opCode === selectedOpCode);
    if (targetStepIndex === -1) return;

    const clonedRouting = [...currentStyle.routing];
    const step = { ...clonedRouting[targetStepIndex] };
    const clonedWorkers = allWorkers.map(w => ({ ...w }));

    const workerIndex = clonedWorkers.findIndex(w => w.id === workerId);
    if (workerIndex === -1) return;

    const worker = clonedWorkers[workerIndex];

    const isCurrentlyAssigned = step.assignedWorkerIds.includes(workerId);

    if (isCurrentlyAssigned) {
      // Unassign worker
      step.assignedWorkerIds = step.assignedWorkerIds.filter(id => id !== workerId);
      step.assignedWorkersCount = Math.max(1, step.assignedWorkerIds.length);
      worker.assignedOpId = null;
    } else {
      // Assign worker: Remove former assignment of this worker if any
      const previousOpCode = worker.assignedOpId;
      if (previousOpCode) {
        const prevStepIdx = clonedRouting.findIndex(r => r.opCode === previousOpCode);
        if (prevStepIdx !== -1) {
          clonedRouting[prevStepIdx] = {
            ...clonedRouting[prevStepIdx],
            assignedWorkerIds: clonedRouting[prevStepIdx].assignedWorkerIds.filter(id => id !== workerId),
            assignedWorkersCount: Math.max(1, clonedRouting[prevStepIdx].assignedWorkerIds.filter(id => id !== workerId).length)
          };
        }
      }

      step.assignedWorkerIds.push(workerId);
      step.assignedWorkersCount = step.assignedWorkerIds.length;
      worker.assignedOpId = selectedOpCode;
    }

    clonedRouting[targetStepIndex] = step;

    // Update global states
    onUpdateStyle({
      ...currentStyle,
      routing: clonedRouting
    });
    onUpdateWorkers(clonedWorkers);
  };

  // Automated smart line balancing suggestion helper
  const handleAutoOptimizeLine = () => {
    if (confirm('Hệ thống LOB AI tự động điều chuyển thợ may theo đúng tải trọng và trình độ kỹ năng tối ưu?')) {
      const clonedRouting = currentStyle.routing.map(s => ({ ...s, assignedWorkerIds: [] as string[] }));
      const clonedWorkers = allWorkers.map(w => ({ ...w, assignedOpId: null as string | null }));

      // Distribute helper roles (Workers W001 - W015) to help stations first
      const helpers = clonedWorkers.filter(w => w.role === 'Helper');
      const operators = clonedWorkers.filter(w => w.role === 'Operator');

      // Sort operations by standard SAM high to low to address bottlenecks first
      const sortedBySam = [...clonedRouting].sort((a, b) => b.sam - a.sam);

      // Assign helpers to top heavy processes
      sortedBySam.forEach((step, idx) => {
        if (idx < helpers.length) {
          const hp = helpers[idx];
          hp.assignedOpId = step.opCode;
          step.assignedWorkerIds.push(hp.id);
        }
      });

      // Allocate Operators based on required skills
      clonedRouting.forEach(step => {
        // Find requirements
        const maxNeeded = step.assignedWorkersCount;
        let assigned = step.assignedWorkerIds.length;

        const skillWeights = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
        const reqWeight = skillWeights[step.requiredSkill] || 1;

        // Take available matching skilled operators
        while (assigned < maxNeeded) {
          const eligibleOp = operators.find(o => {
            if (o.assignedOpId) return false;
            const ow = skillWeights[o.skillLevel] || 1;
            return ow >= reqWeight;
          });

          if (eligibleOp) {
            eligibleOp.assignedOpId = step.opCode;
            step.assignedWorkerIds.push(eligibleOp.id);
            assigned++;
          } else {
            // Take any fallback operator
            const anyOp = operators.find(o => !o.assignedOpId);
            if (anyOp) {
              anyOp.assignedOpId = step.opCode;
              step.assignedWorkerIds.push(anyOp.id);
              assigned++;
            } else {
              break; // No more operators left
            }
          }
        }
        step.assignedWorkersCount = Math.max(1, step.assignedWorkerIds.length);
      });

      onUpdateStyle({
        ...currentStyle,
        routing: clonedRouting
      });
      onUpdateWorkers(clonedWorkers);
    }
  };

  return (
    <div className="space-y-6">
      {/* LOB Performance Dashboard Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4" id="lob-analytics">
        <div className="bg-white p-4 rounded border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.003 9.003 0 1020.95 12H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Hiệu suất LOB chuyền</span>
            <strong className="text-2xl font-black font-mono text-primary">{lobMetrics.lob.toFixed(1)}%</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Tiêu chuẩn chuyền cân bằng: &gt; 85%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Nút thắt cổ chai hoạt động</span>
            <strong className={`text-2xl font-black font-mono ${lobMetrics.bottleneckCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {lobMetrics.bottleneckCount} trạm
            </strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Vượt ngưỡng Takt Time ({taktTime.toFixed(2)}p)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Thời gian trạm lớn nhất</span>
            <strong className="text-2xl font-black font-mono text-slate-800">{lobMetrics.maxCycle.toFixed(2)}p</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Tiêu chuẩn phân xưởng ({taktTime.toFixed(2)}p)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1">
            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tự động hóa bốc xếp thợ</span>
            <button 
              onClick={handleAutoOptimizeLine}
              className="mt-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1 px-2.5 rounded cursor-pointer transition-colors shadow-sm block w-full text-center"
            >
              Vận hành tự cân bằng thợ
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace: Chart on Left, list card details with assignment interactions on Right */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Line-of-Balance Bar Chart comparison */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-extrabold text-[#111827] text-sm uppercase">SƠ ĐỒ CÂN BẰNG CHUYỀN (LOB CHART)</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">So sánh nhịp sản xuất tối đa thực tế (giây/sp) với định mức nhịp cơ bản (Takt Time)</p>
          </div>

          <div className="relative min-h-[300px] border border-slate-100 bg-slate-50/50 p-4 rounded flex flex-col justify-between">
            
            {/* Visual Red Takt limits line overlay */}
            <div className="absolute inset-x-0 top-1/2 -mt-4 border-b-2 border-dashed border-rose-500 pointer-events-none z-25 text-right px-4">
              <span className="bg-rose-50 px-2 py-0.5 text-[8px] font-extrabold text-rose-600 rounded uppercase tracking-wider shadow">
                Takt Time: {taktTime.toFixed(2)} phút
              </span>
            </div>

            {/* Grid backgrounds */}
            <div className="absolute inset-0 px-4 py-8 flex flex-col justify-between pointer-events-none z-0 opacity-70">
              <div className="border-b border-slate-200/50 w-full h-px"></div>
              <div className="border-b border-slice w-full h-px"></div>
              <div className="border-b border-slate-200/50 w-full h-px"></div>
              <div className="border-b border-slate-200/50 w-full h-px"></div>
            </div>

            {/* Simulated interactive charts columns */}
            <div className="h-56 w-full flex items-end justify-between gap-1.5 px-3 relative z-10">
              {balancingData.map((d) => {
                // Determine heights mapping. Take 2.5 mins as absolute top height metric
                const maxScaledTime = Math.max(2.5, taktTime * 2);
                const heightPercent = Math.min(100, (d.calculatedCycleTime / maxScaledTime) * 100);

                return (
                  <div 
                    key={d.id} 
                    onClick={() => setSelectedOpCode(d.opCode)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                  >
                    {/* The bar visual */}
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        d.isBottleneck 
                          ? 'bg-rose-500 shadow-md group-hover:bg-rose-600 shadow-rose-100' 
                          : 'bg-emerald-500 group-hover:bg-emerald-600'
                      } ${selectedOpCode === d.opCode ? 'ring-2 ring-primary ring-offset-1 ring-opacity-80' : ''}`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Active floating code stat */}
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 block text-[9px] font-mono font-bold text-slate-700 select-none group-hover:scale-110">
                        {d.calculatedCycleTime.toFixed(2)}
                      </span>
                    </div>

                    {/* Miniature visual indicator icon of workers counts */}
                    <span className="text-[7px] text-slate-400 block mt-1 font-mono font-bold select-none truncate">
                      {d.allocatedWorkers} thợ
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="w-full pt-2 flex justify-between select-none px-3 text-[8px] font-bold text-slate-400 font-mono border-t border-slate-200/70">
              {balancingData.map(d => (
                <span key={d.id} className="w-6 text-center text-ellipsis overflow-hidden shrink-0">
                  {d.opCode}
                </span>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-3 select-none">
            * Nhấp vào bất kỳ cột công đoạn nào để thay thế thợ may trực thuộc nẹp chuyền may ở bảng cấu hình bên phải.
          </p>
        </div>

        {/* Station Assignment Editor Panel */}
        <div className="bg-white border border-slate-200 rounded p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase">BẢNG ĐIỀU PHỐI NHÂN LỰC</h3>
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-mono select-none">
                {selectedOpCode || 'Chưa chọn'}
              </span>
            </div>

            {activeOp ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs">
                  <p className="font-bold text-primary text-xs">{activeOp.opCode}: {activeOp.opName}</p>
                  <div className="grid grid-cols-2 mt-2 gap-y-1.5 font-mono text-[10px] text-slate-500">
                    <div>Thiết bị: <strong className="text-slate-700">{activeOp.machineType}</strong></div>
                    <div>SAM chu kỳ: <strong className="text-slate-700 font-bold">{activeOp.sam.toFixed(2)}p</strong></div>
                    <div>Yêu cầu trình độ: <strong className="text-purple-700 font-bold">{activeOp.requiredSkill}</strong></div>
                    <div>Thợ định biên: <strong className="text-slate-700 font-bold">{activeOp.assignedWorkersCount} người</strong></div>
                  </div>
                </div>

                {/* Worker selection table filters */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 select-none">
                    <span>Lọc thợ tuyển nâng cao:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showOnlyUnassigned} 
                        onChange={(e) => setShowOnlyUnassigned(e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary w-3 h-3"
                      />
                      <span>Thợ chưa phân việc</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={personnelRole}
                      onChange={(e) => setPersonnelRole(e.target.value as any)}
                      className="text-[10px] border border-slate-300 rounded p-1"
                    >
                      <option value="All">Mọi vai trò</option>
                      <option value="Operator">Operator (Thợ may)</option>
                      <option value="Helper">Helper (Phụ trợ)</option>
                    </select>

                    <select 
                      value={personnelSkill}
                      onChange={(e) => setPersonnelSkill(e.target.value as any)}
                      className="text-[10px] border border-slate-300 rounded p-1"
                    >
                      <option value="All">Mọi cấp bậc</option>
                      <option value="A">Bậc A (Sơ cấp)</option>
                      <option value="B">Bậc B</option>
                      <option value="C">Bậc C</option>
                      <option value="D">Bậc D (Chuyên gia)</option>
                    </select>
                  </div>
                </div>

                {/* Inner list sheet of Personnel */}
                <div className="border border-slate-200 rounded max-h-[190px] overflow-y-auto divide-y divide-slate-100 text-[11px] custom-scrollbar">
                  {filteredPersonnel.map((worker) => {
                    const isAssignedToThis = worker.assignedOpId === selectedOpCode;
                    const isAssignedToOther = worker.assignedOpId && worker.assignedOpId !== selectedOpCode;

                    return (
                      <div 
                        key={worker.id}
                        className={`p-2 flex items-center justify-between ${
                          isAssignedToThis ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-800">{worker.id}</span>
                            <span className="font-semibold text-slate-700">{worker.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Cấp {worker.skillLevel} • {worker.role} • {worker.efficiency}% Hs
                            {isAssignedToOther && (
                              <span className="text-rose-500 ml-1.5 font-bold font-sans">
                                (Trực trạm: {worker.assignedOpId})
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAssignWorker(worker.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                            isAssignedToThis 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {isAssignedToThis ? 'Đang giao' : 'Giao việc'}
                        </button>
                      </div>
                    );
                  })}
                  {filteredPersonnel.length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-[11px]">No matching workers available</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 p-8 text-center text-slate-400 rounded-lg text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Hãy nhấp chọn một cột trạm công đoạn trên biểu đồ cân bằng hoặc bảng dữ liệu bên trái để bắt đầu bốc xếp thợ.
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 leading-normal select-none">
            Lưu ý: Bằng việc bốc xếp thêm nhân công may vào cùng một bộ dập nẹp chuyền, trạm sẽ hoạt động song song để chia đều thời gian hoàn thành (SAM / nhân sự), giúp gạt bỏ điểm thắt nghẹt cổ chai.
          </div>
        </div>
      </section>
    </div>
  );
}
