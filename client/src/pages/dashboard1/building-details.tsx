import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BuildingDetailsView } from 'src/sections/dashboard1/building-details-view';

// ----------------------------------------------------------------------

const metadata = { title: `Super Admin - Building Details - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BuildingDetailsView />
    </>
  );
}
