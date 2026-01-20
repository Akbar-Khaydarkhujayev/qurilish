import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslate } from 'src/locales';

import { UzbekistanMap } from './components/uzbekistan-map';
import { FilterStatCard } from './components/filter-stat-card';
import { type IBuilding, useGetDashboardStatistics } from './api/get';
import { BuildingsTable, type FilterType } from './components/buildings-table';

export function DashboardView() {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetDashboardStatistics();

  // Filter states
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const stats = data?.data;

  // Calculate filtered counts based on selected region
  const filteredCounts = useMemo(() => {
    if (!stats) return { total: 0, newBuildings: 0, renovations: 0, overdue: 0 };

    let { buildings } = stats;

    // Filter by region if selected
    if (selectedRegionId !== null) {
      buildings = buildings.filter((b) => b.regionId === selectedRegionId);
    }

    return {
      total: buildings.length,
      newBuildings: buildings.filter((b) => b.buildingType === 'new_building').length,
      renovations: buildings.filter((b) => b.buildingType === 'major_renovation').length,
      overdue: buildings.filter((b) => b.isOverdue).length,
    };
  }, [stats, selectedRegionId]);

  // Get selected region info
  const selectedRegion = useMemo(() => {
    if (!stats || selectedRegionId === null) return null;
    return stats.byRegion.find((r) => r.id === selectedRegionId) || null;
  }, [stats, selectedRegionId]);

  const handleBuildingClick = (building: IBuilding) => {
    navigate(`/dashboard/${building.id}`);
  };

  const handleRegionClick = (regionId: number | null) => {
    setSelectedRegionId(regionId);
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter((prev) => (prev === filter ? 'all' : filter));
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t('Error loading dashboard data')}</Alert>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">{t('No dashboard data available')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 72px)', display: 'flex', overflow: 'hidden', pb: 4 }}>
      {/* Left side: Stat cards + Map */}
      <Box
        sx={{
          flex: '0 0 56%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          minHeight: 0,
          mr: 'auto',
        }}
      >
        {/* Stat cards row */}
        <Box
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, flexShrink: 0 }}
        >
          <FilterStatCard
            title={t('Total Buildings')}
            value={filteredCounts.total}
            icon="mdi:building"
            color="primary"
            selected={activeFilter === 'all'}
            onClick={() => handleFilterClick('all')}
          />
          <FilterStatCard
            title={t('New Buildings')}
            value={filteredCounts.newBuildings}
            icon="mdi:home-plus"
            color="info"
            selected={activeFilter === 'new_building'}
            onClick={() => handleFilterClick('new_building')}
          />
          <FilterStatCard
            title={t('Major Renovations')}
            value={filteredCounts.renovations}
            icon="mdi:home-edit"
            color="warning"
            selected={activeFilter === 'major_renovation'}
            onClick={() => handleFilterClick('major_renovation')}
          />
          <FilterStatCard
            title={t('Overdue Buildings')}
            value={filteredCounts.overdue}
            icon="mdi:alert-circle"
            color="error"
            selected={activeFilter === 'overdue'}
            onClick={() => handleFilterClick('overdue')}
          />
        </Box>
        {/* Map */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <UzbekistanMap
            regionStats={stats.byRegion}
            selectedRegionId={selectedRegionId}
            selectedRegion={selectedRegion}
            onRegionClick={handleRegionClick}
          />
        </Box>
      </Box>
      {/* Right side: Buildings table */}
      <Box sx={{ flex: '0 0 42%', minHeight: 0 }}>
        <BuildingsTable
          buildings={stats.buildings}
          filter={activeFilter}
          selectedRegionId={selectedRegionId}
          onBuildingClick={handleBuildingClick}
        />
      </Box>
    </Box>
  );
}
