import type { Theme, SxProps } from '@mui/material/styles';
import type { TablePaginationProps } from '@mui/material/TablePagination';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';
import FormControlLabel from '@mui/material/FormControlLabel';

import { usePagination } from 'src/hooks/use-pagination';

// ----------------------------------------------------------------------

export type TablePaginationCustomProps = Omit<
  TablePaginationProps,
  'onPageChange' | 'page' | 'rowsPerPage'
> & {
  dense?: boolean;
  sx?: SxProps<Theme>;
  paramLimitName?: string;
  paramPageName?: string;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TablePaginationCustom({
  sx,
  dense,
  onChangeDense,
  paramLimitName = 'limit',
  paramPageName = 'page',
  rowsPerPageOptions = [15, 25, 50, 100],
  ...other
}: TablePaginationCustomProps) {
  const { page, limit, setLimit, setPage, resetPagination } = usePagination({
    paramLimitName,
    paramPageName,
  });

  useEffect(() => {
    if (other.count > 0 && page > Math.ceil(other.count / limit)) resetPagination();
  }, [limit, other.count, page, resetPagination]);

  return (
    <Box sx={{ position: 'relative', width: 1, ...sx }}>
      <TablePagination
        defaultValue={15}
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        page={page - 1}
        rowsPerPage={limit}
        onPageChange={(_, newPage) => setPage(newPage + 1)}
        onRowsPerPageChange={(event) => setLimit(event.target.value)}
        {...other}
      />

      {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={<Switch name="dense" checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: { sm: 'absolute' },
          }}
        />
      )}
    </Box>
  );
}
