import dayjs from 'dayjs';

import { Box, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { CustomConfirmDialog } from 'src/components/custom-dialog/custom-confirm-dialog';

import type { ISubObjectItem } from '../api/get';

interface IProps {
  row: ISubObjectItem;
  edit: () => void;
  remove: () => void;
}

export const SubObjectItemRowItem = ({ row, remove, edit }: IProps) => {
  const { t } = useTranslate();

  return (
    <TableRow hover sx={{ bgcolor: 'action.hover' }}>
      <TableCell sx={{ pl: 4 }}>{row.item_name || '-'}</TableCell>
      <TableCell>{row.deadline ? dayjs(row.deadline).format('DD.MM.YYYY') : '-'}</TableCell>
      <TableCell>{row.cost?.toLocaleString() || '-'}</TableCell>
      <TableCell>{row.completion_percentage ?? 0}%</TableCell>
      <TableCell>{dayjs(row.created_at).format('DD.MM.YYYY') || '-'}</TableCell>

      <TableCell align="right">
        <Box display="flex" justifyContent="end">
          <Tooltip title={t('Edit')}>
            <IconButton size="small" onClick={edit}>
              <Iconify icon="solar:pen-bold" width={18} />
            </IconButton>
          </Tooltip>
          <CustomConfirmDialog
            onConfirm={remove}
            title={t('Delete')}
            subtitle={t('Are you sure you want to delete?')}
            trigger={
              <Tooltip title={t('Delete')}>
                <IconButton size="small" color="error">
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </IconButton>
              </Tooltip>
            }
          />
        </Box>
      </TableCell>
    </TableRow>
  );
};
