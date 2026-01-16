import type { RowItemProps } from 'src/types/global';

import dayjs from 'dayjs';
import { useState } from 'react';

import {
  Box,
  Button,
  Tooltip,
  Collapse,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { CustomConfirmDialog } from 'src/components/custom-dialog/custom-confirm-dialog';

import { useGetSubObjectItems } from '../items/api/get';
import { useDeleteSubObjectItem } from '../items/api/delete';
import { SubObjectItemDialog } from '../items/components/dialog';
import { SubObjectItemRowItem } from '../items/components/row-item';

import type { ISubObject } from '../api/get';

export const SubObjectRowItem = ({ row, remove, edit }: RowItemProps<ISubObject>) => {
  const { t } = useTranslate();
  const [expanded, setExpanded] = useState(false);
  const [editedItemId, setEditedItemId] = useState<string | undefined>(undefined);
  const openItemDialog = useBoolean();

  const { data: items } = useGetSubObjectItems(expanded ? row.id : undefined);
  const { mutate: deleteItem } = useDeleteSubObjectItem();

  return (
    <>
      <SubObjectItemDialog
        open={openItemDialog.value}
        onClose={openItemDialog.onFalse}
        editedItemId={editedItemId}
        subObjectCardId={row.id}
      />

      <TableRow hover sx={{ '& > *': { borderBottom: expanded ? 'unset' : undefined } }}>
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              <Iconify icon={expanded ? 'mdi:chevron-down' : 'mdi:chevron-right'} width={20} />
            </IconButton>
            {row.name || '-'}
          </Box>
        </TableCell>
        <TableCell>{row.deadline ? dayjs(row.deadline).format('DD.MM.YYYY') : '-'}</TableCell>
        <TableCell>{row.cost?.toLocaleString() || '-'}</TableCell>
        <TableCell>{row.completion_percentage ?? 0}%</TableCell>
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

      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0, border: expanded ? undefined : 'none' }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, pl: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box component="span" fontWeight="bold">
                  {t('Tasks')} ({items?.length || 0})
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setEditedItemId(undefined);
                    openItemDialog.onTrue();
                  }}
                  startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
                >
                  {t('add')}
                </Button>
              </Box>

              {items && items.length > 0 ? (
                <Box
                  component="table"
                  sx={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    '& td, & th': {
                      py: 1,
                      px: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    },
                  }}
                >
                  <TableBody>
                    {items.map((item) => (
                      <SubObjectItemRowItem
                        key={item.id}
                        row={item}
                        edit={() => {
                          setEditedItemId(String(item.id));
                          openItemDialog.onTrue();
                        }}
                        remove={() => deleteItem(item.id)}
                      />
                    ))}
                  </TableBody>
                </Box>
              ) : (
                <Box color="text.secondary" py={2}>
                  {t('No tasks yet')}
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
