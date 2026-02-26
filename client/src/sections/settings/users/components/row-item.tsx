import dayjs from 'dayjs';

import { Box, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomConfirmDialog } from 'src/components/custom-dialog/custom-confirm-dialog';

import type { IUser } from '../api/get';

const getRoleColor = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'error';
    case 'region_admin':
      return 'warning';
    default:
      return 'info';
  }
};

// Check if currentUser can manage targetUser based on role hierarchy
// super_admin can only manage region_admin
// region_admin can only manage user
// user cannot manage anyone
const canManageUser = (currentUserRole?: string, targetUserRole?: string): boolean => {
  if (!currentUserRole || !targetUserRole) return false;

  if (currentUserRole === 'super_admin' && targetUserRole === 'region_admin') {
    return true;
  }

  if (currentUserRole === 'region_admin' && targetUserRole === 'user') {
    return true;
  }

  return false;
};

interface UserRowItemProps {
  row: IUser;
  currentUserRole?: string;
  edit?: () => void;
  remove?: () => void;
}

export const UserRowItem = ({ row, currentUserRole, remove, edit }: UserRowItemProps) => {
  const { t } = useTranslate();

  const canManage = canManageUser(currentUserRole, row.role);

  return (
    <TableRow hover>
      <TableCell>{row.name || '-'}</TableCell>
      <TableCell>{row.username || '-'}</TableCell>
      <TableCell>{row.phone_number || '-'}</TableCell>
      <TableCell>{row.organization?.name || '-'}</TableCell>
      <TableCell>
        <Label color={getRoleColor(row.role)}>{t(row.role)}</Label>
      </TableCell>
      <TableCell>{dayjs(row.created_at).format('DD.MM.YYYY') || '-'}</TableCell>

      <TableCell align="right">
        <Box display="flex" justifyContent="end">
          {edit && canManage && (
            <Tooltip title={t('Edit')}>
              <IconButton onClick={edit}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          )}
          {remove && canManage && (
            <CustomConfirmDialog
              onConfirm={remove}
              title={t('Delete')}
              subtitle={t('Are you sure you want to delete?')}
              trigger={
                <Tooltip title={t('Delete')}>
                  <IconButton color="error">
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};
