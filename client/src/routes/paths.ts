// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  BUILDINGS: '/buildings',
  SETTINGS: '/settings',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    signIn: `${ROOTS.AUTH}/jwt/sign-in`,
    signUp: `${ROOTS.AUTH}/jwt/sign-up`,
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
  },
  buildings: ROOTS.BUILDINGS,
  settings: {
    self: ROOTS.SETTINGS,
    organizations: `${ROOTS.SETTINGS}/organizations`,
    users: `${ROOTS.SETTINGS}/users`,
    regions: `${ROOTS.SETTINGS}/regions`,
    districts: `${ROOTS.SETTINGS}/districts`,
    projectOrganizations: `${ROOTS.SETTINGS}/project-organizations`,
    contractors: `${ROOTS.SETTINGS}/contractors`,
    constructionStatuses: `${ROOTS.SETTINGS}/construction-statuses`,
    constructionItems: `${ROOTS.SETTINGS}/construction-items`,
  },
};
