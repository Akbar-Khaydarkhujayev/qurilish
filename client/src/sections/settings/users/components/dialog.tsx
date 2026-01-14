import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, MenuItem, DialogTitle, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useEditUser } from '../api/edit';
import { formSchema } from '../api/schema';
import { useCreateUser } from '../api/create';
import { useGetUserById } from '../api/get-by-id';
import { useGetOrganizations } from '../../organizations/api/get';

import type { UserRole } from '../api/get';
import type { FormFields } from '../api/schema';

const defaultValues: FormFields = {
  id: undefined,
  name: '',
  username: '',
  password: '',
  organization_id: undefined as unknown as number,
  role: 'user',
};

const ROLES: UserRole[] = ['super_admin', 'region_admin', 'user'];

interface IProps {
  open: boolean;
  onClose: () => void;
  editedUserId: string | undefined;
}

export const UserDialog = ({ open, onClose, editedUserId }: IProps) => {
  const { t } = useTranslate();

  const { data: user } = useGetUserById(editedUserId);
  const { data: organizationsData } = useGetOrganizations({ page: 1, limit: 100 });
  const { mutate: edit } = useEditUser();
  const { mutate: create } = useCreateUser();

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    methods.reset({
      id: user?.data.id || undefined,
      name: user?.data.name || '',
      username: user?.data.username || '',
      password: '',
      organization_id: user?.data.organization_id || undefined,
      role: user?.data.role || 'user',
    });
  }, [user, methods, open, editedUserId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedUserId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedUserId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center">{editedUserId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Field.Text required size="small" sx={{ mb: 2 }} name="name" label={t('Full Name')} />
            <Field.Text
              required
              size="small"
              sx={{ mb: 2 }}
              name="username"
              label={t('Username')}
              disabled={!!editedUserId}
            />

            {!editedUserId && (
              <Field.Text
                required
                size="small"
                sx={{ mb: 2 }}
                name="password"
                label={t('Password')}
                type="password"
              />
            )}

            <Field.Select
              required
              size="small"
              sx={{ mb: 2 }}
              name="organization_id"
              label={t('Organization')}
            >
              {organizationsData?.data.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select required size="small" sx={{ mb: 2 }} name="role" label={t('Role')}>
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {t(role)}
                </MenuItem>
              ))}
            </Field.Select>

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
