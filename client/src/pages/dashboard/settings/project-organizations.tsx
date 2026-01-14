import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import ProjectOrganizationsView from 'src/sections/settings/project-organizations/view';

// ----------------------------------------------------------------------

const metadata = { title: `Project Organizations | Settings - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ProjectOrganizationsView />
    </>
  );
}
