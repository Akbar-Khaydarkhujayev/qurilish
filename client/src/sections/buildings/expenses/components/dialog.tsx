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
import { useEditExpense } from '../api/edit';
import { useCreateExpense } from '../api/create';
import { useGetExpenseById } from '../api/get-by-id';
import { useGetContractsByObjectCard } from '../../contracts/api/get';

import type { FormFields } from '../api/schema';

interface IProps {
  open: boolean;
  onClose: () => void;
  editedExpenseId: string | undefined;
  objectCardId: string;
}

export const ExpenseDialog = ({ open, onClose, editedExpenseId, objectCardId }: IProps) => {
  const { t } = useTranslate();

  const { data: expense } = useGetExpenseById(editedExpenseId);
  const { data: contracts } = useGetContractsByObjectCard(objectCardId);
  const { mutate: edit } = useEditExpense();
  const { mutate: create } = useCreateExpense();

  const defaultValues: FormFields = {
    id: undefined,
    object_card_id: Number(objectCardId),
    object_contract_id: undefined as unknown as number,
    registry_number: '',
    registry_date: null,
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
      id: expense?.data.id || undefined,
      object_card_id: expense?.data.object_card_id || Number(objectCardId),
      object_contract_id: expense?.data.object_contract_id || (undefined as unknown as number),
      registry_number: expense?.data.registry_number || '',
      registry_date: expense?.data.registry_date?.split('T')[0] || null,
      amount: expense?.data.amount ?? undefined,
      description: expense?.data.description || '',
    });
  }, [expense, methods, open, editedExpenseId, objectCardId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedExpenseId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedExpenseId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedExpenseId ? t('edit') : t('add')}</DialogTitle>

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
              name="registry_number"
              label={t('Registry Number')}
            />
            <Field.DatePicker
              name="registry_date"
              label={t('Registry Date')}
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
