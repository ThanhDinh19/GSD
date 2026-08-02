import { useState } from 'react';
import type { FormEvent } from 'react';

import { Navigate, useNavigate } from 'react-router-dom';

import { Button } from '../../../shared/components';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();

  const {
    session,
    login,
    isAuthenticated,
  } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    const firstRoute = session?.navigation[0]?.routePath || '/';

    return <Navigate to={firstRoute} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login({
        username: username.trim(),
        password,
      });

      const firstRoute = data.navigation[0]?.routePath || '/';

      navigate(firstRoute, {
        replace: true,
      });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Đăng nhập thất bại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-[420px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
        <div className="bg-slate-900 px-6 py-7 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 text-lg font-bold">
            GSD
          </div>

          <h1 className="mt-4 text-xl font-bold uppercase">
            Đăng nhập hệ thống
          </h1>

          <p className="mt-1 text-sm text-slate-300">
            Nhập tài khoản để tiếp tục
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Tên đăng nhập
            </label>

            <input
              id="username"
              type="text"
              value={username}
              autoComplete="username"
              autoFocus
              disabled={loading}
              placeholder="Nhập tên đăng nhập"
              onChange={(event) => {
                setUsername(event.target.value);
                setError('');
              }}
              className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Mật khẩu
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoComplete="current-password"
                disabled={loading}
                placeholder="Nhập mật khẩu"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                className="w-full rounded-sm border border-slate-300 px-3 py-2.5 pr-16 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <button
                type="button"
                disabled={loading}
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            loadingText="Đang đăng nhập..."
            className="w-full justify-center"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center text-xs text-slate-500">
          Hệ thống quản lý GSD
        </div>
      </div>
    </div>
  );
}