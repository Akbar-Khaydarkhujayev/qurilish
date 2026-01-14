import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import UsersView from 'src/sections/settings/users/view';

// ----------------------------------------------------------------------

const metadata = { title: `Users | Settings - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <UsersView />
    </>
  );
}
