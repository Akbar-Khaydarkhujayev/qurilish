import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import BuildingDetailLayout from 'src/sections/buildings/layout';

// ----------------------------------------------------------------------

const metadata = { title: `Building Details | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BuildingDetailLayout />
    </>
  );
}
