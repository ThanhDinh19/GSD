import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ReactNode,
} from 'react';

import {
  AUTH_SESSION_EXPIRED_EVENT,
} from '../../../services/httpClient';

import {
  authService,
} from '../services/auth.service';

import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../storage/auth.storage';

import type {
  AuthSession,
  LoginPayload,
} from '../types/auth.type';

export type AuthContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    payload: LoginPayload
  ) => Promise<AuthSession>;

  logout: () => Promise<void>;

  hasPermission: (
    permissionCode: string
  ) => boolean;
};

export const AuthContext =
  createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [session, setSession] =
    useState<AuthSession | null>(
      () => getAuthSession()
    );

  const [isLoading, setIsLoading] =
    useState(true);

  /**
   * Kiểm tra và khôi phục phiên đăng nhập
   * khi ứng dụng khởi động.
   */
  useEffect(() => {
    let isMounted = true;

    async function restoreSession(): Promise<void> {
      const storedSession = getAuthSession();

      /*
       * Không có sessionStorage thì không có đủ:
       * roles, permissions, navigation...
       */
      if (!storedSession) {
        if (isMounted) {
          setSession(null);
          setIsLoading(false);
        }

        return;
      }

      try {
        /*
         * /me cần access token.
         *
         * Nếu token hết hạn:
         * httpClient sẽ tự gọi /refresh,
         * lưu token mới và gọi lại /me.
         */
        const user = await authService.me();

        /*
         * Lấy lại session vì httpClient có thể
         * vừa cập nhật access token trong storage.
         */
        const latestSession = getAuthSession();

        if (!latestSession) {
          throw new Error(
            'Không tìm thấy phiên đăng nhập.'
          );
        }

        /*
         * Đồng bộ lại thông tin user mới nhất
         * do endpoint /me trả về.
         */
        const restoredSession: AuthSession = {
          ...latestSession,
          user,
        };

        saveAuthSession(restoredSession);

        if (isMounted) {
          setSession(restoredSession);
        }
      } catch {
        clearAuthSession();

        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Khi httpClient refresh thất bại,
   * nó phát sự kiện auth:session-expired.
   *
   * Context phải nghe sự kiện để giao diện
   * chuyển về trạng thái chưa đăng nhập.
   */
  useEffect(() => {
    function handleSessionExpired(): void {
      clearAuthSession();
      setSession(null);
    }

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired
      );
    };
  }, []);

  const permissionCodes = useMemo(() => {
    return new Set(
      session?.permissions.map(
        (permission) => permission.code
      ) ?? []
    );
  }, [session]);

  const login = useCallback(
    async (
      payload: LoginPayload
    ): Promise<AuthSession> => {
      const authSession =
        await authService.login(payload);

      saveAuthSession(authSession);
      setSession(authSession);

      return authSession;
    },
    []
  );

  const logout = useCallback(
    async (): Promise<void> => {
      try {
        /*
         * Backend xóa refresh-token cookie
         * hoặc thu hồi refresh token.
         */
        await authService.logout();
      } finally {
        /*
         * Dù backend logout lỗi,
         * frontend vẫn phải xóa phiên cục bộ.
         */
        clearAuthSession();
        setSession(null);
      }
    },
    []
  );

  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      return permissionCodes.has(
        permissionCode
      );
    },
    [permissionCodes]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated:
        Boolean(session?.accessToken),
      isLoading,
      login,
      logout,
      hasPermission,
    }),
    [
      session,
      isLoading,
      login,
      logout,
      hasPermission,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}