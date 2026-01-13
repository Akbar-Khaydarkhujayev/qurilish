import type { ConstructionItem } from 'src/types/construction';

import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useLocalization } from 'src/locales/use-localization';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  editingItem: ConstructionItem | null;
  onSave: (data: ConstructionItem) => void;
};

type FormValues = {
  name: string;
};

export function ConstructionItemFormDialog({ open, onClose, editingItem, onSave }: Props) {
  const { t } = useLocalization();

  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (editingItem) {
      reset({ name: editingItem.name });
    } else {
      reset({ name: '' });
    }
  }, [editingItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const item: ConstructionItem = {
        id: editingItem?.id || Date.now(), // temporary ID for demo
        name: data.name,
      };
      onSave(item);
      reset();
    } catch (error) {
      console.error(error);
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{editingItem ? t('common.edit') : t('common.add')}</DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Field.Text
              name="name"
              label={t('common.name')}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('common.save')}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
