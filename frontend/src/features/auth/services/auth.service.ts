import { request } from '../../../services/httpClient';

import type {
  ApiResponse,
} from '../../../shared/types/api.types';

import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RefreshTokenResponse,
} from '../types/auth.type';

export const authService = {
  async login(
    payload: LoginPayload
  ): Promise<AuthSession> {
    const response =
      await request<ApiResponse<AuthSession>>(
        '/api/auth/login',
        {
          method: 'POST',
          body: payload,
          skipAuth: true,
          skipRefresh: true,
        }
      );

    return response.data;
  },

  async refresh(): Promise<RefreshTokenResponse> {
    const response =
      await request<ApiResponse<RefreshTokenResponse>>(
        '/api/auth/refresh',
        {
          method: 'POST',
          skipAuth: true,
          skipRefresh: true,
        }
      );

    return response.data;
  },

  async logout(): Promise<void> {
    await request<ApiResponse<null>>(
      '/api/auth/logout',
      {
        method: 'POST',
        skipAuth: true,
        skipRefresh: true,
      }
    );
  },

  async me(): Promise<AuthUser> {
    const response =
      await request<ApiResponse<AuthUser>>(
        '/api/auth/me'
      );

    return response.data;
  },
};