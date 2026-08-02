const API_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:9000'
).replace(/\/$/, '');

function getCleanFileName(
  fileName?: string | null
): string {
  if (!fileName) {
    return '';
  }

  return (
    String(fileName)
      .split('/')
      .pop() || ''
  );
}

export function getSewingProcessImageUrl(
  fileName?: string | null
): string {
  const cleanFileName =
    getCleanFileName(fileName);

  if (!cleanFileName) {
    return '';
  }

  return `${API_URL}/sewing_process_images/${cleanFileName}`;
}

export function getGsdAnalysisImageUrl(
  fileName?: string | null
): string {
  const cleanFileName =
    getCleanFileName(fileName);

  if (!cleanFileName) {
    return '';
  }

  return `${API_URL}/gsd_analysis_images/${cleanFileName}`;
}

export function getApiUrl(): string {
  return API_URL;
}