import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import Pagination from '@mui/material/Pagination';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { fNumber } from 'src/utils/format-number';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';

import type { IBuilding } from '../api/get';

export type FilterType = 'all' | 'new_building' | 'major_renovation' | 'overdue';

interface Props {
  buildings: IBuilding[];
  filter: FilterType;
  selectedRegionId: number | null;
  onBuildingClick: (building: IBuilding) => void;
}

const ROWS_PER_PAGE = 10;

export function BuildingsTable({ buildings, filter, selectedRegionId, onBuildingClick }: Props) {
  const { t } = useTranslate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Filter buildings based on active filter and search
  const filteredBuildings = useMemo(() => {
    let result = buildings;

    // Apply region filter from map
    if (selectedRegionId !== null) {
      result = result.filter((b) => b.regionId === selectedRegionId);
    }

    // Apply stat card filter
    if (filter === 'new_building') {
      result = result.filter((b) => b.buildingType === 'new_building');
    } else if (filter === 'major_renovation') {
      result = result.filter((b) => b.buildingType === 'major_renovation');
    } else if (filter === 'overdue') {
      result = result.filter((b) => b.isOverdue);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.objectName.toLowerCase().includes(searchLower) ||
          (b.cardNumber && b.cardNumber.toLowerCase().includes(searchLower))
      );
    }

    return result;
  }, [buildings, filter, selectedRegionId, search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filter, selectedRegionId, search]);

  const totalPages = Math.ceil(filteredBuildings.length / ROWS_PER_PAGE);
  const paginatedBuildings = filteredBuildings.slice(
    (page - 1) * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE
  );

  const hasActiveFilter = filter !== 'all' || selectedRegionId !== null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 3 }}>
            <span>{t('Buildings')}</span>
            <Chip
              size="small"
              label={`${fNumber(filteredBuildings.length)} / ${fNumber(buildings.length)}`}
              color={hasActiveFilter ? 'primary' : 'default'}
            />
          </Box>
        }
        action={
          <TextField
            size="small"
            placeholder={t('Search...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mdi:magnify" width={20} />
                </InputAdornment>
              ),
            }}
            sx={{ width: 200 }}
          />
        }
        sx={{ pb: 0 }}
      />

      <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 250 }}>{t('Object Name')}</TableCell>
              <TableCell align="right">{t('Cost')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBuildings.map((building) => (
              <TableRow
                key={building.id}
                hover
                sx={{
                  cursor: 'pointer',
                }}
                onClick={() => onBuildingClick(building)}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.4,
                    }}
                    title={building.objectName}
                  >
                    {building.objectName}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" noWrap>
                    {building.constructionCost ? fNumber(building.constructionCost) : '-'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}

            {paginatedBuildings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('No buildings found')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          size="small"
        />
      </Box>
    </Card>
  );
}
