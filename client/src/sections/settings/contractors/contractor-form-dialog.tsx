import type { Contractor } from 'src/types/construction';

import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';

import { Form } from 'src/components/hook-form';

import { OrganizationFormFields } from '../_shared/organization-form-fields';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  editingItem: Contractor | null;
  onSave: (data: Contractor) => void;
};

type FormValues = {
  name: string;
  taxId: string;
  address: string;
  phoneNumber: string;
  mfo: string;
};

export function ContractorFormDialog({ open, onClose, editingItem, onSave }: Props) {
  const { t } = useTranslate();

  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
      taxId: '',
      address: '',
      phoneNumber: '',
      mfo: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name,
        taxId: editingItem.taxId || '',
        address: editingItem.address || '',
        phoneNumber: editingItem.phoneNumber || '',
        mfo: editingItem.mfo || '',
      });
    } else {
      reset({
        name: '',
        taxId: '',
        address: '',
        phoneNumber: '',
        mfo: '',
      });
    }
  }, [editingItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const item: Contractor = {
        id: editingItem?.id || Date.now(),
        name: data.name,
        taxId: data.taxId || undefined,
        address: data.address || undefined,
        phoneNumber: data.phoneNumber || undefined,
        mfo: data.mfo || undefined,
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
        <DialogTitle>{editingItem ? t('edit') : t('add')}</DialogTitle>

        <DialogContent>
          <OrganizationFormFields />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            {t('save')}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
