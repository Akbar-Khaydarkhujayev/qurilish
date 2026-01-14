import type { RowItemProps } from 'src/types/global';

import dayjs from 'dayjs';

import { Box, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { CustomConfirmDialog } from 'src/components/custom-dialog/custom-confirm-dialog';

import type { IConstructionItem } from '../api/get';

export const ConstructionItemRowItem = ({ row, remove, edit }: RowItemProps<IConstructionItem>) => {
  const { t } = useTranslate();

  return (
    <TableRow hover>
      <TableCell>{row.name || '-'}</TableCell>
      <TableCell>{dayjs(row.created_at).format('DD.MM.YYYY') || '-'}</TableCell>

      <TableCell align="right">
        <Box display="flex" justifyContent="end">
          {edit && (
            <Tooltip title={t('Edit')}>
              <IconButton onClick={edit}>
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          )}
          {remove && (
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
