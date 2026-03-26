import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';

import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Card,
  Chip,
  Alert,
  Button,
  TextField,
  CardHeader,
  IconButton,
  CardContent,
  Typography,
} from '@mui/material';

import { useTranslate } from 'src/locales';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

import { useGetStateCommission } from './api/get';
import { useSaveStateCommission } from './api/save';
import { useDeleteStateCommissionPdf } from './api/delete-pdf';

export default function StateCommissionView() {
  const { t } = useTranslate();
  const { id: objectCardId } = useParams();
  const { user } = useAuthContext();

  const { data, isLoading } = useGetStateCommission(objectCardId || '');
  const { mutate: save, isPending: isSaving } = useSaveStateCommission();
  const { mutate: deletePdf, isPending: isDeletingPdf } = useDeleteStateCommissionPdf();

  const commission = data?.data;

  const [documentNumber, setDocumentNumber] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [comment, setComment] = useState('');
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);

  useEffect(() => {
    if (commission) {
      setDocumentNumber(commission.document_number || '');
      setDocumentDate(commission.document_date ? commission.document_date.split('T')[0] : '');
      setComment(commission.comment || '');
    }
  }, [commission]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) setNewPdfFile(file);
  }, []);

  const handleDeleteNewFile = useCallback(() => {
    setNewPdfFile(null);
  }, []);

  const handleSave = () => {
    if (!objectCardId) return;

    save(
      {
        objectCardId,
        document_number: documentNumber || undefined,
        document_date: documentDate || undefined,
        comment: comment || undefined,
        pdf_file: newPdfFile || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('Saved successfully'));
          setNewPdfFile(null);
        },
      }
    );
  };

  const handleRemovePdf = () => {
    if (!objectCardId) return;
    deletePdf(objectCardId, {
      onSuccess: () => toast.success(t('PDF removed successfully')),
    });
  };

  const handlePreviewPdf = async () => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    try {
      const response = await fetch(
        `${baseUrl}/api/object-cards/${objectCardId}/state-commission/pdf/preview`,
        { headers: { Authorization: `Bearer ${user?.accessToken}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch {
      toast.error(t('Failed to preview file'));
    }
  };

  const handleDownloadPdf = () => {
    const baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    fetch(
      `${baseUrl}/api/object-cards/${objectCardId}/state-commission/pdf/download`,
      { headers: { Authorization: `Bearer ${user?.accessToken}` } }
    )
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = commission?.pdf_file_name || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => toast.error(t('Failed to download file')));
  };

  const isCompleted =
    !!commission?.document_number &&
    !!commission?.document_date &&
    !!commission?.comment &&
    !!commission?.pdf_file_path;

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader
        title={t('Гос. комиссия хулосаси')}
        action={
          isCompleted && (
            <Chip
              label={t('Completed')}
              color="success"
              icon={<Iconify icon="solar:check-circle-bold" />}
            />
          )
        }
      />
      <CardContent>
        {isCompleted && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {t('All fields are filled. Building status has been set to completed.')}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            fullWidth
            size="small"
            label={t('Хужжат раками')}
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            required
          />

          <TextField
            fullWidth
            size="small"
            type="date"
            label={t('Хужжат санаси')}
            value={documentDate}
            onChange={(e) => setDocumentDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            fullWidth
            size="small"
            label={t('Изох')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={3}
            required
          />

          {/* Existing PDF */}
          {commission?.pdf_file_path && !newPdfFile && (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="solar:document-bold" width={24} color="error.main" />
                <Typography variant="body2">{commission.pdf_file_name}</Typography>
              </Box>
              <Box display="flex" gap={0.5}>
                <IconButton size="small" color="info" onClick={handlePreviewPdf}>
                  <Iconify icon="solar:eye-bold" />
                </IconButton>
                <IconButton size="small" color="primary" onClick={handleDownloadPdf}>
                  <Iconify icon="solar:download-bold" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={handleRemovePdf}
                  disabled={isDeletingPdf}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Box>
            </Box>
          )}

          {/* New PDF upload */}
          {(!commission?.pdf_file_path || newPdfFile) && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('пдф файл')}
              </Typography>
              <Upload
                value={newPdfFile}
                onDrop={handleDrop}
                onDelete={handleDeleteNewFile}
                accept={{ 'application/pdf': ['.pdf'] }}
              />
            </Box>
          )}

          {/* Replace PDF button if PDF already exists */}
          {commission?.pdf_file_path && !newPdfFile && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="solar:upload-bold" />}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/pdf';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) setNewPdfFile(file);
                };
                input.click();
              }}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('Replace PDF')}
            </Button>
          )}

          <Box display="flex" justifyContent="flex-end" mt={1}>
            <LoadingButton
              variant="contained"
              color="primary"
              loading={isSaving}
              onClick={handleSave}
              startIcon={<Iconify icon="maktab:mingcute-save-2-fill" />}
            >
              {t('save')}
            </LoadingButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
