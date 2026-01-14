import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import ConstructionStatusesView from 'src/sections/settings/construction-statuses/view';

// ----------------------------------------------------------------------

const metadata = { title: `Construction Statuses | Settings - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ConstructionStatusesView />
    </>
  );
}
