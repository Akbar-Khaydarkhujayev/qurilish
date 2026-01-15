import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import BuildingsView from 'src/sections/buildings/view';

// ----------------------------------------------------------------------

const metadata = { title: `Buildings | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BuildingsView />
    </>
  );
}
