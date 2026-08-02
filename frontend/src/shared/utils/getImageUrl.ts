const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:9000').replace(/\/$/, '');

export function getImageUrl(fileName?: string | null, path?: string | null) {
    if (!fileName) return '';

    const cleanFileName = String(fileName).split('/').pop();

    return `${API_URL}/${path}/${cleanFileName}`;
}