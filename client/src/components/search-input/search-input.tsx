import type { TextFieldProps } from '@mui/material';

import { TextField, InputAdornment } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

export function SearchInput(props: TextFieldProps) {
  const { t } = useTranslate();
  const { value, onChange } = props;

  return (
    <TextField
      size="small"
      placeholder={t('Search...')}
      {...props}
      InputProps={{
        endAdornment: value ? (
          <InputAdornment
            position="end"
            sx={{ cursor: 'pointer' }}
            onClick={() =>
              onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
            }
          >
            <Iconify icon="maktab:mingcute-close-line" color="error.main" />
          </InputAdornment>
        ) : (
          <InputAdornment position="end">
            <Iconify icon="maktab:eva-search-fill" color="primary.main" />
          </InputAdornment>
        ),
      }}
    />
  );
}
