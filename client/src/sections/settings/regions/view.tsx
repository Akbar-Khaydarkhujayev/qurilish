import { useState } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { usePagination } from 'src/hooks/use-pagination';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchInput } from 'src/components/search-input';
import { TableNoData, TableHeadCustom, TablePaginationCustom } from 'src/components/table';

import { useGetRegions } from './api/get';
import { useDeleteRegion } from './api/delete';
import { RegionDialog } from './components/dialog';
import { RegionRowItem } from './components/row-item';

const headLabels = ['Name', 'Created at', ''];

export default function RegionsView() {
  const { t } = useTranslate();
  const { page, limit } = usePagination();

  const [searchQuery, setSearchQuery] = useState('');
  const [editedRegionId, setEditedRegionId] = useState<string | undefined>(
    undefined
  );

  const search = useDebounce(searchQuery);
  const openEditDialog = useBoolean();

  const { mutate: deleteRegion } = useDeleteRegion();
  const { data } = useGetRegions({
    page,
    limit,
    search,
  });

  return (
    <>
      <RegionDialog
        onClose={openEditDialog.onFalse}
        open={openEditDialog.value}
        editedRegionId={editedRegionId}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Typography variant="h4">{t('Regions')}</Typography>

          <Box display="flex" gap={2} alignItems="center">
            <SearchInput
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Button
              variant="contained"
              onClick={() => {
                setEditedRegionId(undefined);
                openEditDialog.onTrue();
              }}
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              color="primary"
            >
              {t('add')}
            </Button>
          </Box>
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
          <Scrollbar sx={{ height: 'calc(100vh - 230px)' }}>
            <Table size="small" stickyHeader>
              <TableHeadCustom
                headLabel={headLabels.map((label) => ({
                  id: label,
                  label,
                  align: label === 'Actions' ? 'right' : 'left',
                }))}
              />

              <TableBody>
                {data?.data.map((row) => (
                  <RegionRowItem
                    key={row.id}
                    row={row}
                    edit={() => {
                      setEditedRegionId(String(row.id));
                      openEditDialog.onTrue();
                    }}
                    remove={() => deleteRegion(row.id)}
                  />
                ))}

                <TableNoData notFound={!data?.meta.total} sx={{ height: 'calc(100vh - 290px)' }} />
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom count={data?.meta.total || 0} />
        </Box>
      </Box>
    </>
  );
}
