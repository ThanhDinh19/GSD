import { useEffect, useState } from 'react';
import {
  SewingProcessLine,
  SewingProcessListItem,
  SewingProcessPayload,
  SewingProcessResult,
} from '../types';
import { sewingProcessService } from '../services/sewingProcess.service';

const today = new Date().toISOString().slice(0, 10);

const initialForm: SewingProcessPayload = {
  id: 0,
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

  const refresh = async () => {
    await loadSewingProcesses();
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

  const calculate = async () => {
    if (!validate()) return null;

    setCalculating(true);

    try {
      const payload = buildPayload();
      const data = await sewingProcessService.calculateSewingProcess(payload);

      setResult(data);

      setForm((prev) => ({
        ...data.header,
        lines: data.lines,
        images: prev.images || [],
      }));

      return data;
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
    result,

    loading,
    calculating,
    saving,

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
    updateSewingProcess,
  };
}