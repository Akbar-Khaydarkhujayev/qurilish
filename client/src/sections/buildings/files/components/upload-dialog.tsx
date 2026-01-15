import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, DialogTitle, DialogContent } from '@mui/material';

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
    onClose();
  };

  const handleUpload = () => {
    if (!file || !objectCardId) return;

    setUploading(true);
    uploadFile(
      { object_card_id: Number(objectCardId), file },
      {
        onSuccess: () => {
          toast.success(t('File uploaded successfully'));
          setUploading(false);
          setFile(null);
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
              'application/*': [],
              'image/*': [],
              'text/*': [],
              'video/*': [],
              'audio/*': [],
            }}
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
