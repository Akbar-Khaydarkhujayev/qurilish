import type { RowItemProps } from 'src/types/global';

import dayjs from 'dayjs';
import { toast } from 'sonner';

import { Box, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { CustomConfirmDialog } from 'src/components/custom-dialog/custom-confirm-dialog';

import { useAuthContext } from 'src/auth/hooks';

import type { IFile } from '../api/get';

// Check if file can be previewed in browser
const isPreviewable = (fileName: string): boolean => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'txt'];
  return previewableExtensions.includes(ext);
};

// Get file icon based on extension
const getFileIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const iconMap: { [key: string]: string } = {
    pdf: 'solar:document-bold',
    jpg: 'solar:gallery-bold',
    jpeg: 'solar:gallery-bold',
    png: 'solar:gallery-bold',
    gif: 'solar:gallery-bold',
    bmp: 'solar:gallery-bold',
    webp: 'solar:gallery-bold',
    svg: 'solar:gallery-bold',
    doc: 'solar:document-text-bold',
    docx: 'solar:document-text-bold',
    xls: 'solar:chart-square-bold',
    xlsx: 'solar:chart-square-bold',
    ppt: 'solar:presentation-graph-bold',
    pptx: 'solar:presentation-graph-bold',
    txt: 'solar:notes-bold',
    csv: 'solar:chart-square-bold',
    zip: 'solar:archive-bold',
    rar: 'solar:archive-bold',
    '7z': 'solar:archive-bold',
  };
  return iconMap[ext] || 'solar:file-bold';
};

export const FileRowItem = ({ row, remove }: RowItemProps<IFile>) => {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  console.log(user);
  const canPreview = isPreviewable(row.file_name);
  const fileIcon = getFileIcon(row.file_name);

  const handleDownload = () => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

    fetch(`${baseUrl}/api/files/${row.id}/download`, {
      headers: {
        Authorization: `Bearer ${user?.accessToken}`,
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

  const handlePreview = async () => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${baseUrl}/api/files/${row.id}/preview`, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      const blob = await response.blob();
      const ext = row.file_name.split('.').pop()?.toLowerCase() || '';

      // Get proper MIME type for the blob
      const mimeTypes: { [key: string]: string } = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        bmp: 'image/bmp',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        txt: 'text/plain',
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      const typedBlob = new Blob([blob], { type: mimeType });
      const url = window.URL.createObjectURL(typedBlob);

      // Open in new window
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        if (ext === 'pdf') {
          previewWindow.location.href = url;
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
          previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${row.file_name}</title>
                <style>
                  body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a1a; }
                  img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                </style>
              </head>
              <body>
                <img src="${url}" alt="${row.file_name}" />
              </body>
            </html>
          `);
        } else if (ext === 'txt') {
          const text = await blob.text();
          previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${row.file_name}</title>
                <style>
                  body { margin: 20px; font-family: monospace; white-space: pre-wrap; background: #fff; color: #333; }
                </style>
              </head>
              <body>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
            </html>
          `);
        }
      }
    } catch {
      toast.error(t('Failed to preview file'));
    }
  };

  return (
    <TableRow hover>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Iconify icon={fileIcon} width={20} />
          {row.file_name || '-'}
        </Box>
      </TableCell>
      <TableCell>{row.description || '-'}</TableCell>
      <TableCell>{dayjs(row.created_at).format('DD.MM.YYYY HH:mm') || '-'}</TableCell>

      <TableCell align="right">
        <Box display="flex" justifyContent="end">
          {canPreview && (
            <Tooltip title={t('Preview')}>
              <IconButton color="info" onClick={handlePreview}>
                <Iconify icon="solar:eye-bold" />
              </IconButton>
            </Tooltip>
          )}
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
