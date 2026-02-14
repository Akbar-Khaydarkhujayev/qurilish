import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

// Hook to get nav data based on user role
export const useNavData = () => {
  const { user } = useAuthContext();
  const userRole = user?.role;

  return useMemo(() => {
    // Settings children based on role
    const settingsChildren = [];

    // super_admin only pages: Organizations, Regions, Districts, Construction Statuses, Construction Items
    if (userRole === 'super_admin') {
      settingsChildren.push(
        { title: 'Organizations', path: paths.settings.organizations },
        { title: 'Users', path: paths.settings.users },
        { title: 'Regions', path: paths.settings.regions },
        { title: 'Districts', path: paths.settings.districts },
        { title: 'Construction Statuses', path: paths.settings.constructionStatuses },
        { title: 'Construction Items', path: paths.settings.constructionItems }
      );
    } else {
      // region_admin and user can see: Users, Project Organizations, Contractors
      settingsChildren.push(
        { title: 'Users', path: paths.settings.users },
        { title: 'Project Organizations', path: paths.settings.projectOrganizations },
        { title: 'Contractors', path: paths.settings.contractors }
      );
    }

    // Main menu items based on role
    const mainItems = [
      // { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'Dashboard', path: paths.dashboard1, icon: ICONS.analytics },
    ];

    // Buildings page is hidden from super_admin
    if (userRole !== 'super_admin') {
      mainItems.push({ title: 'Buildings', path: paths.buildings, icon: ICONS.banking });
    }

    return [
      /**
       * Main
       */
      {
        items: mainItems,
      },
      /**
       * Settings
       */
      {
        items: [
          {
            title: 'Settings',
            path: paths.settings.self,
            icon: ICONS.parameter,
            children: settingsChildren,
          },
        ],
      },
    ];
  }, [userRole]);
};

// Default nav data (for backwards compatibility)
export const navData = [
  {
    items: [
      // { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'Dashboard', path: paths.dashboard1, icon: ICONS.analytics },
      { title: 'Buildings', path: paths.buildings, icon: ICONS.banking },
    ],
  },
  {
    items: [
      {
        title: 'Settings',
        path: paths.settings.self,
        icon: ICONS.parameter,
        children: [
          { title: 'Organizations', path: paths.settings.organizations },
          { title: 'Users', path: paths.settings.users },
          { title: 'Regions', path: paths.settings.regions },
          { title: 'Districts', path: paths.settings.districts },
          { title: 'Project Organizations', path: paths.settings.projectOrganizations },
          { title: 'Contractors', path: paths.settings.contractors },
          { title: 'Construction Statuses', path: paths.settings.constructionStatuses },
          { title: 'Construction Items', path: paths.settings.constructionItems },
        ],
      },
    ],
  },
];
