import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from './paths';
import { Layout } from '../components/Layout/Layout';
import { RequireAuth } from '../features/auth/RequireAuth';

const BuildOverview = lazy(() =>
  import('../components/BuildOverview/BuildOverview').then((mod) => ({
    default: mod.BuildOverview,
  })),
);
const ModBuilder = lazy(() =>
  import('../components/ModBuilder/ModBuilder').then((mod) => ({
    default: mod.ModBuilder,
  })),
);
const AdminPage = lazy(() =>
  import('../components/Auth/AdminPage').then((mod) => ({
    default: mod.AdminPage,
  })),
);
const ProfilePage = lazy(() =>
  import('../features/profile/ProfilePage').then((mod) => ({
    default: mod.ProfilePage,
  })),
);
const LoginPage = lazy(() =>
  import('../components/Auth/LoginPage').then((mod) => ({
    default: mod.LoginPage,
  })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted">Loading...</p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Navigate to={APP_PATHS.home} replace />} />
          <Route path={APP_PATHS.buildOverview} element={<BuildOverview />} />
          <Route path={APP_PATHS.buildNew} element={<ModBuilder />} />
          <Route path={APP_PATHS.buildEdit} element={<ModBuilder />} />
          <Route path={APP_PATHS.admin} element={<AdminPage />} />
          <Route path={APP_PATHS.profile} element={<ProfilePage />} />
        </Route>
        <Route path={APP_PATHS.login} element={<LoginPage />} />
      </Routes>
    </Suspense>
  );
}
