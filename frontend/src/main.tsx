import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import App_test from './App_test.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App_test />
  </StrictMode>,
);
