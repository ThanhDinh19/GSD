import { Style, Worker, SkillLevel, OrderCapacity } from './types';

// Let's generate 87 workers matching the exact statistics from the screenshot:
// Total: 87
// Roles: 72 Operators, 15 Helpers
// Skill Levels: 54 B (62.1%), 30 C (34.5%), 3 D (3.4%), 0 A (0%)
export const defaultWorkers: Worker[] = [];

// Helper roles matching distribution
// 15 Helpers (all other 72 are Operators)
// Skill breakdown:
// 3 D skill level (top operators for difficult operations like NHỒI LÔNG)
// 30 C skill level (medium difficulty)
// 54 B skill level (standard sewists)
// We will assign them realistic names and default roles

const vietnameseNames = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Chinh', 'Phạm Minh Danh', 'Vũ Thị Giang',
  'Ngô Quốc Dũng', 'Đỗ Thầy Đạt', 'Bùi Thị Hà', 'Hoàng Văn Hậu', 'Dương Thị Hoa',
  'Lý Văn Hùng', 'Chu Quốc Khánh', 'Phan Minh Khang', 'Vũ Thị Lan', 'Nguyễn Tiến Long',
  'Trần Đức Mạnh', 'Lê Thị Mai', 'Phạm Thanh Nam', 'Đỗ Quốc Phong', 'Ngô Thị Quỳnh',
  'Bùi Văn Sang', 'Vũ Thị Thảo', 'Hoàng Minh Tiến', 'Trần Văn Toàn', 'Nguyễn Thị Uyên',
  'Phạm Vĩnh Xuân', 'Lê Hữu Yên', 'Đặng Ngọc Anh', 'Hồ Thị Bích', 'Võ Văn Cường',
  'Trịnh Hoài Danh', 'Lương Đức Duy', 'Mai Kim Dung', 'Đoàn Đình Đạt', 'Đỗ Thị Hạnh',
  'Nguyễn Huy Hoàng', 'Trần Khánh Huyền', 'Lê Hữu Đạt', 'Phạm Thu Hương', 'Phan Văn Hải',
  'Nguyễn Quốc Định', 'Trần Thị Hoài', 'Lê Quang Liêm', 'Vũ Toàn Thắng', 'Phạm Thị Thùy',
  'Đặng Văn Lâm', 'Hoàng Thị Mỹ', 'Nguyễn Thành Luân', 'Trần Thị Nhung', 'Bùi Hồng Ngọc',
  'Vũ Văn Quyết', 'Lê Quốc Trung', 'Phạm Thu Trang', 'Nguyễn Thị Vân', 'Ngô Văn Vũ',
  'Hoàng Xuân Sơn', 'Đặng Trung Kiên', 'Trần Ngọc Ly', 'Nguyễn Phương Thảo', 'Phạm Thanh Tùng',
  'Bùi Quốc Anh', 'Lê Văn Khải', 'Nguyễn Thị Diễm', 'Vũ Đức Thịnh', 'Phạm Trọng Nghĩa',
  'Nguyễn Hữu Chiến', 'Trần Minh Quân', 'Lê Việt Đức', 'Phạm Kiều Trang', 'Đỗ Duy Mạnh',
  'Nguyễn Tiến Linh', 'Hoàng Văn Lâm', 'Nguyễn Thị Tuyết', 'Trần Huy Phong', 'Lê Văn Nam',
  'Vũ Minh Tuấn', 'Phạm Minh Vương', 'Nguyễn Công Phượng', 'Nguyễn Quang Hải', 'Đoàn Văn Hậu',
  'Quế Ngọc Hải', 'Bùi Tiến Dũng', 'Trần Đình Trọng', 'Phan Văn Đức', 'Nguyễn Văn Toàn',
  'Nguyễn Tuấn Anh', 'Lương Xuân Trường'
];

// Seed the 87 workers
for (let i = 0; i < 87; i++) {
  const name = vietnameseNames[i] || `Nhân phẩm thợ may ${i + 1}`;
  
  // Decide role: index 0 to 14 (15 people) are Helpers. The rest (72) are Operators.
  const role = i < 15 ? 'Helper' : 'Operator';
  
  // Decide skill:
  // 3 D (Indices 84, 85, 86)
  // 30 C (Indices 15 to 44)
  // 54 B (Indices 0 to 14 (Helpers) and 45 to 83)
  let skillLevel: SkillLevel = 'B';
  if (i >= 84) {
    skillLevel = 'D';
  } else if (i >= 15 && i < 45) {
    skillLevel = 'C';
  }
  
  // Set efficiency realistically based on skills
  let efficiency = 70;
  if (skillLevel === 'D') efficiency = 92;
  else if (skillLevel === 'C') efficiency = 80;
  else if (role === 'Operator') efficiency = 75;
  else efficiency = 65; // Helper efficiency is usually a bit lower on sewing

  defaultWorkers.push({
    id: `W${(i + 1).toString().padStart(3, '0')}`,
    name,
    role,
    skillLevel,
    efficiency,
    assignedOpId: null, // assigned dynamically later
  });
}

export const defaultStyles: Style[] = [
  {
    code: 'DOWN-JK-2201',
    name: 'Áo phao lông vũ ấm áp mùa đông (Down Jacket Premium)',
    productType: 'Down Jacket',
    mainFabric: 'Nylon Taslon',
    targetOutput: 1200,
    workingTime: 600,
    historicSam: 31.20,
    historicSmv: 28.70,
    historicEfficiency: 74.2,
    historicOutput: 1180,
    routing: [
      { id: '1', stt: 1, opCode: 'OP010', opName: 'May vai thân trước', machineType: '1N', sam: 0.85, smv: 0.79, ratio: 2.62, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '2', stt: 2, opCode: 'OP020', opName: 'May vai thân sau', machineType: '1N', sam: 0.80, smv: 0.74, ratio: 2.46, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '3', stt: 3, opCode: 'OP030', opName: 'May nối vai', machineType: '1N', sam: 0.75, smv: 0.70, ratio: 2.31, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '4', stt: 4, opCode: 'OP040', opName: 'Tra tay', machineType: '2N', sam: 1.20, smv: 1.12, ratio: 3.69, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 3, assignedWorkerIds: [] },
      { id: '5', stt: 5, opCode: 'OP050', opName: 'May sườn', machineType: '1N', sam: 0.95, smv: 0.88, ratio: 2.92, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '6', stt: 6, opCode: 'OP060', opName: 'May cổ', machineType: '1N', sam: 0.75, smv: 0.70, ratio: 2.31, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '7', stt: 7, opCode: 'OP070', opName: 'Gắn mũ', machineType: '1N', sam: 1.10, smv: 1.02, ratio: 3.38, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '8', stt: 8, opCode: 'OP080', opName: 'May khóa kéo', machineType: '1N', sam: 1.40, smv: 1.30, ratio: 4.31, difficulty: 'C', requiredSkill: 'B', assignedWorkersCount: 3, assignedWorkerIds: [] },
      { id: '9', stt: 9, opCode: 'OP090', opName: 'May túi kéo khóa sườn', machineType: '1N', sam: 1.50, smv: 1.38, ratio: 4.62, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 3, assignedWorkerIds: [] },
      { id: '10', stt: 10, opCode: 'OP100', opName: 'May lót túi trong', machineType: '1N', sam: 1.25, smv: 1.15, ratio: 3.85, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '11', stt: 11, opCode: 'OP110', opName: 'May diễu nẹp mũ', machineType: '1N', sam: 1.35, smv: 1.24, ratio: 4.15, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '12', stt: 12, opCode: 'OP120', opName: 'Thổi lông vũ và may chần ô (thân trước)', machineType: 'Máy nhồi lông', sam: 4.50, smv: 4.10, ratio: 13.85, difficulty: 'D', requiredSkill: 'D', assignedWorkersCount: 6, assignedWorkerIds: [] },
      { id: '13', stt: 13, opCode: 'OP130', opName: 'Thổi lông vũ và may chần ô (thân sau)', machineType: 'Máy nhồi lông', sam: 4.20, smv: 3.85, ratio: 12.92, difficulty: 'D', requiredSkill: 'D', assignedWorkersCount: 6, assignedWorkerIds: [] },
      { id: '14', stt: 14, opCode: 'OP140', opName: 'Thổi lông vũ và may chần ô (tay áo)', machineType: 'Máy nhồi lông', sam: 3.80, smv: 3.50, ratio: 11.69, difficulty: 'D', requiredSkill: 'D', assignedWorkersCount: 5, assignedWorkerIds: [] },
      { id: '15', stt: 15, opCode: 'OP150', opName: 'May ráp lót thân vào vỏ ngoài', machineType: '1N', sam: 2.80, smv: 2.58, ratio: 8.62, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 4, assignedWorkerIds: [] },
      { id: '16', stt: 16, opCode: 'OP160', opName: 'May bo gấu tay áo', machineType: 'Kansai', sam: 1.55, smv: 1.42, ratio: 4.77, difficulty: 'B', requiredSkill: 'C', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '17', stt: 17, opCode: 'OP170', opName: 'May bo gấu áo thắt chun', machineType: 'Kansai', sam: 1.75, smv: 1.60, ratio: 5.38, difficulty: 'B', requiredSkill: 'C', assignedWorkersCount: 3, assignedWorkerIds: [] },
      { id: '18', stt: 18, opCode: 'OP180', opName: 'Kiểm hóa đầu chuyền', machineType: 'Kiểm bàn', sam: 1.10, smv: 1.00, ratio: 3.38, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '19', stt: 19, opCode: 'OP190', opName: 'Vệ sinh cắt chỉ', machineType: 'Thủ công', sam: 0.90, smv: 0.82, ratio: 2.77, difficulty: 'A', requiredSkill: 'A', assignedWorkersCount: 1, assignedWorkerIds: [] }
    ]
  },
  {
    code: 'SHIRT-OC-2302',
    name: 'Áo sơ mi Oxford nam tính (Oxford Slim-Fit Shirt)',
    productType: 'Oxford Shirt',
    mainFabric: 'Fine Cotton Oxford',
    targetOutput: 1500,
    workingTime: 600,
    historicSam: 14.80,
    historicSmv: 13.50,
    historicEfficiency: 78.0,
    historicOutput: 1475,
    routing: [
      { id: '1', stt: 1, opCode: 'OP010', opName: 'May măng sét tay áo', machineType: '1N', sam: 1.20, smv: 1.10, ratio: 7.89, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '2', stt: 2, opCode: 'OP020', opName: 'May ráp thép tay áo', machineType: '1N', sam: 1.30, smv: 1.18, ratio: 8.55, difficulty: 'C', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '3', stt: 3, opCode: 'OP030', opName: 'May nẹp cúc bên trái', machineType: '1N', sam: 1.10, smv: 1.00, ratio: 7.24, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '4', stt: 4, opCode: 'OP040', opName: 'May nẹp khuy bên phải', machineType: '1N', sam: 1.40, smv: 1.28, ratio: 9.21, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '5', stt: 5, opCode: 'OP050', opName: 'May cầu vai chập thân sau', machineType: '2N', sam: 1.50, smv: 1.38, ratio: 9.87, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '6', stt: 6, opCode: 'OP060', opName: 'May túi ngực trái', machineType: '1N', sam: 1.15, smv: 1.05, ratio: 7.57, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '7', stt: 7, opCode: 'OP070', opName: 'Chắp vai cổ dẹt và chân cổ', machineType: '1N', sam: 2.20, smv: 2.02, ratio: 14.47, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 3, assignedWorkerIds: [] },
      { id: '8', stt: 8, opCode: 'OP080', opName: 'Lắp cổ vào thân áo', machineType: '1N', sam: 2.00, smv: 1.83, ratio: 13.16, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 3, assignedWorkerIds: [] },
      { id: '9', stt: 9, opCode: 'OP090', opName: 'Ráp vắt nách cuộn sườn', machineType: 'Cuốn sườn', sam: 1.85, smv: 1.70, ratio: 12.17, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 3, assignedWorkerIds: [] },
      { id: '10', stt: 10, opCode: 'OP100', opName: 'Thùa khuy đính cúc', machineType: 'Máy đính cúc', sam: 1.00, smv: 0.90, ratio: 6.58, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '11', stt: 11, opCode: 'OP110', opName: 'May viền gấu tôm', machineType: '1N', sam: 1.50, smv: 1.38, ratio: 9.87, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] }
    ]
  },
  {
    code: 'PANTS-CH-2104',
    name: 'Quần tây Chino dáng đứng (Chino Classic Canvas)',
    productType: 'Chino Pants',
    mainFabric: 'Cotton Canvas Elastic',
    targetOutput: 1000,
    workingTime: 600,
    historicSam: 23.50,
    historicSmv: 21.60,
    historicEfficiency: 73.5,
    historicOutput: 980,
    routing: [
      { id: '1', stt: 1, opCode: 'OP010', opName: 'May lót túi xiết bên hông', machineType: '1N', sam: 1.90, smv: 1.75, ratio: 8.33, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '2', stt: 2, opCode: 'OP020', opName: 'May viền cơi túi sau', machineType: '2N', sam: 2.40, smv: 2.22, ratio: 10.53, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '3', stt: 3, opCode: 'OP030', opName: 'Ráp khóa đồng trước bụng', machineType: '1N', sam: 2.10, smv: 1.95, ratio: 9.21, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '4', stt: 4, opCode: 'OP040', opName: 'May giáp dọc sườn quần', machineType: '1N', sam: 1.80, smv: 1.65, ratio: 7.89, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '5', stt: 5, opCode: 'OP050', opName: 'May vắt sổ giàng dọc trong', machineType: 'Vắt sổ', sam: 1.60, smv: 1.48, ratio: 7.02, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '6', stt: 6, opCode: 'OP060', opName: 'May chắp mông hai kim', machineType: '2N', sam: 1.70, smv: 1.55, ratio: 7.46, difficulty: 'C', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '7', stt: 7, opCode: 'OP070', opName: 'Đính đai đỉa quanh cạp', machineType: 'Máy bọ đỉa', sam: 1.50, smv: 1.38, ratio: 6.58, difficulty: 'B', requiredSkill: 'C', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '8', stt: 8, opCode: 'OP080', opName: 'Tra cạp luồn nhãn mác', machineType: 'Máy tra cạp', sam: 3.20, smv: 2.95, ratio: 14.04, difficulty: 'D', requiredSkill: 'C', assignedWorkersCount: 3, assignedWorkerIds: [] },
      { id: '9', stt: 9, opCode: 'OP090', opName: 'May cuốn gấu gập quần', machineType: 'Vắt gấu', sam: 1.60, smv: 1.48, ratio: 7.02, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '10', stt: 10, opCode: 'OP100', opName: 'Là ủi dập nếp quần', machineType: 'Bàn là ép', sam: 3.00, smv: 2.75, ratio: 13.16, difficulty: 'C', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '11', stt: 11, opCode: 'OP110', opName: 'Kiểm hóa hoàn thiện đóng gói', machineType: 'Thủ công', sam: 2.00, smv: 1.84, ratio: 8.77, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] }
    ]
  },
  {
    code: 'POLO-PL-2209',
    name: 'Áo thun Polo Piqué đẳng cấp (Luxury Slim Polo)',
    productType: 'Polo Shirt',
    mainFabric: 'Premium Cotton Piqué',
    targetOutput: 1800,
    workingTime: 600,
    historicSam: 11.80,
    historicSmv: 10.70,
    historicEfficiency: 79.5,
    historicOutput: 1780,
    routing: [
      { id: '1', stt: 1, opCode: 'OP010', opName: 'Vắt xẻ tà lai áo thun', machineType: 'Vắt sổ', sam: 0.95, smv: 0.86, ratio: 8.05, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '2', stt: 2, opCode: 'OP020', opName: 'May nẹp khuy chữ V', machineType: '1N', sam: 1.85, smv: 1.68, ratio: 15.68, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '3', stt: 3, opCode: 'OP030', opName: 'Chắp ráp vai đôi có chun chống bai', machineType: '1N', sam: 0.85, smv: 0.77, ratio: 7.20, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '4', stt: 4, opCode: 'OP040', opName: 'Tra lá cổ dệt gá nẹp', machineType: '1N', sam: 2.10, smv: 1.90, ratio: 17.80, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '5', stt: 5, opCode: 'OP050', opName: 'Ráp tay thun vào vai áo', machineType: 'Vắt sổ 4K', sam: 1.25, smv: 1.13, ratio: 10.59, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '6', stt: 6, opCode: 'OP060', opName: 'Vắt chắp ráp sườn áo', machineType: 'Vắt sổ 4K', sam: 1.40, smv: 1.26, ratio: 11.86, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '7', stt: 7, opCode: 'OP070', opName: 'Đính khuy dệt bọ lai', machineType: 'Đính khuy', sam: 0.90, smv: 0.81, ratio: 7.63, difficulty: 'B', requiredSkill: 'B', assignedWorkersCount: 1, assignedWorkerIds: [] },
      { id: '8', stt: 8, opCode: 'OP080', opName: 'May trần nổi gấu tay bo và gấu thân', machineType: 'Kansai', sam: 1.50, smv: 1.36, ratio: 12.71, difficulty: 'C', requiredSkill: 'C', assignedWorkersCount: 2, assignedWorkerIds: [] },
      { id: '9', stt: 9, opCode: 'OP090', opName: 'Kiểm hóa vệ sinh đóng thùng', machineType: 'Thủ công', sam: 1.00, smv: 0.90, ratio: 8.47, difficulty: 'A', requiredSkill: 'A', assignedWorkersCount: 1, assignedWorkerIds: [] }
    ]
  }
];

// Seed initial assignment to avoid having empty assignedWorkerIds
export const initializeAssignments = (styles: Style[], workers: Worker[]): { styles: Style[], workers: Worker[] } => {
  // Deep clone to avoid mutating standard seeds
  const clonedStyles = JSON.parse(JSON.stringify(styles)) as Style[];
  const clonedWorkers = JSON.parse(JSON.stringify(workers)) as Worker[];

  clonedStyles.forEach(style => {
    // Reset worker references
    style.routing.forEach(step => {
      step.assignedWorkerIds = [];
    });

    // Distribute workers of appropriate roles and skill level.
    // Helper roles are index 0-14.
    // Let's filter helpers and operators
    const availableHelpers = clonedWorkers.filter(w => w.role === 'Helper');
    const availableOperators = clonedWorkers.filter(w => w.role === 'Operator');

    style.routing.forEach((step, index) => {
      // Find operators with skill matching or higher than step's requiredSkill
      // D can do D, C, B, A
      // C can do C, B, A
      // B can do B, A
      // A can do A
      const skillWeights = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
      const reqWeight = skillWeights[step.requiredSkill] || 1;

      // Assign actual workers up to assignedWorkersCount
      let assignedCount = 0;
      
      // If index is even and we need multiple people, try to assign 1 helper if available
      const needsHelper = step.sam >= 1.5 && availableHelpers.length > 0;
      if (needsHelper) {
        const helper = availableHelpers.find(h => !h.assignedOpId);
        if (helper) {
          helper.assignedOpId = step.opCode;
          step.assignedWorkerIds.push(helper.id);
          assignedCount++;
        }
      }

      // Assign operators
      while (assignedCount < step.assignedWorkersCount) {
        const op = availableOperators.find(o => {
          if (o.assignedOpId) return false;
          const opWeight = skillWeights[o.skillLevel] || 1;
          return opWeight >= reqWeight;
        });

        if (op) {
          op.assignedOpId = step.opCode;
          step.assignedWorkerIds.push(op.id);
          assignedCount++;
        } else {
          // If no matching operator found, take any unassigned operator
          const fallbackOp = availableOperators.find(o => !o.assignedOpId);
          if (fallbackOp) {
            fallbackOp.assignedOpId = step.opCode;
            step.assignedWorkerIds.push(fallbackOp.id);
            assignedCount++;
          } else {
            break; // No more operators left
          }
        }
      }
    });
  });

  return { styles: clonedStyles, workers: clonedWorkers };
};

export const defaultMockOrders: OrderCapacity[] = [
  { orderId: 'ORD-001', customerName: 'Decathlon Global', styleCode: 'DOWN-JK-2201', qty: 15000, deliveryDate: '15/06/2026', targetDate: '10/06/2026', lineCount: 3, allocEfficiency: 75 },
  { orderId: 'ORD-002', customerName: 'Nike Golf Apparel', styleCode: 'POLO-PL-2209', qty: 25000, deliveryDate: '25/06/2026', targetDate: '20/06/2026', lineCount: 2, allocEfficiency: 80 },
  { orderId: 'ORD-003', customerName: 'Uniqlo Vietnam', styleCode: 'SHIRT-OC-2302', qty: 18000, deliveryDate: '01/07/2026', targetDate: '26/06/2026', lineCount: 2, allocEfficiency: 78 },
  { orderId: 'ORD-004', customerName: 'Zara Kids Division', styleCode: 'PANTS-CH-2104', qty: 12000, deliveryDate: '10/07/2026', targetDate: '05/07/2026', lineCount: 1, allocEfficiency: 72 }
];
