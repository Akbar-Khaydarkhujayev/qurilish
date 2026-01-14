import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import DistrictsView from 'src/sections/settings/districts/view';

// ----------------------------------------------------------------------

const metadata = { title: `Districts | Settings - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DistrictsView />
    </>
  );
}
