import { useState } from 'react';
import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { Button, Select, MenuItem, Typography, InputLabel, FormControl } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { usePagination } from 'src/hooks/use-pagination';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SearchInput } from 'src/components/search-input';
import { TableNoData, TableHeadCustom, TablePaginationCustom } from 'src/components/table';

import { useGetBuildings } from './api/get';
import { useDeleteBuilding } from './api/delete';
import { BuildingDialog } from './components/dialog';
import { BuildingRowItem } from './components/row-item';
import { useGetRegions } from '../settings/regions/api/get';
import { useGetDistricts } from '../settings/districts/api/get';
import { useGetConstructionStatuses } from '../settings/construction-statuses/api/get';

const headLabels = [
  'Card Number',
  'Object Name',
  'Region',
  'District',
  'Contractor',
  'Status',
  'Created at',
  '',
];

export default function BuildingsView() {
  const { t } = useTranslate();
  const { page, limit } = usePagination();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionId, setRegionId] = useState<number | ''>('');
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [statusId, setStatusId] = useState<number | ''>('');
  const [editedBuildingId, setEditedBuildingId] = useState<string | undefined>(undefined);

  const search = useDebounce(searchQuery);
  const openEditDialog = useBoolean();

  const { data: regionsData } = useGetRegions({ page: 1, limit: 100 });
  const { data: districtsData } = useGetDistricts({
    page: 1,
    limit: 100,
    region_id: regionId || undefined,
  });
  const { data: statusesData } = useGetConstructionStatuses({ page: 1, limit: 100 });

  const { mutate: deleteBuilding } = useDeleteBuilding();
  const { data } = useGetBuildings({
    page,
    limit,
    search,
    region_id: regionId || undefined,
    district_id: districtId || undefined,
    construction_status_id: statusId || undefined,
  });

  const handleRegionChange = (value: number | '') => {
    setRegionId(value);
    setDistrictId('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setRegionId('');
    setDistrictId('');
    setStatusId('');
  };

  return (
    <>
      <BuildingDialog
        onClose={openEditDialog.onFalse}
        open={openEditDialog.value}
        editedBuildingId={editedBuildingId}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Typography variant="h4">{t('Buildings')}</Typography>

          <Button
            variant="contained"
            onClick={() => {
              setEditedBuildingId(undefined);
              openEditDialog.onTrue();
            }}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            color="primary"
          >
            {t('add')}
          </Button>
        </Box>

        <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
          <SearchInput
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('Region')}</InputLabel>
            <Select
              value={regionId}
              label={t('Region')}
              onChange={(e) => handleRegionChange(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>{t('All')}</em>
              </MenuItem>
              {regionsData?.data.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }} disabled={!regionId}>
            <InputLabel>{t('District')}</InputLabel>
            <Select
              value={districtId}
              label={t('District')}
              onChange={(e) => setDistrictId(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>{t('All')}</em>
              </MenuItem>
              {districtsData?.data.map((district) => (
                <MenuItem key={district.id} value={district.id}>
                  {district.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('Status')}</InputLabel>
            <Select
              value={statusId}
              label={t('Status')}
              onChange={(e) => setStatusId(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>{t('All')}</em>
              </MenuItem>
              {statusesData?.data.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(searchQuery || regionId || districtId || statusId) && (
            <Button variant="outlined" onClick={handleClearFilters} size="small">
              {t('Clear Filters')}
            </Button>
          )}
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
          <Scrollbar sx={{ height: 'calc(100vh - 290px)' }}>
            <Table size="small" stickyHeader>
              <TableHeadCustom
                headLabel={headLabels.map((label) => ({
                  id: label,
                  label: t(label),
                  align: label === '' ? 'right' : 'left',
                }))}
              />

              <TableBody>
                {data?.data.map((row) => (
                  <BuildingRowItem
                    key={row.id}
                    row={row}
                    edit={() => {
                      setEditedBuildingId(String(row.id));
                      openEditDialog.onTrue();
                    }}
                    remove={() => deleteBuilding(row.id)}
                    click={() => navigate(`/buildings/${row.id}`)}
                  />
                ))}

                <TableNoData notFound={!data?.meta.total} sx={{ height: 'calc(100vh - 350px)' }} />
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom count={data?.meta.total || 0} />
        </Box>
      </Box>
    </>
  );
}
