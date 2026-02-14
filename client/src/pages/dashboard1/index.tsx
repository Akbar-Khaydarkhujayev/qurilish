import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { Dashboard1View } from 'src/sections/dashboard1/view';

// ----------------------------------------------------------------------

const metadata = { title: `Super Admin Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <Dashboard1View />
    </>
  );
}
