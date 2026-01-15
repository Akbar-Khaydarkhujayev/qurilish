import type { RowItemProps } from 'src/types/global';

import dayjs from 'dayjs';
import { toast } from 'sonner';

import { Box, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { CustomConfirmDialog } from 'src/components/custom-dialog/custom-confirm-dialog';

import type { IFile } from '../api/get';

export const FileRowItem = ({ row, remove }: RowItemProps<IFile>) => {
  const { t } = useTranslate();

  const handleDownload = () => {
    const token = localStorage.getItem('accessToken');
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

    fetch(`${baseUrl}/api/files/${row.id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = row.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => {
        toast.error(t('Failed to download file'));
      });
  };

  return (
    <TableRow hover>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon="solar:file-bold" width={20} />
          {row.file_name || '-'}
        </Box>
      </TableCell>
      <TableCell>{dayjs(row.created_at).format('DD.MM.YYYY HH:mm') || '-'}</TableCell>

      <TableCell align="right">
        <Box display="flex" justifyContent="end">
          <Tooltip title={t('Download')}>
            <IconButton color="primary" onClick={handleDownload}>
              <Iconify icon="solar:download-bold" />
            </IconButton>
          </Tooltip>
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
