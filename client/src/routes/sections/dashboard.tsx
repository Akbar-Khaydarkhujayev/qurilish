import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const IndexPage = lazy(() => import('src/pages/dashboard/one'));
const BuildingsPage = lazy(() => import('src/pages/dashboard/buildings'));
const OrganizationsPage = lazy(() => import('src/pages/dashboard/settings/organizations'));
const UsersPage = lazy(() => import('src/pages/dashboard/settings/users'));
const RegionsPage = lazy(() => import('src/pages/dashboard/settings/regions'));
const DistrictsPage = lazy(() => import('src/pages/dashboard/settings/districts'));
const ProjectOrganizationsPage = lazy(() => import('src/pages/dashboard/settings/project-organizations'));
const ContractorsPage = lazy(() => import('src/pages/dashboard/settings/contractors'));
const ConstructionStatusesPage = lazy(() => import('src/pages/dashboard/settings/construction-statuses'));
const ConstructionItemsPage = lazy(() => import('src/pages/dashboard/settings/construction-items'));

// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { element: <IndexPage />, index: true },
      { path: 'buildings', element: <BuildingsPage /> },
      {
        path: 'settings',
        children: [
          { path: 'organizations', element: <OrganizationsPage /> },
          { path: 'users', element: <UsersPage /> },
          { path: 'regions', element: <RegionsPage /> },
          { path: 'districts', element: <DistrictsPage /> },
          { path: 'project-organizations', element: <ProjectOrganizationsPage /> },
          { path: 'contractors', element: <ContractorsPage /> },
          { path: 'construction-statuses', element: <ConstructionStatusesPage /> },
          { path: 'construction-items', element: <ConstructionItemsPage /> },
        ],
      },
    ],
  },
];
