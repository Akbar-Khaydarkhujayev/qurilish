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
import { useEditConstructionItem } from '../api/edit';
import { useCreateConstructionItem } from '../api/create';
import { useGetConstructionItemById } from '../api/get-by-id';

import type { FormFields } from '../api/schema';

const defaultValues = {
  id: undefined,
  name: '',
};

interface IProps {
  open: boolean;
  onClose: () => void;
  editedConstructionItemId: string | undefined;
}

export const ConstructionItemDialog = ({ open, onClose, editedConstructionItemId }: IProps) => {
  const { t } = useTranslate();

  const { data: constructionItem } = useGetConstructionItemById(editedConstructionItemId);
  const { mutate: edit } = useEditConstructionItem(constructionItem?.data.id);
  const { mutate: create } = useCreateConstructionItem();

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: constructionItem?.data.id || undefined,
      name: constructionItem?.data.name || '',
    });
  }, [constructionItem, methods, open, editedConstructionItemId]);

  const onYearSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedConstructionItemId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(
            t(editedConstructionItemId ? 'Edited successfully' : 'Created successfully')
          );
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">
        {editedConstructionItemId ? t('edit') : t('add')}
      </DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onYearSubmit}>
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
