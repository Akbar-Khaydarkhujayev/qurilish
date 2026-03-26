import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, DialogTitle, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useCreateCamera } from '../api/create';
import { useEditCamera } from '../api/edit';
import { formSchema } from '../api/schema';

import type { ICamera } from '../api/get';
import type { FormFields } from '../api/schema';

interface IProps {
  open: boolean;
  onClose: () => void;
  objectCardId: string;
  editedCamera?: ICamera;
}

export const CameraDialog = ({ open, onClose, objectCardId, editedCamera }: IProps) => {
  const { t } = useTranslate();
  const { mutate: create } = useCreateCamera(objectCardId);
  const { mutate: edit } = useEditCamera(objectCardId);

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', camera_ip: '', camera_login: '', camera_password: '' },
  });

  useEffect(() => {
    if (!open) return;
    methods.reset({
      id: editedCamera?.id,
      name: editedCamera?.name || '',
      camera_ip: editedCamera?.camera_ip || '',
      camera_login: editedCamera?.camera_login || '',
      camera_password: '',
    });
  }, [open, editedCamera, methods]);

  const onSubmit = methods.handleSubmit(
    (data) => {
      const mutate = editedCamera ? edit : create;
      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedCamera ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedCamera ? t('edit') : t('add')}</DialogTitle>
      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1} display="flex" flexDirection="column" gap={2}>
            <Field.Text required size="small" name="name" label={t('Camera Name')} />
            <Field.Text required size="small" name="camera_ip" label={t('Camera IP')} />
            <Field.Text required size="small" name="camera_login" label={t('Camera Login')} />
            <Field.Text
              size="small"
              name="camera_password"
              label={t(editedCamera ? 'New Password (leave blank to keep)' : 'Camera Password')}
              type="password"
              required={!editedCamera}
            />

            <Box display="flex" justifyContent="flex-end" gap={1} mb={1}>
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
