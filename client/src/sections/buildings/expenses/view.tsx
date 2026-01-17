import { useState } from 'react';
import { useParams } from 'react-router';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableHeadCustom } from 'src/components/table';

import { useDeleteExpense } from './api/delete';
import { ExpenseDialog } from './components/dialog';
import { ExpenseRowItem } from './components/row-item';
import { useGetExpensesByObjectCard } from './api/get';

const headLabels = [
  'Registry Number',
  'Registry Date',
  'Amount',
  'Contract',
  'Description',
  'Created at',
  '',
];

export default function ExpensesView() {
  const { t } = useTranslate();
  const { id: objectCardId } = useParams();

  const [editedExpenseId, setEditedExpenseId] = useState<string | undefined>(undefined);
  const openEditDialog = useBoolean();

  const { mutate: deleteExpense } = useDeleteExpense();
  const { data } = useGetExpensesByObjectCard(objectCardId || '');

  return (
    <>
      <ExpenseDialog
        onClose={openEditDialog.onFalse}
        open={openEditDialog.value}
        editedExpenseId={editedExpenseId}
        objectCardId={objectCardId || ''}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="flex-end" alignItems="start" mb={2}>
          <Button
            variant="contained"
            onClick={() => {
              setEditedExpenseId(undefined);
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
                {data?.expenses?.map((row) => (
                  <ExpenseRowItem
                    key={row.id}
                    row={row}
                    edit={() => {
                      setEditedExpenseId(String(row.id));
                      openEditDialog.onTrue();
                    }}
                    remove={() => deleteExpense(row.id)}
                  />
                ))}

                <TableNoData
                  notFound={!data?.expenses?.length}
                  sx={{ height: 'calc(100vh - 370px)' }}
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>
      </Box>
    </>
  );
}
