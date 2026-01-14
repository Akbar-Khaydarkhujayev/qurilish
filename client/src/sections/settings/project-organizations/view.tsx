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

import { useGetProjectOrganizations } from './api/get';
import { useDeleteProjectOrganization } from './api/delete';
import { ProjectOrganizationDialog } from './components/dialog';
import { ProjectOrganizationRowItem } from './components/row-item';

const headLabels = ['Name', 'Tax ID', 'Phone Number', 'Created at', ''];

export default function ProjectOrganizationsView() {
  const { t } = useTranslate();
  const { page, limit } = usePagination();

  const [searchQuery, setSearchQuery] = useState('');
  const [editedProjectOrganizationId, setEditedProjectOrganizationId] = useState<string | undefined>(
    undefined
  );

  const search = useDebounce(searchQuery);
  const openEditDialog = useBoolean();

  const { mutate: deleteProjectOrganization } = useDeleteProjectOrganization();
  const { data } = useGetProjectOrganizations({
    page,
    limit,
    search,
  });

  return (
    <>
      <ProjectOrganizationDialog
        onClose={openEditDialog.onFalse}
        open={openEditDialog.value}
        editedProjectOrganizationId={editedProjectOrganizationId}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Typography variant="h4">{t('Project Organizations')}</Typography>

          <Box display="flex" gap={2} alignItems="center">
            <SearchInput
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Button
              variant="contained"
              onClick={() => {
                setEditedProjectOrganizationId(undefined);
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
                  <ProjectOrganizationRowItem
                    key={row.id}
                    row={row}
                    edit={() => {
                      setEditedProjectOrganizationId(String(row.id));
                      openEditDialog.onTrue();
                    }}
                    remove={() => deleteProjectOrganization(row.id)}
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
