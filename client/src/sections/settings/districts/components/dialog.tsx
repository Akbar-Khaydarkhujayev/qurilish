import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, MenuItem, DialogTitle, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { formSchema } from '../api/schema';
import { useEditDistrict } from '../api/edit';
import { useCreateDistrict } from '../api/create';
import { useGetDistrictById } from '../api/get-by-id';
import { useGetRegions } from '../../regions/api/get';

import type { FormFields } from '../api/schema';

const defaultValues = {
  id: undefined,
  name: '',
  region_id: undefined as number | undefined,
};

interface IProps {
  open: boolean;
  onClose: () => void;
  editedDistrictId: string | undefined;
}

export const DistrictDialog = ({ open, onClose, editedDistrictId }: IProps) => {
  const { t } = useTranslate();

  const { data: district } = useGetDistrictById(editedDistrictId);
  const { data: regionsData } = useGetRegions({ page: 1, limit: 100 });
  const { mutate: edit } = useEditDistrict();
  const { mutate: create } = useCreateDistrict();

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: district?.data.id || undefined,
      name: district?.data.name || '',
      region_id: district?.data.region_id || undefined,
    });
  }, [district, methods, open, editedDistrictId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedDistrictId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedDistrictId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedDistrictId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Field.Text required size="small" sx={{ mb: 2 }} name="name" label={t('name')} />

            <Field.Select required size="small" sx={{ mb: 2 }} name="region_id" label={t('Region')}>
              {regionsData?.data.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Box display="flex" justifyContent="flex-end" gap={1} mb={3}>
              <Button
                variant="contained"
                color="error"
                onClick={onClose}
                startIcon={<Iconify icon="maktab:mingcute-close-fill" />}
              >
                {t('cancel')}
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={methods.formState.isSubmitting}
                startIcon={<Iconify icon="maktab:mingcute-save-2-fill" />}
              >
                {t('save')}
              </LoadingButton>
            </Box>
          </Box>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
