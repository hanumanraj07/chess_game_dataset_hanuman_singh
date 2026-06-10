import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import AdminRoute from './components/layout/AdminRoute.jsx';
import PublicRoute from './components/layout/PublicRoute.jsx';

// Auth pages (not lazy — small)
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';

// Lazy-loaded page components
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard.jsx'));
const MatchesPage = lazy(() => import('./features/matches/MatchesPage.jsx'));
const MatchDetail = lazy(() => import('./features/matches/MatchDetail.jsx'));
const PlayersPage = lazy(() => import('./features/players/PlayersPage.jsx'));
const PlayerDetail = lazy(() => import('./features/players/PlayerDetail.jsx'));
const OpeningsPage = lazy(() => import('./features/openings/OpeningsPage.jsx'));
const AnalyticsDashboard = lazy(() => import('./features/analytics/AnalyticsDashboard.jsx'));
const SearchPage = lazy(() => import('./features/search/SearchPage.jsx'));
const UsersManagement = lazy(() => import('./features/admin/UsersManagement.jsx'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage.jsx'));
const SettingsPage = lazy(() => import('./features/profile/SettingsPage.jsx'));

const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '60vh', fontFamily: 'var(--font-display)',
    fontSize: 'var(--font-size-xs)', textTransform: 'uppercase',
    letterSpacing: '0.15em', color: 'var(--color-muted)',
  }}>
    <span>◌ Loading…</span>
  </div>
);

const App = () => {
  const theme = useSelector((s) => s.ui.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes — inside dashboard layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/matches/:id" element={<MatchDetail />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/players/:id" element={<PlayerDetail />} />
              <Route path="/openings" element={<OpeningsPage />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Admin-only routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin/users" element={<UsersManagement />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
