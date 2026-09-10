import { Route, Routes, Navigate } from 'react-router-dom';

import { LoginPage , ProtectedRoute} from '../../frontend/src/features/auth';
import App from './App';
export function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/*" element={<App />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}