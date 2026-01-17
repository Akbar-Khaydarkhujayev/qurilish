import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DashboardView } from 'src/sections/dashboard/view';

// ----------------------------------------------------------------------

const metadata = { title: `Page one | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DashboardView />
    </>
  );
}
