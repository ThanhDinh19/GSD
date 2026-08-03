// import {StrictMode} from 'react';
// import {createRoot} from 'react-dom/client';
// import App from './App.tsx';
// import App_test from './App_test.tsx';
// import './index.css';

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App_test />
//   </StrictMode>,
// );
import React from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './features/auth';
import { AppRouter } from '../src/RootApp';
import { ToastProvider } from './shared/notifications/ToastProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);