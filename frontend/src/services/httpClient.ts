import { API_BASE_URL } from '../config/api.config';

import {
  clearAuthSession,
  getAccessToken,
  updateAccessToken,
} from '../features/auth/storage/auth.storage';
// Chỉnh lại đường dẫn import nếu thư mục auth của bạn nằm ở vị trí khác.

type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;

  /**
   * Không gắn access token vào Authorization.
   * Dùng cho login, refresh, logout.
   */
  skipAuth?: boolean;

  /**
   * Không tự gọi refresh khi API trả 401.
   * Dùng cho login và refresh để tránh lặp vô hạn.
   */
  skipRefresh?: boolean;
}

type UnknownRecord = Record<string, unknown>;

const REFRESH_URL = '/api/auth/refresh';

export const AUTH_SESSION_EXPIRED_EVENT =
  'auth:session-expired';

/**
 * Dùng chung một Promise để tránh nhiều API cùng gọi refresh
 * khi access token hết hạn.
 */
let refreshPromise: Promise<string> | null = null;

function isRecord(value: unknown): value is UnknownRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

async function parseResponse(
  response: Response
): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function isFormDataBody(body: unknown): body is FormData {
  return (
    typeof FormData !== 'undefined' &&
    body instanceof FormData
  );
}

function getErrorMessage(
  data: unknown,
  fallback: string
): string {
  if (!isRecord(data)) {
    return fallback;
  }

  if (typeof data.error === 'string') {
    return data.error;
  }

  if (typeof data.message === 'string') {
    return data.message;
  }

  return fallback;
}

function extractAccessToken(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  /*
   * Trường hợp backend trả:
   *
   * {
   *   data: {
   *     accessToken: "..."
   *   }
   * }
   */
  if (isRecord(data.data)) {
    const accessToken = data.data.accessToken;

    if (typeof accessToken === 'string') {
      return accessToken;
    }
  }

  /*
   * Hỗ trợ thêm trường hợp backend trả:
   *
   * {
   *   accessToken: "..."
   * }
   */
  if (typeof data.accessToken === 'string') {
    return data.accessToken;
  }

  return null;
}

function expireSession(): void {
  clearAuthSession();

  window.dispatchEvent(
    new Event(AUTH_SESSION_EXPIRED_EVENT)
  );
}

async function sendRequest(
  url: string,
  options: RequestOptions,
  accessToken: string | null
): Promise<Response> {
  const headers = new Headers(options.headers);

  const requestBody: BodyInit | undefined =
    options.body === undefined
      ? undefined
      : isFormDataBody(options.body)
        ? options.body
        : JSON.stringify(options.body);

  if (
    options.body !== undefined &&
    !isFormDataBody(options.body) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken && !options.skipAuth) {
    headers.set(
      'Authorization',
      `Bearer ${accessToken}`
    );
  }

  return fetch(`${API_BASE_URL}${url}`, {
    method: options.method ?? 'GET',
    headers,
    credentials: 'include',
    body: requestBody,
  });
}

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(
      `${API_BASE_URL}${REFRESH_URL}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          'Phiên đăng nhập đã hết hạn.'
        )
      );
    }

    const accessToken = extractAccessToken(data);

    if (!accessToken) {
      throw new Error(
        'Backend không trả về access token mới.'
      );
    }

    /*
     * Cập nhật token nhưng giữ nguyên:
     * user, roles, permissions, navigation.
     */
    updateAccessToken(accessToken);

    return accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  let response = await sendRequest(
    url,
    options,
    getAccessToken()
  );

  let data = await parseResponse(response);

  const isAuthEndpoint =
    url === '/api/auth/login' ||
    url === '/api/auth/refresh';

  const shouldRefresh =
    response.status === 401 &&
    !options.skipRefresh &&
    !isAuthEndpoint;

  if (shouldRefresh) {
    try {
      const newAccessToken =
        await refreshAccessToken();

      /*
       * Gọi lại request cũ với access token mới.
       */
      response = await sendRequest(
        url,
        options,
        newAccessToken
      );

      data = await parseResponse(response);

      /*
       * Refresh thành công nhưng request gọi lại
       * vẫn trả 401 thì kết thúc phiên đăng nhập.
       */
      if (response.status === 401) {
        expireSession();
      }
    } catch (error) {
      expireSession();

      throw error instanceof Error
        ? error
        : new Error(
            'Phiên đăng nhập đã hết hạn.'
          );
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        'Có lỗi xảy ra khi gọi API.'
      )
    );
  }

  return data as T;
}