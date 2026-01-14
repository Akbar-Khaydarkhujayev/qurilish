import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { Box, DialogContent } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';

import { Iconify } from '../iconify';

import type { CustomConfirmDialogProps } from './types';

// ----------------------------------------------------------------------

export function CustomConfirmDialog({
  title,
  trigger,
  subtitle,
  confirmButtonProps,
  cancelButtonProps,
  onConfirm,
  ...other
}: CustomConfirmDialogProps) {
  const open = useBoolean();
  const { t } = useTranslate();

  return (
    <>
      <Box onClick={open.onTrue}>{trigger}</Box>

      <Dialog fullWidth maxWidth="xs" {...other} open={open.value} onClose={open.onFalse}>
        <DialogTitle textAlign="center">{t(title)}</DialogTitle>

        {subtitle && (
          <DialogContent sx={{ typography: 'body2', textAlign: 'center' }}>
            {t(subtitle)}
          </DialogContent>
        )}
        <DialogActions
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={open.onFalse}
            startIcon={<Iconify icon="maktab:mingcute-close-fill" />}
            {...cancelButtonProps}
          >
            {t('Cancel')}
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onConfirm();
              open.onFalse();
            }}
            startIcon={<Iconify icon="maktab:solar-trash-bin-trash-bold" />}
            {...confirmButtonProps}
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
