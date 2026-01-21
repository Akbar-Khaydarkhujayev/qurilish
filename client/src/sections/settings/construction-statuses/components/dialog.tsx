import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, Typography, DialogTitle, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { formSchema } from '../api/schema';
import { useEditConstructionStatus } from '../api/edit';
import { useGetConstructionStatuses } from '../api/get';
import { useCreateConstructionStatus } from '../api/create';
import { useGetConstructionStatusById } from '../api/get-by-id';

import type { FormFields } from '../api/schema';

const defaultValues = {
  id: undefined,
  name: '',
  sequence: 1,
};

interface IProps {
  open: boolean;
  onClose: () => void;
  editedConstructionStatusId: string | undefined;
}

export const ConstructionStatusDialog = ({ open, onClose, editedConstructionStatusId }: IProps) => {
  const { t } = useTranslate();

  const { data: constructionStatus } = useGetConstructionStatusById(editedConstructionStatusId);
  const { data: allStatuses } = useGetConstructionStatuses({ page: 1, limit: 999 });
  const { mutate: edit } = useEditConstructionStatus();
  const { mutate: create } = useCreateConstructionStatus();

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchedName = methods.watch('name');
  const watchedSequence = methods.watch('sequence');

  // Calculate next sequence for new status
  const nextSequence = useMemo(() => {
    if (!allStatuses?.data) return 1;
    const maxSeq = Math.max(...allStatuses.data.map((s) => s.sequence), 0);
    return maxSeq + 1;
  }, [allStatuses]);

  useEffect(() => {
    if (!open) return;

    if (editedConstructionStatusId && constructionStatus?.data) {
      methods.reset({
        id: constructionStatus.data.id,
        name: constructionStatus.data.name,
        sequence: constructionStatus.data.sequence,
      });
    } else {
      methods.reset({
        id: undefined,
        name: '',
        sequence: nextSequence,
      });
    }
  }, [constructionStatus, methods, open, editedConstructionStatusId, nextSequence]);

  // Build preview statuses list
  const previewStatuses = useMemo(() => {
    if (!allStatuses?.data)
      return [{ id: 0, name: watchedName || t('New Status'), sequence: watchedSequence }];

    let statuses = [...allStatuses.data];

    if (editedConstructionStatusId) {
      // Update existing status in preview
      statuses = statuses.map((s) =>
        s.id === Number(editedConstructionStatusId)
          ? { ...s, name: watchedName || s.name, sequence: watchedSequence }
          : s
      );
    } else {
      // Add new status to preview
      statuses.push({
        id: 0,
        name: watchedName || t('New Status'),
        sequence: watchedSequence,
        created_at: '',
        updated_at: '',
      });
    }

    return statuses.sort((a, b) => a.sequence - b.sequence);
  }, [allStatuses, editedConstructionStatusId, watchedName, watchedSequence, t]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedConstructionStatusId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(
            t(editedConstructionStatusId ? 'Edited successfully' : 'Created successfully')
          );
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle textAlign="center">
        {editedConstructionStatusId ? t('edit') : t('add')}
      </DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1}>
            <Box display="flex" gap={2} mb={2}>
              <Field.Text required size="small" name="name" label={t('name')} sx={{ flex: 2 }} />
              <Field.Text
                required
                size="small"
                name="sequence"
                label={t('Tartib raqami')}
                type="number"
                sx={{ flex: 1 }}
                inputProps={{ min: 1 }}
              />
            </Box>

            {/* Stepper Preview */}
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1.5, display: 'block' }}
              >
                {t("Stepper ko'rinishi")}:
              </Typography>
              <Stepper activeStep={-1} alternativeLabel>
                {previewStatuses.map((status) => (
                  <Step
                    key={status.id || `new-${status.sequence}`}
                    completed={false}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight:
                          (editedConstructionStatusId &&
                            status.id === Number(editedConstructionStatusId)) ||
                          (!editedConstructionStatusId && status.id === 0)
                            ? 700
                            : 400,
                        color:
                          (editedConstructionStatusId &&
                            status.id === Number(editedConstructionStatusId)) ||
                          (!editedConstructionStatusId && status.id === 0)
                            ? 'primary.main'
                            : 'text.secondary',
                      },
                    }}
                  >
                    <StepLabel>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: 'block' }}
                        >
                          #{status.sequence}
                        </Typography>
                        {status.name || '-'}
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={1} mb={3}>
              <Button
                variant="contained"
                color="error"
                onClick={onClose}
                startIcon={<Iconify icon="maktab:mingcute-close-fill" />}
              >
                {t('cancel')}
              </Button>

              <LoadingButton
                type="submit"
                variant="contained"
                color="primary"
                loading={methods.formState.isSubmitting}
                startIcon={<Iconify icon="maktab:mingcute-save-2-fill" />}
              >
                {t('save')}
              </LoadingButton>
            </Box>
          </Box>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
