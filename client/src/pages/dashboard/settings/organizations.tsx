import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { OrganizationsView } from 'src/sections/settings/organizations/organizations-view';

// ----------------------------------------------------------------------

const metadata = { title: `Organizations | Settings - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OrganizationsView />
    </>
  );
}
