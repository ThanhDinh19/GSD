import type { AuthSession } from '../types/auth.type';

const AUTH_STORAGE_KEY = 'auth_session';

export function saveAuthSession(session: AuthSession): void {
  sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(session)
  );
}

export function getAuthSession(): AuthSession | null {
  const value = sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function updateAccessToken(
  accessToken: string
): AuthSession | null {
  const currentSession = getAuthSession();

  if (!currentSession) {
    return null;
  }

  const nextSession: AuthSession = {
    ...currentSession,
    accessToken,
  };

  saveAuthSession(nextSession);

  return nextSession;
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return getAuthSession()?.accessToken ?? null;
}

