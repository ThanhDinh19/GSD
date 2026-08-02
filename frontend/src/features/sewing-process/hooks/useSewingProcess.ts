import {
  useEffect,
  useState,
} from 'react';

import type {
  SewingProcessLine,
  SewingProcessListItem,
  SewingProcessPayload,
  SewingProcessResult,
} from '../types/sewingProcess.types';

import {
  createInitialSewingProcessLine,
  createInitialSewingProcessPayload,
} from '../model/sewingProcess.defaults';

import {
  buildSewingProcessPayload,
  mergeCalculatedLines,
} from '../model/sewingProcess.helpers';

import {
  validateSewingProcess,
} from '../model/sewingProcess.validation';

import {
  sewingProcessService,
} from '../services/sewingProcess.service';

export function useSewingProcess() {
  const [items, setItems] =
    useState<SewingProcessListItem[]>(
      []
    );

  const [form, setForm] =
    useState<SewingProcessPayload>(
      createInitialSewingProcessPayload
    );

  const [result, setResult] =
    useState<SewingProcessResult | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [
    calculating,
    setCalculating,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const loadSewingProcesses =
    async () => {
      setLoading(true);

      try {
        const data =
          await sewingProcessService
            .getSewingProcesses();

        setItems(data);
      } finally {
        setLoading(false);
      }
    };

  const refresh = async () => {
    await loadSewingProcesses();
  };

  const updateForm =
    <
      K extends keyof SewingProcessPayload
    >(
      key: K,
      value: SewingProcessPayload[K]
    ) => {
      setResult(null);

      setForm((previous) => ({
        ...previous,
        [key]: value,
      }));
    };

  const updateLine =
    <
      K extends keyof SewingProcessLine
    >(
      index: number,
      key: K,
      value: SewingProcessLine[K]
    ) => {
      setForm((previous) => ({
        ...previous,

        lines:
          previous.lines.map(
            (line, lineIndex) =>
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

    setForm((previous) => ({
      ...previous,

      lines: [
        ...previous.lines,

        {
          ...createInitialSewingProcessLine(),

          lineNo:
            previous.lines.length + 1,

          lineOrder:
            previous.lines.length + 1,
        },
      ],
    }));
  };

  const removeLine = (
    index: number
  ) => {
    setResult(null);

    setForm((previous) => ({
      ...previous,

      lines:
        previous.lines
          .filter(
            (_, lineIndex) =>
              lineIndex !== index
          )
          .map(
            (line, lineIndex) => ({
              ...line,

              lineNo:
                lineIndex + 1,

              lineOrder:
                lineIndex + 1,
            })
          ),
    }));
  };

  const validate = (): boolean => {
    const error =
      validateSewingProcess(form);

    if (error) {
      alert(error);
      return false;
    }

    return true;
  };

  const calculate = async () => {
    if (!validate()) {
      return null;
    }

    setCalculating(true);

    try {
      const payload =
        buildSewingProcessPayload(
          form
        );

      const previousLines =
        payload.lines;

      const data =
        await sewingProcessService
          .calculateSewingProcess(
            payload
          );

      const mergedLines =
        mergeCalculatedLines(
          data.lines,
          previousLines
        );

      const mergedResult:
        SewingProcessResult = {
        ...data,
        lines: mergedLines,
      };

      setResult(mergedResult);

      setForm((previous) => ({
        ...data.header,

        lines: mergedLines,

        images:
          previous.images || [],
      }));

      return mergedResult;
    } finally {
      setCalculating(false);
    }
  };

  const createSewingProcess =
    async () => {
      if (!validate()) {
        return undefined;
      }

      setSaving(true);

      try {
        const payload =
          result
            ? {
              ...result.header,

              lines:
                result.lines,

              images:
                form.images || [],
            }
            : buildSewingProcessPayload(
              form
            );

        const response =
          await sewingProcessService
            .createSewingProcess(
              payload
            );

        await loadSewingProcesses();

        return response;
      } finally {
        setSaving(false);
      }
    };

  const updateSewingProcess =
    async (id: number) => {
      if (!validate()) {
        return undefined;
      }

      setSaving(true);

      try {
        const payload =
          result
            ? {
              ...result.header,

              lines:
                result.lines,

              images:
                form.images || [],
            }
            : buildSewingProcessPayload(
              form
            );

        const response =
          await sewingProcessService
            .updateSewingProcess(
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

          lines:
            data.lines || [],

          images:
            data.images || [],
        });

        setResult(data);

        return data;
      } finally {
        setLoading(false);
      }
    };

  const resetForm = () => {
    setResult(null);

    setForm(
      createInitialSewingProcessPayload()
    );
  };

  useEffect(() => {
    void loadSewingProcesses();
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