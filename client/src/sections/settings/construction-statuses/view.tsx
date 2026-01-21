import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stepper from '@mui/material/Stepper';
import TableBody from '@mui/material/TableBody';
import StepLabel from '@mui/material/StepLabel';
import { Button, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { usePagination } from 'src/hooks/use-pagination';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchInput } from 'src/components/search-input';
import { TableNoData, TableHeadCustom, TablePaginationCustom } from 'src/components/table';

import { useGetConstructionStatuses } from './api/get';
import { useDeleteConstructionStatus } from './api/delete';
import { ConstructionStatusDialog } from './components/dialog';
import { ConstructionStatusRowItem } from './components/row-item';

const headLabels = ['Tartib', 'Name', 'Created at', ''];

export default function ConstructionStatusesView() {
  const { t } = useTranslate();
  const { page, limit } = usePagination();

  const [searchQuery, setSearchQuery] = useState('');
  const [editedConstructionStatusId, setEditedConstructionStatusId] = useState<string | undefined>(
    undefined
  );

  const search = useDebounce(searchQuery);
  const openEditDialog = useBoolean();

  const { mutate: deleteConstructionStatus } = useDeleteConstructionStatus();
  const { data } = useGetConstructionStatuses({
    page,
    limit,
    search,
  });

  // Get all statuses for stepper preview (without pagination)
  const { data: allStatuses } = useGetConstructionStatuses({ page: 1, limit: 999 });

  // Sort statuses by sequence for stepper
  const sortedStatuses = useMemo(() => {
    if (!allStatuses?.data) return [];
    return [...allStatuses.data].sort((a, b) => a.sequence - b.sequence);
  }, [allStatuses]);

  return (
    <>
      <ConstructionStatusDialog
        onClose={openEditDialog.onFalse}
        open={openEditDialog.value}
        editedConstructionStatusId={editedConstructionStatusId}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Typography variant="h4">{t('Construction Statuses')}</Typography>

          <Box display="flex" gap={2} alignItems="center">
            <SearchInput
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Button
              variant="contained"
              onClick={() => {
                setEditedConstructionStatusId(undefined);
                openEditDialog.onTrue();
              }}
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              color="primary"
            >
              {t('add')}
            </Button>
          </Box>
        </Box>

        {/* Stepper Preview Card */}
        {sortedStatuses.length > 0 && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                {t("Stepper ko'rinishi")} ({t("Building details page'da shunday ko'rinadi")}):
              </Typography>
              <Stepper activeStep={1} alternativeLabel>
                {sortedStatuses.map((status) => (
                  <Step key={status.id}>
                    <StepLabel>
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ display: 'block' }}
                        >
                          #{status.sequence}
                        </Typography>
                        {status.name}
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        )}

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Scrollbar sx={{ height: 'calc(100vh - 400px)' }}>
            <Table size="small" stickyHeader>
              <TableHeadCustom
                headLabel={headLabels.map((label) => ({
                  id: label,
                  label: t(label),
                  align: label === '' ? 'right' : 'left',
                  width: label === 'Tartib' ? 80 : undefined,
                }))}
              />

              <TableBody>
                {data?.data.map((row) => (
                  <ConstructionStatusRowItem
                    key={row.id}
                    row={row}
                    edit={() => {
                      setEditedConstructionStatusId(String(row.id));
                      openEditDialog.onTrue();
                    }}
                    remove={() => deleteConstructionStatus(row.id)}
                  />
                ))}

                <TableNoData notFound={!data?.meta.total} sx={{ height: 'calc(100vh - 390px)' }} />
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom count={data?.meta.total || 0} />
        </Box>
      </Box>
    </>
  );
}
