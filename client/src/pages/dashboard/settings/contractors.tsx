import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import ContractorsView from 'src/sections/settings/contractors/view';

// ----------------------------------------------------------------------

const metadata = { title: `Contractors | Settings - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <ContractorsView />
    </>
  );
}
