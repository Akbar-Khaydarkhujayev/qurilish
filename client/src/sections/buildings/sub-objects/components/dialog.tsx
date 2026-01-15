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
import { useEditSubObject } from '../api/edit';
import { useCreateSubObject } from '../api/create';
import { useGetSubObjectById } from '../api/get-by-id';

import type { FormFields } from '../api/schema';

interface IProps {
  open: boolean;
  onClose: () => void;
  editedSubObjectId: string | undefined;
  objectCardId: string;
}

export const SubObjectDialog = ({ open, onClose, editedSubObjectId, objectCardId }: IProps) => {
  const { t } = useTranslate();

  const { data: subObject } = useGetSubObjectById(editedSubObjectId);
  const { mutate: edit } = useEditSubObject();
  const { mutate: create } = useCreateSubObject();

  const defaultValues: FormFields = {
    id: undefined,
    object_card_id: Number(objectCardId),
    name: '',
    deadline: null,
    cost: undefined,
    completion_percentage: 0,
  };

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: subObject?.data.id || undefined,
      object_card_id: subObject?.data.object_card_id || Number(objectCardId),
      name: subObject?.data.name || '',
      deadline: subObject?.data.deadline?.split('T')[0] || null,
      cost: subObject?.data.cost ?? undefined,
      completion_percentage: subObject?.data.completion_percentage ?? 0,
    });
  }, [subObject, methods, open, editedSubObjectId, objectCardId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedSubObjectId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedSubObjectId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedSubObjectId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Field.Text required size="small" sx={{ mb: 2 }} name="name" label={t('Name')} />
            <Field.DatePicker
              name="deadline"
              label={t('Deadline')}
              sx={{ mb: 2 }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <Field.Text size="small" sx={{ mb: 2 }} name="cost" label={t('Cost')} type="number" />
            <Field.Text
              size="small"
              sx={{ mb: 2 }}
              name="completion_percentage"
              label={t('Completion %')}
              type="number"
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
