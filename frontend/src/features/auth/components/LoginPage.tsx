// import { useState } from 'react';
// import type { FormEvent } from 'react';

// import { Navigate, useNavigate } from 'react-router-dom';

// import { Button } from '../../../shared/components';
// import { useAuth } from '../hooks/useAuth';

// export function LoginPage() {
//   const navigate = useNavigate();

//   const {
//     session,
//     login,
//     isAuthenticated,
//   } = useAuth();

//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   if (isAuthenticated) {
//     const firstRoute = session?.navigation[0]?.routePath || '/';

//     return <Navigate to={firstRoute} replace />;
//   }

//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (!username.trim()) {
//       setError('Vui lòng nhập tên đăng nhập.');
//       return;
//     }

//     if (!password) {
//       setError('Vui lòng nhập mật khẩu.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const data = await login({
//         username: username.trim(),
//         password,
//       });

//       const firstRoute = data.navigation[0]?.routePath || '/';

//       navigate(firstRoute, {
//         replace: true,
//       });
//     } catch (loginError) {
//       setError(
//         loginError instanceof Error
//           ? loginError.message
//           : 'Đăng nhập thất bại.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
//       <div className="w-full max-w-[420px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
//         <div className="bg-slate-900 px-6 py-7 text-center text-white">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-blue-600 text-lg font-bold">
//             GSD
//           </div>

//           <h1 className="mt-4 text-xl font-bold uppercase">
//             Đăng nhập hệ thống
//           </h1>

//           <p className="mt-1 text-sm text-slate-300">
//             Nhập tài khoản để tiếp tục
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4 p-6">
//           <div>
//             <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-slate-700">
//               Tên đăng nhập
//             </label>

//             <input
//               id="username"
//               type="text"
//               value={username}
//               autoComplete="username"
//               autoFocus
//               disabled={loading}
//               placeholder="Nhập tên đăng nhập"
//               onChange={(event) => {
//                 setUsername(event.target.value);
//                 setError('');
//               }}
//               className="w-full rounded-sm border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
//               Mật khẩu
//             </label>

//             <div className="relative">
//               <input
//                 id="password"
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 autoComplete="current-password"
//                 disabled={loading}
//                 placeholder="Nhập mật khẩu"
//                 onChange={(event) => {
//                   setPassword(event.target.value);
//                   setError('');
//                 }}
//                 className="w-full rounded-sm border border-slate-300 px-3 py-2.5 pr-16 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
//               />

//               <button
//                 type="button"
//                 disabled={loading}
//                 onClick={() => setShowPassword((previous) => !previous)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
//               >
//                 {showPassword ? 'Ẩn' : 'Hiện'}
//               </button>
//             </div>
//           </div>

//           {error && (
//             <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
//               {error}
//             </div>
//           )}

//           <Button
//             type="submit"
//             variant="primary"
//             loading={loading}
//             loadingText="Đang đăng nhập..."
//             className="w-full justify-center"
//           >
//             Đăng nhập
//           </Button>
//         </form>

//         <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-center text-xs text-slate-500">
//           Hệ thống quản lý GSD
//         </div>
//       </div>
//     </div>
//   );
// }


import {
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import {
  Navigate,
  useNavigate,
} from 'react-router-dom';

import {
  Button,
} from '../../../shared/components';

import {
  useAuth,
} from '../hooks/useAuth';

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M4 6.5h16v11H4z"
        strokeLinejoin="round"
      />

      <path
        d="m5 7 7 6 7-6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({
  hidden,
}: {
  hidden: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="12"
        r="2.5"
      />

      {hidden && (
        <path
          d="m4 4 16 16"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function LoginPage() {

  const BASE_UNITS = [
    {
      id: 'UNIT_01',
      name: 'Công ty Cổ phần Đầu tư Mặt Trời Việt',
    },
    {
      id: 'UNIT_02',
      name: 'Công ty TNHH Đầu tư Quốc tế Việt Đức',
    },
    {
      id: 'UNIT_03',
      name: 'Công ty TNHH Quốc tế Việt An',
    },
    {
      id: 'UNIT_04',
      name: 'Công ty TNHH Đầu tư Vietsun Ninh Thuận',
    },
    {
      id: 'UNIT_05',
      name: 'Vietsun Phú Yên - CN Công ty Cổ phần Đầu tư Mặt Trời Việt',
    },
  ];



  const navigate = useNavigate();

  const {
    session,
    login,
    isAuthenticated,
  } = useAuth();

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [baseUnitId, setBaseUnitId] =
    useState('');

  if (isAuthenticated) {
    const firstRoute =
      session?.navigation[0]?.routePath || '/';

    return (
      <Navigate
        to={firstRoute}
        replace
      />
    );
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!username.trim()) {
      setError(
        'Vui lòng nhập tên đăng nhập.'
      );
      return;
    }

    if (!password) {
      setError(
        'Vui lòng nhập mật khẩu.'
      );
      return;
    }

    if (!baseUnitId) {
      setError(
        'Vui lòng chọn đơn vị cơ sở.'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login({
        username: username.trim(),
        password,
      });

      const firstRoute =
        data.navigation[0]?.routePath || '/';

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
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8fc]">
      {/* Nền xanh bên phải */}
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[#247ccc] lg:block" />

      {/* Vòng tròn trang trí */}
      <div className="pointer-events-none absolute -bottom-[420px] -right-[310px] hidden h-[850px] w-[850px] rounded-full border border-white/30 lg:block" />

      <div className="pointer-events-none absolute -bottom-[360px] -right-[235px] hidden h-[700px] w-[700px] rounded-full border border-white/30 lg:block" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1600px] items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-20 lg:px-14 xl:px-20">
        {/* Khối giới thiệu bên trái */}
        <section className="hidden justify-center lg:flex">
          <div className="w-full max-w-[650px] rounded-md border border-slate-200/80 bg-white px-10 py-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
            <img
              src={`${import.meta.env.BASE_URL}images/vietsun-logo.jpg`}
              alt="Logo VIETSUN"
              className="mx-auto w-full max-w-[560px] object-contain"
            />

            <h2 className="mt-8 text-4xl font-black text-slate-950">
              Hệ thống GSD
            </h2>

            <p className="mx-auto mt-4 max-w-[560px] text-lg leading-8 text-slate-500">
              Đơn vị kiểm duyệt HQ5 VSN
            </p>
          </div>
        </section>

        {/* Khối đăng nhập bên phải */}
        <section className="flex justify-center">
          <div className="w-full max-w-[540px] rounded-lg bg-white/95 px-6 py-9 shadow-[0_22px_60px_rgba(15,23,42,0.16)] sm:px-11 sm:py-11">
            {/* Logo dành cho mobile */}
            <img
              src={`${import.meta.env.BASE_URL}images/vietsun-logo.jpg`}
              alt="Logo VIETSUN"
              className="mx-auto mb-8 w-full max-w-[320px] object-contain lg:hidden"
            />

            <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-[#1875d1]">
              Đăng nhập hệ thống
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Xin chào!
            </h1>

            <p className="mt-3 text-base leading-7 text-slate-500 sm:text-lg">
              Vui lòng đăng nhập để tiếp tục sử
              dụng hệ thống GSD.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Tên đăng nhập
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <EmailIcon />
                  </span>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    autoComplete="username"
                    autoFocus
                    disabled={loading}
                    placeholder="Nhập tên đăng nhập"
                    onChange={(event) => {
                      setUsername(
                        event.target.value
                      );
                      setError('');
                    }}
                    className="h-[40px] w-full rounded-sm border border-slate-300 bg-white pl-14 pr-5 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#247ccc] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Mật khẩu
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <LockIcon />
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    autoComplete="current-password"
                    disabled={loading}
                    placeholder="Nhập mật khẩu"
                    onChange={(event) => {
                      setPassword(
                        event.target.value
                      );
                      setError('');
                    }}
                    className="h-[40px] w-full rounded-sm border border-slate-300 bg-white pl-14 pr-14 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#247ccc] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? 'Ẩn mật khẩu'
                        : 'Hiện mật khẩu'
                    }
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#247ccc] disabled:cursor-not-allowed"
                  >
                    <EyeIcon
                      hidden={showPassword}
                    />
                  </button>
                </div>
              </div>


              <div>
                <label
                  htmlFor="baseUnitId"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Đơn vị cơ sở
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M4 21V5l8-3 8 3v16"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1M2 21h20"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>

                  <select
                    id="baseUnitId"
                    value={baseUnitId}
                    disabled={loading}
                    onChange={(event) => {
                      setBaseUnitId(
                        event.target.value
                      );
                      setError('');
                    }}
                    className="h-[40px] w-full appearance-none rounded-sm border border-slate-300 bg-white pl-14 pr-12 text-base text-slate-800 outline-none transition focus:border-[#247ccc] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      -- Chọn đơn vị cơ sở --
                    </option>

                    {BASE_UNITS.map((unit) => (
                      <option
                        key={unit.id}
                        value={unit.id}
                      >
                        {unit.name}
                      </option>
                    ))}
                  </select>

                  <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </div>


              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                loadingText="Đang đăng nhập..."
                className="h-[68px] w-full justify-center rounded-full bg-[#247ccc] text-base font-bold text-white shadow-none transition hover:bg-[#176db9]"
              >
                Đăng nhập
              </Button>

              <button
                type="button"
                className="pt-4 text-sm font-bold text-[#1875d1] transition hover:text-blue-800"
              >
                Quên mật khẩu?
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}