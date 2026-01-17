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
import { useEditContract } from '../api/edit';
import { useCreateContract } from '../api/create';
import { useGetContractById } from '../api/get-by-id';

import type { FormFields } from '../api/schema';

interface IProps {
  open: boolean;
  onClose: () => void;
  editedContractId: string | undefined;
  objectCardId: string;
}

export const ContractDialog = ({ open, onClose, editedContractId, objectCardId }: IProps) => {
  const { t } = useTranslate();

  const { data: contract } = useGetContractById(editedContractId);
  const { mutate: edit } = useEditContract();
  const { mutate: create } = useCreateContract();

  const defaultValues: FormFields = {
    id: undefined,
    object_card_id: Number(objectCardId),
    contract_number: '',
    contract_date: null,
    contract_amount: undefined,
    stage: '',
  };

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: contract?.data.id || undefined,
      object_card_id: contract?.data.object_card_id || Number(objectCardId),
      contract_number: contract?.data.contract_number || '',
      contract_date: contract?.data.contract_date?.split('T')[0] || null,
      contract_amount: Number(contract?.data.contract_amount || 0),
      stage: contract?.data.stage || '',
    });
  }, [contract, methods, open, editedContractId, objectCardId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedContractId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedContractId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedContractId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Field.Text
              required
              size="small"
              sx={{ mb: 2 }}
              name="contract_number"
              label={t('Contract Number')}
            />
            <Field.DatePicker
              name="contract_date"
              label={t('Contract Date')}
              sx={{ mb: 2 }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <Field.Text
              size="small"
              sx={{ mb: 2 }}
              name="contract_amount"
              label={t('Contract Amount')}
              type="number"
            />
            <Field.Text size="small" sx={{ mb: 2 }} name="stage" label={t('Stage')} />

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
