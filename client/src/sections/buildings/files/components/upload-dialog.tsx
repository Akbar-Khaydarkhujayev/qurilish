import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, TextField, DialogTitle, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';

import { useUploadFile } from '../api/create';

interface IProps {
  open: boolean;
  onClose: () => void;
  objectCardId: string;
}

export const FileUploadDialog = ({ open, onClose, objectCardId }: IProps) => {
  const { t } = useTranslate();

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const { mutate: uploadFile } = useUploadFile();

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      setFile(newFile);
    }
  }, []);

  const handleDelete = useCallback(() => {
    setFile(null);
  }, []);

  const handleClose = () => {
    setFile(null);
    setDescription('');
    onClose();
  };

  const handleUpload = () => {
    if (!file || !objectCardId) return;

    setUploading(true);
    uploadFile(
      { object_card_id: Number(objectCardId), file, description: description || undefined },
      {
        onSuccess: () => {
          toast.success(t('File uploaded successfully'));
          setUploading(false);
          setFile(null);
          setDescription('');
          onClose();
        },
        onError: () => {
          toast.error(t('Failed to upload file'));
          setUploading(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle textAlign="center">{t('Upload File')}</DialogTitle>

      <DialogContent>
        <Box pt={1}>
          <Upload
            value={file}
            onDrop={handleDrop}
            onDelete={handleDelete}
            accept={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'],
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'application/vnd.ms-excel': ['.xls'],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
              'application/vnd.ms-powerpoint': ['.ppt'],
              'application/vnd.openxmlformats-officedocument.presentationml.presentation': [
                '.pptx',
              ],
              'text/plain': ['.txt'],
              'text/csv': ['.csv'],
              'application/zip': ['.zip'],
              'application/x-rar-compressed': ['.rar'],
              'application/x-7z-compressed': ['.7z'],
            }}
          />

          <TextField
            fullWidth
            size="small"
            label={t('Description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mt: 2 }}
          />

          <Box display="flex" justifyContent="flex-end" gap={1} mt={3} mb={1}>
            <Button
              variant="contained"
              color="error"
              onClick={handleClose}
              startIcon={<Iconify icon="maktab:mingcute-close-fill" />}
            >
              {t('cancel')}
            </Button>

            <LoadingButton
              variant="contained"
              color="primary"
              loading={uploading}
              disabled={!file}
              onClick={handleUpload}
              startIcon={<Iconify icon="solar:upload-bold" />}
            >
              {t('Upload')}
            </LoadingButton>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
