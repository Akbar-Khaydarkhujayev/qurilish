import { useState } from 'react';
import { useParams } from 'react-router';

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

import { useDeleteInvoice } from './api/delete';
import { InvoiceDialog } from './components/dialog';
import { InvoiceRowItem } from './components/row-item';
import { useGetInvoicesByObjectCard } from './api/get';

const headLabels = [
  'Document Number',
  'Document Date',
  'Amount',
  'Contract',
  'Description',
  'Created at',
  '',
];

export default function InvoicesView() {
  const { t } = useTranslate();
  const { id: objectCardId } = useParams();

  const [editedInvoiceId, setEditedInvoiceId] = useState<string | undefined>(undefined);
  const openEditDialog = useBoolean();

  const { mutate: deleteInvoice } = useDeleteInvoice();
  const { data } = useGetInvoicesByObjectCard(objectCardId || '');

  return (
    <>
      <InvoiceDialog
        onClose={openEditDialog.onFalse}
        open={openEditDialog.value}
        editedInvoiceId={editedInvoiceId}
        objectCardId={objectCardId || ''}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="flex-end" alignItems="start" mb={2}>
          <Button
            variant="contained"
            onClick={() => {
              setEditedInvoiceId(undefined);
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
                {data?.invoices?.map((row) => (
                  <InvoiceRowItem
                    key={row.id}
                    row={row}
                    edit={() => {
                      setEditedInvoiceId(String(row.id));
                      openEditDialog.onTrue();
                    }}
                    remove={() => deleteInvoice(row.id)}
                  />
                ))}

                <TableNoData
                  notFound={!data?.invoices?.length}
                  sx={{ height: 'calc(100vh - 370px)' }}
                />
              </TableBody>

              {data?.invoices?.length ? (
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
                      {fNumber(data?.totalAmount || 0)}
                    </TableCell>
                    <TableCell
                      colSpan={4}
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
