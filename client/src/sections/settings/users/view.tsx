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

import { useAuthContext } from 'src/auth/hooks';

import { useGetUsers } from './api/get';
import { useDeleteUser } from './api/delete';
import { UserDialog } from './components/dialog';
import { UserRowItem } from './components/row-item';

const headLabels = ['Name', 'Username', 'Phone Number', 'Organization', 'Role', 'Created at', ''];

export default function UsersView() {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  const { page, limit } = usePagination();

  const [searchQuery, setSearchQuery] = useState('');
  const [editedUserId, setEditedUserId] = useState<string | undefined>(undefined);

  const search = useDebounce(searchQuery);
  const openEditDialog = useBoolean();

  const { mutate: deleteUser } = useDeleteUser();
  const { data } = useGetUsers({
    page,
    limit,
    search,
  });

  // Role-based permissions:
  // super_admin can create/edit/delete region_admin
  // region_admin can create/edit/delete user
  // user cannot create/edit/delete anyone
  const canCreateUser = user?.role === 'super_admin' || user?.role === 'region_admin';

  return (
    <>
      <UserDialog
        onClose={openEditDialog.onFalse}
        open={openEditDialog.value}
        editedUserId={editedUserId}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Typography variant="h4">{t('Users')}</Typography>

          <Box display="flex" gap={2} alignItems="center">
            <SearchInput
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {canCreateUser && (
              <Button
                variant="contained"
                onClick={() => {
                  setEditedUserId(undefined);
                  openEditDialog.onTrue();
                }}
                startIcon={<Iconify icon="solar:add-circle-bold" />}
                color="primary"
              >
                {t('add')}
              </Button>
            )}
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
                  <UserRowItem
                    key={row.id}
                    row={row}
                    currentUserRole={user?.role}
                    edit={() => {
                      setEditedUserId(String(row.id));
                      openEditDialog.onTrue();
                    }}
                    remove={() => deleteUser(row.id)}
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
