import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ConstructionItemsView } from 'src/sections/settings/construction-items/construction-items-view';

// ----------------------------------------------------------------------

const metadata = { title: `Construction Items | Settings - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ConstructionItemsView />
    </>
  );
}
