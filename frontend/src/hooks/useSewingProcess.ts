import { use, useEffect, useState } from 'react';
import {
  SewingProcessLine,
  SewingProcessListItem,
  SewingProcessPayload,
  SewingProcessResult,
  FormTest,
  FormTestUser,
} from '../types';
import { sewingProcessService } from '../services/sewingProcess.service';

const today = new Date().toISOString().slice(0, 10);

const initialForm: SewingProcessPayload = {
  // id: 0,
  documentCode: '',

  customerId: null,
  customerCode: '',
  customerName: '',

  itemCode: '',
  productionLine: '',
  productionRound: 1,

  workingHours: 9,
  manpower: 0,
  productionManpower: 0,
  quantity: 0,

  effectiveDate: today,
  issuedDate: today,

  priceMode: 'GSD',
  statusId: 0,
  note: '',

  lines: [],
  images: [],
};

const initialLine: SewingProcessLine = {
  gsdAnalysisId: null,
  lineNo: 1,
  clusterNo: 1,
  clusterName: '',

  operationCode: '',
  operationName: '',

  lineOrder: 1,

  skillGradeId: null,
  skillGradeLevel: null,

  machineId: null,
  machineCode: '',
  machineName: '',

  samGsd: 0,
  salaryCoefficient: 0,

  requiredEfficiency: 100,
  totalActions: 0,

  toolNeed: '',

  sewingEmployee: '',
  cbcTime: 0,
  note: '',
};

export function useSewingProcess() {
  const [items, setItems] = useState<SewingProcessListItem[]>([]);
  const [form, setForm] = useState<SewingProcessPayload>({
    ...initialForm,
    lines: [{ ...initialLine }],
  });

  // dinh test 21/07/2026
  const [form_test, setFormTest] = useState<FormTest>({
    name: null,
    age: 0,
  });

  const [users, setUser] = useState<FormTestUser[]>([])

  const [result, setResult] = useState<SewingProcessResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSewingProcesses = async () => {
    setLoading(true);

    try {
      const data = await sewingProcessService.getSewingProcesses();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const loadFormTest = async () => {
    const data = await sewingProcessService.getUser();
    setUser(data);
  }

  const refresh = async () => {
    await loadSewingProcesses();
    await loadFormTest();
  };

  const updateForm = <K extends keyof SewingProcessPayload>(
    key: K,
    value: SewingProcessPayload[K]
  ) => {
    setResult(null);

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFormTest = <K extends keyof FormTest>(
    key: K,
    value: FormTest[K]
  ) => {
    setFormTest((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const updateLine = <K extends keyof SewingProcessLine>(
    index: number,
    key: K,
    value: SewingProcessLine[K]
  ) => {
    // setResult(null);

    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line, lineIndex) =>
        lineIndex === index
          ? {
            ...line,
            [key]: value,
          }
          : line
      ),
    }));
  };

  const addLine = () => {
    setResult(null);

    setForm((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          ...initialLine,
          lineNo: prev.lines.length + 1,
          lineOrder: prev.lines.length + 1,
        },
      ],
    }));
  };

  const createFormTest = async () => {
    await sewingProcessService.createFormTest(form_test);
  };

  const removeLine = (index: number) => {
    setResult(null);

    setForm((prev) => ({
      ...prev,
      lines: prev.lines
        .filter((_, lineIndex) => lineIndex !== index)
        .map((line, lineIndex) => ({
          ...line,
          lineNo: lineIndex + 1,
          lineOrder: lineIndex + 1,
        })),
    }));
  };

  const buildPayload = (): SewingProcessPayload => ({
    ...form,
    images: form.images || [],
    lines: form.lines.map((line, index) => ({
      ...line,
      lineNo: index + 1,
      lineOrder: index + 1,
    })),
  });

  const validate = () => {
    if (!form.documentCode.trim()) {
      alert('Vui lòng nhập mã chứng từ.');
      return false;
    }

    if (!form.productionManpower || Number(form.productionManpower) <= 0) {
      alert('Nhân sự sản xuất phải lớn hơn 0.');
      return false;
    }

    if (!form.workingHours || Number(form.workingHours) <= 0) {
      alert('Thời gian làm việc phải lớn hơn 0.');
      return false;
    }

    if (!form.lines.length) {
      alert('Vui lòng nhập ít nhất 1 dòng công đoạn.');
      return false;
    }

    const emptyLine = form.lines.find(
      (line) => !String(line.operationName || '').trim()
    );

    if (emptyLine) {
      alert(`Dòng ${emptyLine.lineNo} chưa có tên công đoạn.`);
      return false;
    }

    return true;
  };

  function findOriginalLine(
    calculatedLine: SewingProcessLine,
    previousLines: SewingProcessLine[],
    index: number
  ) {
    // Ưu tiên theo gsdAnalysisId
    if (
      calculatedLine.gsdAnalysisId !== null &&
      calculatedLine.gsdAnalysisId !== undefined
    ) {
      const foundByGsdId = previousLines.find(
        (line) =>
          Number(line.gsdAnalysisId) ===
          Number(calculatedLine.gsdAnalysisId)
      );

      if (foundByGsdId) {
        return foundByGsdId;
      }
    }

    // Tiếp theo theo sourceLineId
    if (
      calculatedLine.sourceLineId !== null &&
      calculatedLine.sourceLineId !== undefined
    ) {
      const foundBySourceLine = previousLines.find(
        (line) =>
          Number(line.sourceLineId) ===
          Number(calculatedLine.sourceLineId)
      );

      if (foundBySourceLine) {
        return foundBySourceLine;
      }
    }

    // Tiếp theo theo operationCode
    if (calculatedLine.operationCode) {
      const foundByOperationCode =
        previousLines.find(
          (line) =>
            String(line.operationCode || '') ===
            String(
              calculatedLine.operationCode
            )
        );

      if (foundByOperationCode) {
        return foundByOperationCode;
      }
    }

    // Cuối cùng mới lấy theo vị trí
    return previousLines[index];
  }

  // const calculate = async () => {
  //   if (!validate()) return null;

  //   setCalculating(true);

  //   try {
  //     const payload = buildPayload();
  //     const data = await sewingProcessService.calculateSewingProcess(payload);

  //     setResult(data);

  //     setForm((prev) => ({
  //       ...data.header,
  //       lines: data.lines,
  //       images: prev.images || [],
  //     }));

  //     return data;
  //   } finally {
  //     setCalculating(false);
  //   }
  // };


  const calculate = async () => {
    if (!validate()) return null;

    setCalculating(true);

    try {
      const payload = buildPayload();

      // Giữ lại lines trước khi gọi API
      const previousLines = payload.lines;

      console.log(
        'LINES TRƯỚC KHI TÍNH:',
        previousLines
      );

      const data =
        await sewingProcessService
          .calculateSewingProcess(payload);

      console.log(
        'LINES BACKEND TRẢ VỀ:',
        data.lines
      );

      const mergedLines =
        data.lines.map(
          (calculatedLine, index) => {
            const oldLine =
              findOriginalLine(
                calculatedLine,
                previousLines,
                index
              );

            return {
              ...calculatedLine,

              imageFileName:
                calculatedLine.imageFileName ??
                oldLine?.imageFileName ??
                null,

              imageUrl:
                calculatedLine.imageUrl ??
                oldLine?.imageUrl ??
                null,
            };
          }
        );

      const mergedResult = {
        ...data,
        lines: mergedLines,
      };

      setResult(mergedResult);

      setForm((prev) => ({
        ...data.header,
        lines: mergedLines,

        // Giữ ảnh đại diện chung
        images: prev.images || [],
      }));

      return mergedResult;
    } finally {
      setCalculating(false);
    }
  };


  const createSewingProcess = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      const payload = result
        ? {
          ...result.header,
          lines: result.lines,
          images: form.images || [],
        }
        : buildPayload();

      const response = await sewingProcessService.createSewingProcess(payload);

      await loadSewingProcesses();

      return response;
    } finally {
      setSaving(false);
    }
  };

  const updateSewingProcess = async (id: number) => {
    if (!validate()) return;

    setSaving(true);

    try {
      const payload = result
        ? {
          ...result.header,
          lines: result.lines,
          images: form.images || [],
        }
        : buildPayload();

      const response = await sewingProcessService.updateSewingProcess(
        id,
        payload
      );

      await loadSewingProcesses();

      return response;
    } finally {
      setSaving(false);
    }
  };

  const loadDetailToForm = async (id: number) => {
    setLoading(true);

    try {
      const data = await sewingProcessService.getSewingProcessById(id);

      setForm({
        ...data.header,
        lines: data.lines,
        images: data.images || [],
      });

      setResult(data);

      return data;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setForm({
      ...initialForm,
      lines: [{ ...initialLine }],
    });
  };


  useEffect(() => {
    refresh();
  }, []);

  return {
    items,
    form,
    form_test,
    result,

    loading,
    calculating,
    saving,
    users,

    refresh,
    loadSewingProcesses,
    loadDetailToForm,

    setForm,
    updateForm,
    updateLine,
    addLine,
    removeLine,
    resetForm,

    calculate,
    createSewingProcess,
    createFormTest,
    updateFormTest,
    updateSewingProcess,
    loadFormTest,
  };
}