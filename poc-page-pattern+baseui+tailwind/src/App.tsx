/**
 * App Component
 * Main application component with routing and Redux Provider
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { migrateFromLocalStorage } from './utils/tokenManager';
import { LoginPage, FilesPage, MFAPage, MFAVerificationPage } from './pages';
import { ProtectedRoute, AppLayout } from './components/layout';
import { ROUTES } from './constants';

function AppContent() {
  useEffect(() => {
    // Migrate old localStorage tokens to secure storage (one-time)
    migrateFromLocalStorage();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.MFA_VERIFICATION} element={<MFAVerificationPage />} />

        {/* Protected Routes */}
        <Route
          path={ROUTES.FILES}
          element={
            <ProtectedRoute>
              <AppLayout>
                <FilesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.MFA}
          element={
            <ProtectedRoute>
              <AppLayout>
                <MFAPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.FILES} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.FILES} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
