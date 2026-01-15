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

import { useDeleteSubObject } from './api/delete';
import { SubObjectDialog } from './components/dialog';
import { SubObjectRowItem } from './components/row-item';
import { useGetSubObjectsByObjectCard } from './api/get';

const headLabels = ['Name', 'Deadline', 'Cost', 'Completion %', 'Created at', ''];

export default function SubObjectsView() {
  const { t } = useTranslate();
  const { id: objectCardId } = useParams();

  const [editedSubObjectId, setEditedSubObjectId] = useState<string | undefined>(undefined);
  const openEditDialog = useBoolean();

  const { mutate: deleteSubObject } = useDeleteSubObject();
  const { data } = useGetSubObjectsByObjectCard(objectCardId || '');

  return (
    <>
      <SubObjectDialog
        onClose={openEditDialog.onFalse}
        open={openEditDialog.value}
        editedSubObjectId={editedSubObjectId}
        objectCardId={objectCardId || ''}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="flex-end" alignItems="start" mb={2}>
          <Button
            variant="contained"
            onClick={() => {
              setEditedSubObjectId(undefined);
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
          <Scrollbar sx={{ height: 'calc(100vh - 320px)' }}>
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
                  <SubObjectRowItem
                    key={row.id}
                    row={row}
                    edit={() => {
                      setEditedSubObjectId(String(row.id));
                      openEditDialog.onTrue();
                    }}
                    remove={() => deleteSubObject(row.id)}
                  />
                ))}

                <TableNoData notFound={!data?.length} sx={{ height: 'calc(100vh - 370px)' }} />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>
      </Box>
    </>
  );
}
