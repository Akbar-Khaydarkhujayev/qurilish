import type { ButtonOwnProps } from '@mui/material';
import type { DialogProps } from '@mui/material/Dialog';

// ----------------------------------------------------------------------

export type ConfirmDialogProps = Omit<DialogProps, 'title' | 'content'> & {
  onClose: () => void;
  title: React.ReactNode;
  action: React.ReactNode;
  content?: React.ReactNode;
};

export type CustomConfirmDialogProps = {
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  trigger: React.ReactNode;
  cancelButtonProps?: ButtonOwnProps;
  confirmButtonProps?: ButtonOwnProps;
};
