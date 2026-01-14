import type { ProjectOrganization } from 'src/types/construction';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { ProjectOrganizationTableRow } from './project-organization-table-row';
import { ProjectOrganizationFormDialog } from './project-organization-form-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'taxId', label: 'Tax ID' },
  { id: 'address', label: 'Address' },
  { id: 'phoneNumber', label: 'Phone' },
  { id: 'mfo', label: 'MFO' },
  { id: 'actions', label: 'Actions', width: 88 },
];

// ----------------------------------------------------------------------

export function ProjectOrganizationsView() {
  const { t } = useTranslate();
  const table = useTable();

  const [tableData, setTableData] = useState<ProjectOrganization[]>([]);
  const [editingItem, setEditingItem] = useState<ProjectOrganization | null>(null);

  const formDialog = useBoolean();

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const notFound = !dataFiltered.length;

  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    formDialog.onTrue();
  }, [formDialog]);

  const handleEdit = useCallback(
    (item: ProjectOrganization) => {
      setEditingItem(item);
      formDialog.onTrue();
    },
    [formDialog]
  );

  const handleDelete = useCallback(
    (id: number) => {
      setTableData((prev) => prev.filter((item) => item.id !== id));
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table]
  );

  const handleSave = useCallback(
    (item: ProjectOrganization) => {
      if (editingItem) {
        setTableData((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      } else {
        setTableData((prev) => [...prev, item]);
      }
      formDialog.onFalse();
    },
    [editingItem, formDialog]
  );

  return (
    <>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ flexGrow: 1 }}>
            {t('projectOrganizations')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleAddNew}
          >
            {t('add')}
          </Button>
        </Box>

        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{ position: 'relative', overflow: 'unset', flex: 1 }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id.toString())
                )
              }
              action={
                <Button color="primary" onClick={() => console.log('Delete selected')}>
                  {t('delete')}
                </Button>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD.map((head) => ({
                    ...head,
                    label:
                      head.id === 'name'
                        ? t('name')
                        : head.id === 'taxId'
                          ? t('taxId')
                          : head.id === 'address'
                            ? t('address')
                            : head.id === 'phoneNumber'
                              ? t('phoneNumber')
                              : head.id === 'mfo'
                                ? t('mfo')
                                : t('actions'),
                  }))}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id.toString())
                    )
                  }
                />

                <TableBody>
                  {dataInPage.map((row) => (
                    <ProjectOrganizationTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id.toString())}
                      onSelectRow={() => table.onSelectRow(row.id.toString())}
                      onEditRow={() => handleEdit(row)}
                      onDeleteRow={() => handleDelete(row.id)}
                    />
                  ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 76}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </Box>

      <ProjectOrganizationFormDialog
        open={formDialog.value}
        onClose={formDialog.onFalse}
        editingItem={editingItem}
        onSave={handleSave}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
}: {
  inputData: ProjectOrganization[];
  comparator: (a: any, b: any) => number;
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}
