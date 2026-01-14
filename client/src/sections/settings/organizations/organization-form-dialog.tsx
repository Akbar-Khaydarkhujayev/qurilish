import type { Organization } from 'src/types/construction';

import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  editingItem: Organization | null;
  onSave: (data: Organization) => void;
};

type FormValues = {
  name: string;
  taxId: string;
  regionId: number;
};

// Mock regions data
const MOCK_REGIONS = [
  { id: 1, name: 'Toshkent shahri' },
  { id: 2, name: 'Toshkent viloyati' },
  { id: 3, name: 'Andijon' },
  { id: 4, name: 'Buxoro' },
  { id: 5, name: "Farg'ona" },
];

export function OrganizationFormDialog({ open, onClose, editingItem, onSave }: Props) {
  const { t } = useTranslate();

  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
      taxId: '',
      regionId: 0,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name,
        taxId: editingItem.taxId || '',
        regionId: editingItem.regionId,
      });
    } else {
      reset({
        name: '',
        taxId: '',
        regionId: 0,
      });
    }
  }, [editingItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const selectedRegion = MOCK_REGIONS.find((r) => r.id === data.regionId);
      const item: Organization = {
        id: editingItem?.id || Date.now(),
        name: data.name,
        taxId: data.taxId,
        regionId: data.regionId,
        regionName: selectedRegion?.name || '',
      };
      onSave(item);
      reset();
    } catch (error) {
      console.error(error);
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{editingItem ? t('edit') : t('add')}</DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Field.Text name="name" label={t('name')} required InputLabelProps={{ shrink: true }} />

            <Field.Text name="taxId" label={t('taxId')} InputLabelProps={{ shrink: true }} />

            <Field.Select
              name="regionId"
              label={t('regions')}
              required
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value={0} disabled>
                {t('select')}
              </MenuItem>
              {MOCK_REGIONS.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('save')}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
