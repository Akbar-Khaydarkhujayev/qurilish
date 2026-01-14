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
import { useEditOrganization } from '../api/edit';
import { useCreateOrganization } from '../api/create';
import { useGetRegions } from '../../regions/api/get';
import { useGetOrganizationById } from '../api/get-by-id';

import type { FormFields } from '../api/schema';

const defaultValues = {
  id: undefined,
  name: '',
  tax_id: '',
  region_id: undefined as number | undefined,
};

interface IProps {
  open: boolean;
  onClose: () => void;
  editedOrganizationId: string | undefined;
}

export const OrganizationDialog = ({ open, onClose, editedOrganizationId }: IProps) => {
  const { t } = useTranslate();

  const { data: organization } = useGetOrganizationById(editedOrganizationId);
  const { data: regionsData } = useGetRegions({ page: 1, limit: 100 });
  const { mutate: edit } = useEditOrganization();
  const { mutate: create } = useCreateOrganization();

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: organization?.data.id || undefined,
      name: organization?.data.name || '',
      tax_id: organization?.data.tax_id || '',
      region_id: organization?.data.region_id || undefined,
    });
  }, [organization, methods, open, editedOrganizationId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedOrganizationId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedOrganizationId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedOrganizationId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Field.Text required size="small" sx={{ mb: 2 }} name="name" label={t('name')} />

            <Field.Text size="small" sx={{ mb: 2 }} name="tax_id" label={t('Tax ID')} />

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
