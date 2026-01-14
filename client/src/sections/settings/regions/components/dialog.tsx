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
import { useEditRegion } from '../api/edit';
import { useCreateRegion } from '../api/create';
import { useGetRegionById } from '../api/get-by-id';

import type { FormFields } from '../api/schema';

const defaultValues = {
  id: undefined,
  name: '',
};

interface IProps {
  open: boolean;
  onClose: () => void;
  editedRegionId: string | undefined;
}

export const RegionDialog = ({ open, onClose, editedRegionId }: IProps) => {
  const { t } = useTranslate();

  const { data: region } = useGetRegionById(editedRegionId);
  const { mutate: edit } = useEditRegion();
  const { mutate: create } = useCreateRegion();

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: region?.data.id || undefined,
      name: region?.data.name || '',
    });
  }, [region, methods, open, editedRegionId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedRegionId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedRegionId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedRegionId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Field.Text required size="small" sx={{ mb: 2 }} name="name" label={t('name')} />

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
