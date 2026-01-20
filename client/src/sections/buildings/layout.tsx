import { Outlet, useParams, useNavigate, useLocation } from 'react-router';

import { Box, Tab, Tabs, Typography, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

import { useGetBuildingById } from './api/get-by-id';

const TABS = [
  { value: '', label: 'Details', icon: 'solar:document-text-bold' },
  { value: 'contracts', label: 'Contracts', icon: 'solar:file-text-bold' },
  { value: 'sub-object-cards', label: 'Sub Objects', icon: 'solar:layers-bold' },
  { value: 'estimates', label: 'Estimates', icon: 'solar:calculator-bold' },
  { value: 'bank-expenses', label: 'Bank Expenses', icon: 'solar:wallet-bold' },
  { value: 'invoices', label: 'Invoices', icon: 'solar:bill-list-bold' },
  { value: 'files', label: 'Files', icon: 'solar:folder-bold' },
];

export default function BuildingDetailLayout() {
  const { t } = useTranslate();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: building } = useGetBuildingById(id);

  const currentTab =
    location.pathname.split('/').pop() === id ? '' : location.pathname.split('/').pop() || '';

  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    navigate(`/buildings/${id}${newValue ? `/${newValue}` : ''}`);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <IconButton onClick={() => navigate(-1)}>
          <Iconify icon="solar:arrow-left-bold" />
        </IconButton>
        <Box>
          <Typography variant="h4">
            {building?.data?.object_name || t('Building Details')}
          </Typography>
          {building?.data?.card_number && (
            <Typography variant="body2" color="text.secondary">
              {t('Object ID')}: {building.data.card_number}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={t(tab.label)}
              icon={<Iconify icon={tab.icon} width={20} />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      <Outlet />
    </Box>
  );
}
