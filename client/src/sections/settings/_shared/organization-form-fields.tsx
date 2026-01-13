import Box from '@mui/material/Box';

import { useLocalization } from 'src/locales/use-localization';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

// Shared form fields for Project Organizations and Contractors
export function OrganizationFormFields() {
  const { t } = useLocalization();

  return (
    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Field.Text
        name="name"
        label={t('common.name')}
        required
        InputLabelProps={{ shrink: true }}
      />

      <Field.Text name="taxId" label={t('common.taxId')} InputLabelProps={{ shrink: true }} />

      <Field.Text
        name="address"
        label={t('common.address')}
        multiline
        rows={2}
        InputLabelProps={{ shrink: true }}
      />

      <Field.Text
        name="phoneNumber"
        label={t('common.phoneNumber')}
        InputLabelProps={{ shrink: true }}
      />

      <Field.Text name="mfo" label={t('common.mfo')} InputLabelProps={{ shrink: true }} />
    </Box>
  );
}
