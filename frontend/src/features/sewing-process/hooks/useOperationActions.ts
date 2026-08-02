import {
  useState,
} from 'react';

import type {
  SewingProcessActionDetail,
  SewingProcessLine,
} from '../types/sewingProcess.types';

import {
  sewingProcessService,
} from '../services/sewingProcess.service';

interface OperationActionsModalState {
  title: string;
  loading: boolean;
  rows: SewingProcessActionDetail[];
}

export function useOperationActions() {
  const [
    modal,
    setModal,
  ] = useState<
    OperationActionsModalState | null
  >(null);

  const open = async (
    line: SewingProcessLine
  ) => {
    const operationLineId =
      line.sourceLineId ?? null;

    const gsdAnalysisId =
      line.gsdAnalysisId ?? null;

    if (
      !operationLineId &&
      !gsdAnalysisId
    ) {
      alert(
        'Công đoạn này chưa có mã dòng kho cụm hoặc mã GSD để xem thao tác.'
      );

      return;
    }

    setModal({
      title:
        line.operationName ||
        'Chi tiết thao tác',

      loading: true,

      rows: [],
    });

    try {
      let rows:
        SewingProcessActionDetail[] =
          [];

      if (operationLineId) {
        try {
          rows =
            await sewingProcessService
              .getActionDetailsByOperationClusterLineId(
                Number(
                  operationLineId
                )
              );
        } catch (error) {
          if (!gsdAnalysisId) {
            throw error;
          }
        }
      }

      if (
        rows.length === 0 &&
        gsdAnalysisId
      ) {
        rows =
          await sewingProcessService
            .getGsdActionDetailsById(
              Number(gsdAnalysisId)
            );
      }

      setModal({
        title:
          line.operationName ||
          'Chi tiết thao tác',

        loading: false,

        rows,
      });
    } catch (error) {
      setModal(null);

      alert(
        error instanceof Error
          ? error.message
          : 'Lấy danh sách thao tác thất bại.'
      );
    }
  };

  const close = () => {
    setModal(null);
  };

  return {
    modal,
    open,
    close,
  };
}