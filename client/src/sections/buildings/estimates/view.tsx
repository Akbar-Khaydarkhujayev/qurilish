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
            </Table>
          </Scrollbar>
        </Box>
      </Box>
    </>
  );
}
