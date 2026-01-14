import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, DialogTitle, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { formSchema } from '../api/schema';
import { useEditContractor } from '../api/edit';
import { useCreateContractor } from '../api/create';
import { useGetContractorById } from '../api/get-by-id';

import type { FormFields } from '../api/schema';

const defaultValues = {
  id: undefined,
  name: '',
  tax_id: '',
  address: '',
  phone_number: '',
  mfo: '',
};

interface IProps {
  open: boolean;
  onClose: () => void;
  editedContractorId: string | undefined;
}

export const ContractorDialog = ({ open, onClose, editedContractorId }: IProps) => {
  const { t } = useTranslate();

  const { data: contractor } = useGetContractorById(editedContractorId);
  const { mutate: edit } = useEditContractor();
  const { mutate: create } = useCreateContractor();

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: contractor?.data.id || undefined,
      name: contractor?.data.name || '',
      tax_id: contractor?.data.tax_id || '',
      address: contractor?.data.address || '',
      phone_number: contractor?.data.phone_number || '',
      mfo: contractor?.data.mfo || '',
    });
  }, [contractor, methods, open, editedContractorId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedContractorId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedContractorId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedContractorId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Field.Text required size="small" sx={{ mb: 2 }} name="name" label={t('name')} />
            <Field.Text size="small" sx={{ mb: 2 }} name="tax_id" label={t('Tax ID')} />
            <Field.Text
              size="small"
              sx={{ mb: 2 }}
              name="address"
              label={t('Address')}
              multiline
              rows={2}
            />
            <Field.Text size="small" sx={{ mb: 2 }} name="phone_number" label={t('Phone Number')} />
            <Field.Text size="small" sx={{ mb: 2 }} name="mfo" label={t('MFO')} />

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
