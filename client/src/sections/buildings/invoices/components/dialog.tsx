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
import { useEditInvoice } from '../api/edit';
import { useCreateInvoice } from '../api/create';
import { useGetInvoiceById } from '../api/get-by-id';
import { useGetContractsByObjectCard } from '../../contracts/api/get';

import type { FormFields } from '../api/schema';

interface IProps {
  open: boolean;
  onClose: () => void;
  editedInvoiceId: string | undefined;
  objectCardId: string;
}

export const InvoiceDialog = ({ open, onClose, editedInvoiceId, objectCardId }: IProps) => {
  const { t } = useTranslate();

  const { data: invoice } = useGetInvoiceById(editedInvoiceId);
  const { data: contracts } = useGetContractsByObjectCard(objectCardId);
  const { mutate: edit } = useEditInvoice();
  const { mutate: create } = useCreateInvoice();

  const defaultValues: FormFields = {
    id: undefined,
    object_card_id: Number(objectCardId),
    object_contract_id: undefined as unknown as number,
    document_number: '',
    document_date: null,
    amount: undefined,
    description: '',
  };

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: invoice?.data.id || undefined,
      object_card_id: invoice?.data.object_card_id || Number(objectCardId),
      object_contract_id: invoice?.data.object_contract_id || (undefined as unknown as number),
      document_number: invoice?.data.document_number || '',
      document_date: invoice?.data.document_date?.split('T')[0] || null,
      amount: invoice?.data.amount ?? undefined,
      description: invoice?.data.description || '',
    });
  }, [invoice, methods, open, editedInvoiceId, objectCardId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedInvoiceId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedInvoiceId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedInvoiceId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Field.Select
              required
              size="small"
              sx={{ mb: 2 }}
              name="object_contract_id"
              label={t('Contract')}
            >
              {contracts?.map((contract) => (
                <MenuItem key={contract.id} value={contract.id}>
                  {contract.contract_number}
                </MenuItem>
              ))}
            </Field.Select>
            <Field.Text
              size="small"
              sx={{ mb: 2 }}
              name="document_number"
              label={t('Document Number')}
            />
            <Field.DatePicker
              name="document_date"
              label={t('Document Date')}
              sx={{ mb: 2 }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <Field.Text
              size="small"
              sx={{ mb: 2 }}
              name="amount"
              label={t('Amount')}
              type="number"
            />
            <Field.Text
              size="small"
              sx={{ mb: 2 }}
              name="description"
              label={t('Description')}
              rows={2}
              multiline
            />

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
