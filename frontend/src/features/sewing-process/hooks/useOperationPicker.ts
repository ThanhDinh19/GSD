import {
  useState,
} from 'react';

import type {
  SewingProcessLine,
} from '../types/sewingProcess.types';

import type {
  OperationClusterDetailDto,
} from '../types/sewingProcess.dto';

import {
  mapOperationClusterToLines,
} from '../model/sewingProcess.mapper';

function getLineKey(
  row: SewingProcessLine
): string {
  return [
    row.sourceDocumentCode ?? '',
    row.sourceLineId ?? '',
    row.gsdAnalysisId ?? '',
    row.operationCode ?? '',
    row.operationName ?? '',
    row.lineOrder ?? row.lineNo,
  ].join('|');
}

type UseOperationPickerOptions = {
  loadDetail:
    (
      id: number
    ) => Promise<OperationClusterDetailDto>;

  onConfirm:
    (
      lines: SewingProcessLine[]
    ) => void;
};

export function useOperationPicker({
  loadDetail,
  onConfirm,
}: UseOperationPickerOptions) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [
    productCategoryGroupId,
    setProductCategoryGroupId,
  ] = useState<number | ''>('');

  const [
    operationClusterId,
    setOperationClusterId,
  ] = useState<number | ''>('');

  const [rows, setRows] =
    useState<SewingProcessLine[]>([]);

  const [
    selectedMap,
    setSelectedMap,
  ] = useState<
    Record<
      string,
      SewingProcessLine
    >
  >({});

  const open = () => {
    setProductCategoryGroupId('');
    setOperationClusterId('');
    setRows([]);
    setSelectedMap({});
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const changeProductCategoryGroup = (
    value: number | ''
  ) => {
    setProductCategoryGroupId(value);

    setOperationClusterId('');

    setRows([]);
    setSelectedMap({});
  };

  const changeCluster =
    async (value: string) => {
      const id =
        value
          ? Number(value)
          : '';

      setOperationClusterId(id);

      setRows([]);
      setSelectedMap({});

      if (!id) {
        return;
      }

      try {
        const detail =
          await loadDetail(
            Number(id)
          );

        const mappedRows =
          mapOperationClusterToLines(
            detail
          );

        setRows(mappedRows);
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : 'Load công đoạn từ kho cụm thất bại.'
        );
      }
    };

  const toggleRow = (
    row: SewingProcessLine,
    checked: boolean
  ) => {
    const key =
      getLineKey(row);

    setSelectedMap(
      (previous) => {
        const next = {
          ...previous,
        };

        if (checked) {
          next[key] = row;
        } else {
          delete next[key];
        }

        return next;
      }
    );
  };

  const toggleAll = (
    checked: boolean
  ) => {
    setSelectedMap(
      (previous) => {
        const next = {
          ...previous,
        };

        rows.forEach((row) => {
          const key =
            getLineKey(row);

          if (checked) {
            next[key] = row;
          } else {
            delete next[key];
          }
        });

        return next;
      }
    );
  };

  const confirm = () => {
    const selectedRows =
      Object.values(selectedMap);

    if (
      selectedRows.length === 0
    ) {
      alert(
        'Vui lòng chọn ít nhất một công đoạn.'
      );

      return;
    }

    onConfirm(selectedRows);

    close();
  };

  return {
    state: {
      isOpen,

      productCategoryGroupId,
      operationClusterId,

      rows,
      selectedMap,

      selectedCount:
        Object.keys(
          selectedMap
        ).length,
    },

    actions: {
      open,
      close,

      changeProductCategoryGroup,
      changeCluster,

      toggleRow,
      toggleAll,

      confirm,
    },
  };
}