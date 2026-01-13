import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { SvgColor } from 'src/components/svg-color';

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

export const navData = [
  /**
   * Main
   */
  {
    subheader: 'Main',
    items: [
      { title: 'Dashboard', path: paths.dashboard.root, icon: ICONS.dashboard },
      { title: 'Buildings', path: paths.dashboard.buildings, icon: ICONS.banking },
    ],
  },
  /**
   * Settings
   */
  {
    subheader: 'Settings',
    items: [
      {
        title: 'Settings',
        path: paths.dashboard.settings.organizations,
        icon: ICONS.parameter,
        children: [
          { title: 'Organizations', path: paths.dashboard.settings.organizations },
          { title: 'Users', path: paths.dashboard.settings.users },
          { title: 'Regions', path: paths.dashboard.settings.regions },
          { title: 'Districts', path: paths.dashboard.settings.districts },
          { title: 'Project Organizations', path: paths.dashboard.settings.projectOrganizations },
          { title: 'Contractors', path: paths.dashboard.settings.contractors },
          { title: 'Construction Statuses', path: paths.dashboard.settings.constructionStatuses },
          { title: 'Construction Items', path: paths.dashboard.settings.constructionItems },
        ],
      },
    ],
  },
];
