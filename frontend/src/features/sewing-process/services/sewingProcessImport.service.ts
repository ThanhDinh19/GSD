import type {
  SewingProcessHeader,
} from '../types/sewingProcess.types';

import type {
  SewingProcessImportPreview,
  SewingProcessImportPreviewResponse,
} from '../types/sewingProcessImport';

import {
  request,
} from '../../../services/httpClient';


async function preview(
  file: File,
  header: Partial<SewingProcessHeader>
): Promise<SewingProcessImportPreview> {
  const formData = new FormData();

  formData.append(
    'file',
    file
  );

  formData.append(
    'header',
    JSON.stringify(header)
  );

  const response =
    await request<SewingProcessImportPreviewResponse>(
      '/api/sewing-processes/import/preview',
      {
        method: 'POST',
        body: formData,
      }
    );

  return response.data;
}


export const sewingProcessImportService = {
  preview,
};  