import { useParams } from 'react-router';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableFooter from '@mui/material/TableFooter';

import { useBoolean } from 'src/hooks/use-boolean';

import { fNumber } from 'src/utils/format-number';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableHeadCustom } from 'src/components/table';

import { useDeleteEstimate } from './api/delete';
import { EstimateDialog } from './components/dialog';
import { EstimateRowItem } from './components/row-item';
import { useGetEstimatesByObjectCard } from './api/get';

const headLabels = ['Year', 'Contract', 'Year Total', 'Created at', ''];

export default function EstimatesView() {
  const { t } = useTranslate();
  const { id: objectCardId } = useParams();

  const [editedEstimateId, setEditedEstimateId] = useState<string | undefined>(undefined);
  const openEditDialog = useBoolean();

  const { mutate: deleteEstimate } = useDeleteEstimate();
  const { data } = useGetEstimatesByObjectCard(objectCardId || '');

  const totalAmount = useMemo(
    () => data?.reduce((sum, item) => sum + (item.year_total || 0), 0) || 0,
    [data]
  );

  return (
    <>
      <EstimateDialog
        onClose={openEditDialog.onFalse}
        open={openEditDialog.value}
        editedEstimateId={editedEstimateId}
        objectCardId={objectCardId || ''}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="flex-end" alignItems="start" mb={2}>
          <Button
            variant="contained"
            onClick={() => {
              setEditedEstimateId(undefined);
              openEditDialog.onTrue();
            }}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            color="primary"
          >
            {t('add')}
          </Button>
        </Box>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Scrollbar sx={{ height: 'calc(100vh - 340px)' }}>
            <Table size="small" stickyHeader>
              <TableHeadCustom
                headLabel={headLabels.map((label) => ({
                  id: label,
                  label: t(label),
                  align: label === '' ? 'right' : 'left',
                }))}
              />

              <TableBody>
                {data?.map((row) => (
                  <EstimateRowItem
                    key={row.id}
                    row={row}
                    edit={() => {
                      setEditedEstimateId(String(row.id));
                      openEditDialog.onTrue();
                    }}
                    remove={() => deleteEstimate(row.id)}
                  />
                ))}

                <TableNoData notFound={!data?.length} sx={{ height: 'calc(100vh - 370px)' }} />
              </TableBody>

              {data?.length ? (
                <TableFooter
                  sx={{
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        borderTop: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {t('Total')}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        borderTop: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {fNumber(totalAmount)}
                    </TableCell>
                    <TableCell
                      colSpan={2}
                      sx={{ borderTop: '2px solid', borderColor: 'divider' }}
                    />
                  </TableRow>
                </TableFooter>
              ) : null}
            </Table>
          </Scrollbar>
        </Box>
      </Box>
    </>
  );
}
