import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import RegionsView from 'src/sections/settings/regions/view';

// ----------------------------------------------------------------------

const metadata = { title: `Regions | Settings - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <RegionsView />
    </>
  );
}
