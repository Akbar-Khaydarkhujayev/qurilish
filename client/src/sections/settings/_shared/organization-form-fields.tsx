import Box from '@mui/material/Box';

import { useTranslate } from 'src/locales';

import { Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

// Shared form fields for Project Organizations and Contractors
export function OrganizationFormFields() {
  const { t } = useTranslate();

  return (
    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Field.Text name="name" label={t('name')} required InputLabelProps={{ shrink: true }} />

      <Field.Text name="taxId" label={t('taxId')} InputLabelProps={{ shrink: true }} />

      <Field.Text
        name="address"
        label={t('address')}
        multiline
        rows={2}
        InputLabelProps={{ shrink: true }}
      />

      <Field.Text name="phoneNumber" label={t('phoneNumber')} InputLabelProps={{ shrink: true }} />

      <Field.Text name="mfo" label={t('mfo')} InputLabelProps={{ shrink: true }} />
    </Box>
  );
}
