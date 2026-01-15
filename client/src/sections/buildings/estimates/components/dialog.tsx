import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Grid, Dialog, Button, MenuItem, DialogTitle, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { formSchema } from '../api/schema';
import { useEditEstimate } from '../api/edit';
import { useCreateEstimate } from '../api/create';
import { useGetEstimateById } from '../api/get-by-id';
import { useGetContractsByObjectCard } from '../../contracts/api/get';

import type { FormFields } from '../api/schema';

interface IProps {
  open: boolean;
  onClose: () => void;
  editedEstimateId: string | undefined;
  objectCardId: string;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const EstimateDialog = ({ open, onClose, editedEstimateId, objectCardId }: IProps) => {
  const { t } = useTranslate();

  const { data: estimate } = useGetEstimateById(editedEstimateId);
  const { data: contracts } = useGetContractsByObjectCard(objectCardId);
  const { mutate: edit } = useEditEstimate();
  const { mutate: create } = useCreateEstimate();

  const defaultValues: FormFields = {
    id: undefined,
    object_card_id: Number(objectCardId),
    object_contract_id: undefined as unknown as number,
    year: new Date().getFullYear(),
    month_1: undefined,
    month_2: undefined,
    month_3: undefined,
    month_4: undefined,
    month_5: undefined,
    month_6: undefined,
    month_7: undefined,
    month_8: undefined,
    month_9: undefined,
    month_10: undefined,
    month_11: undefined,
    month_12: undefined,
  };

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: estimate?.data.id || undefined,
      object_card_id: estimate?.data.object_card_id || Number(objectCardId),
      object_contract_id: estimate?.data.object_contract_id || (undefined as unknown as number),
      year: estimate?.data.year || new Date().getFullYear(),
      month_1: estimate?.data.month_1 ?? undefined,
      month_2: estimate?.data.month_2 ?? undefined,
      month_3: estimate?.data.month_3 ?? undefined,
      month_4: estimate?.data.month_4 ?? undefined,
      month_5: estimate?.data.month_5 ?? undefined,
      month_6: estimate?.data.month_6 ?? undefined,
      month_7: estimate?.data.month_7 ?? undefined,
      month_8: estimate?.data.month_8 ?? undefined,
      month_9: estimate?.data.month_9 ?? undefined,
      month_10: estimate?.data.month_10 ?? undefined,
      month_11: estimate?.data.month_11 ?? undefined,
      month_12: estimate?.data.month_12 ?? undefined,
    });
  }, [estimate, methods, open, editedEstimateId, objectCardId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedEstimateId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedEstimateId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle textAlign="center">{editedEstimateId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Field.Select required size="small" name="object_contract_id" label={t('Contract')}>
                  {contracts?.map((contract) => (
                    <MenuItem key={contract.id} value={contract.id}>
                      {contract.contract_number}
                    </MenuItem>
                  ))}
                </Field.Select>
              </Grid>
              <Grid xs={6}>
                <Field.Text required size="small" name="year" label={t('Year')} type="number" />
              </Grid>
              {months.map((month, index) => (
                <Grid xs={4} key={month}>
                  <Field.Text
                    size="small"
                    name={`month_${index + 1}`}
                    label={t(month)}
                    type="number"
                  />
                </Grid>
              ))}
            </Grid>

            <Box display="flex" justifyContent="flex-end" gap={1} mt={3} mb={3}>
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
