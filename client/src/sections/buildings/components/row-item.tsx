import type { RowItemProps } from 'src/types/global';

import dayjs from 'dayjs';

import { Box, Chip, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { CustomConfirmDialog } from 'src/components/custom-dialog/custom-confirm-dialog';

import type { IBuilding } from '../api/get';

export const BuildingRowItem = ({ row, remove, edit, click }: RowItemProps<IBuilding>) => {
  const { t } = useTranslate();

  return (
    <TableRow hover onClick={click} sx={{ cursor: click ? 'pointer' : 'default' }}>
      <TableCell>{row.card_number || '-'}</TableCell>
      <TableCell>{row.object_name || '-'}</TableCell>
      <TableCell>{row.region_name || '-'}</TableCell>
      <TableCell>{row.district_name || '-'}</TableCell>
      <TableCell>{row.contractor_name || '-'}</TableCell>
      <TableCell>
        <Chip label={row.status_name || '-'} size="small" color="primary" variant="soft" />
      </TableCell>
      <TableCell>{dayjs(row.created_at).format('DD.MM.YYYY') || '-'}</TableCell>

      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
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
