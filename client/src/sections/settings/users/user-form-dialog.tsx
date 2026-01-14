import type { User, UserRole } from 'src/types/construction';

import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  editingItem: User | null;
  onSave: (data: User) => void;
};

type FormValues = {
  name: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  organizationId: number;
  regionId: number;
  role: UserRole;
};

// Mock data
const MOCK_ORGANIZATIONS = [
  { id: 1, name: "O'zbekiston Qurilish Vazirligi" },
  { id: 2, name: 'Toshkent Shahar Qurilish Boshqarmasi' },
  { id: 3, name: 'Samarqand Viloyat Qurilish Boshqarmasi' },
];

const MOCK_REGIONS = [
  { id: 1, name: 'Toshkent shahri' },
  { id: 2, name: 'Toshkent viloyati' },
  { id: 3, name: 'Andijon' },
  { id: 4, name: 'Buxoro' },
  { id: 5, name: "Farg'ona" },
];

const ROLES: UserRole[] = ['super_admin', 'region_admin', 'user'];

export function UserFormDialog({ open, onClose, editingItem, onSave }: Props) {
  const { t } = useTranslate();

  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      organizationId: 0,
      regionId: 0,
      role: 'user',
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
        username: editingItem.username,
        email: editingItem.email || '',
        firstName: editingItem.firstName || '',
        lastName: editingItem.lastName || '',
        password: '',
        organizationId: editingItem.organizationId,
        regionId: editingItem.regionId || 0,
        role: editingItem.role,
      });
    } else {
      reset({
        name: '',
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        organizationId: 0,
        regionId: 0,
        role: 'user',
      });
    }
  }, [editingItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const selectedOrganization = MOCK_ORGANIZATIONS.find((o) => o.id === data.organizationId);
      const selectedRegion = MOCK_REGIONS.find((r) => r.id === data.regionId);
      const item: User = {
        id: editingItem?.id || Date.now(),
        name: data.name,
        username: data.username,
        email: data.email || undefined,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        organizationId: data.organizationId,
        organizationName: selectedOrganization?.name || '',
        regionId: data.regionId || undefined,
        regionName: selectedRegion?.name || '',
        role: data.role,
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
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Field.Text name="name" label={t('fullName')} required InputLabelProps={{ shrink: true }} />

            <Field.Text name="username" label={t('username')} required InputLabelProps={{ shrink: true }} />

            <Field.Text name="email" label={t('email')} type="email" InputLabelProps={{ shrink: true }} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Field.Text name="firstName" label={t('firstName')} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
              <Field.Text name="lastName" label={t('lastName')} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} />
            </Box>

            {!editingItem && (
              <Field.Text
                name="password"
                label={t('password')}
                type="password"
                required
                InputLabelProps={{ shrink: true }}
              />
            )}

            <Field.Select
              name="organizationId"
              label={t('organizations')}
              required
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value={0} disabled>
                {t('select')}
              </MenuItem>
              {MOCK_ORGANIZATIONS.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select
              name="regionId"
              label={t('regions')}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value={0}>
                {t('select')}
              </MenuItem>
              {MOCK_REGIONS.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select
              name="role"
              label={t('role')}
              required
              InputLabelProps={{ shrink: true }}
            >
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {t(role)}
                </MenuItem>
              ))}
            </Field.Select>
          </Box>
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
