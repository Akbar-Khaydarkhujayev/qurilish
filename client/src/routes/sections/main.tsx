import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { SplashScreen, LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('src/pages/error/404'));
const IndexPage = lazy(() => import('src/pages/dashboard'));
const DashboardBuildingDetailsPage = lazy(() => import('src/pages/dashboard/building-details'));
const Dashboard1Page = lazy(() => import('src/pages/dashboard1'));
const Dashboard1BuildingDetailsPage = lazy(() => import('src/pages/dashboard1/building-details'));
const BuildingsPage = lazy(() => import('src/pages/dashboard/buildings'));
const OrganizationsPage = lazy(() => import('src/pages/dashboard/settings/organizations'));
const UsersPage = lazy(() => import('src/pages/dashboard/settings/users'));
const RegionsPage = lazy(() => import('src/pages/dashboard/settings/regions'));
const DistrictsPage = lazy(() => import('src/pages/dashboard/settings/districts'));
const ProjectOrganizationsPage = lazy(
  () => import('src/pages/dashboard/settings/project-organizations')
);
const ContractorsPage = lazy(() => import('src/pages/dashboard/settings/contractors'));
const ConstructionStatusesPage = lazy(
  () => import('src/pages/dashboard/settings/construction-statuses')
);
const ConstructionItemsPage = lazy(() => import('src/pages/dashboard/settings/construction-items'));

// Building detail pages
const BuildingDetailLayout = lazy(() => import('src/pages/dashboard/buildings/index'));
const BuildingDetailsPage = lazy(() => import('src/pages/dashboard/buildings/details'));
const BuildingContractsPage = lazy(() => import('src/pages/dashboard/buildings/contracts'));
const BuildingSubObjectsPage = lazy(() => import('src/pages/dashboard/buildings/sub-object-cards'));
const BuildingEstimatesPage = lazy(() => import('src/pages/dashboard/buildings/estimates'));
const BuildingExpensesPage = lazy(() => import('src/pages/dashboard/buildings/bank-expenses'));
const BuildingInvoicesPage = lazy(() => import('src/pages/dashboard/buildings/invoices'));
const BuildingFilesPage = lazy(() => import('src/pages/dashboard/buildings/files'));

// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const mainRoutes = [
  {
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [{ path: '404', element: <Page404 /> }],
  },
  {
    // Pathless layout route: No 'path' here means it doesn't affect the URL
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      { path: 'dashboard', element: <IndexPage /> }, // URL: /dashboard
      { path: 'dashboard/:id', element: <DashboardBuildingDetailsPage /> }, // URL: /dashboard/:id
      { path: 'dashboard1', element: <Dashboard1Page /> }, // URL: /dashboard1
      { path: 'dashboard1/:id', element: <Dashboard1BuildingDetailsPage /> }, // URL: /dashboard1/:id
      { path: 'buildings', element: <BuildingsPage /> }, // URL: /buildings
      {
        path: 'buildings/:id',
        element: <BuildingDetailLayout />,
        children: [
          { index: true, element: <BuildingDetailsPage /> },
          { path: 'contracts', element: <BuildingContractsPage /> },
          { path: 'sub-object-cards', element: <BuildingSubObjectsPage /> },
          { path: 'estimates', element: <BuildingEstimatesPage /> },
          { path: 'bank-expenses', element: <BuildingExpensesPage /> },
          { path: 'invoices', element: <BuildingInvoicesPage /> },
          { path: 'files', element: <BuildingFilesPage /> },
        ],
      },
      {
        path: 'settings', // URL starts with /settings
        children: [
          { path: 'organizations', element: <OrganizationsPage /> }, // URL: /settings/organizations
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
