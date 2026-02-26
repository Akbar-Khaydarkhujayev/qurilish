import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { CustomTabs } from 'src/components/custom-tabs';

import { UzbekistanMap } from '../dashboard/components/uzbekistan-map';
import { type IBuilding, useGetDashboardStatistics } from '../dashboard/api/get';
import { BuildingsTable, type FilterType } from '../dashboard/components/buildings-table';

// ----------------------------------------------------------------------

interface CompletionWidgetProps {
  title: string;
  value: number;
  icon: string;
  color: 'primary' | 'info' | 'warning' | 'error';
}

function CompletionWidget({ title, value, icon, color }: CompletionWidgetProps) {
  const theme = useTheme();

  const getBgColor = (col: string) => {
    const palette = theme.palette[col as keyof typeof theme.palette] as any;
    return palette.dark;
  };

  return (
    <Box
      sx={{
        p: 1.5,
        gap: 2,
        flex: 1,
        borderRadius: 2,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        color: 'common.white',
        bgcolor: getBgColor(color),
        transition: 'all 0.2s',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.2)',
          position: 'relative',
        }}
      >
        <Iconify icon={icon} width={36} />

        <SvgColor
          src={`${CONFIG.site.basePath}/assets/background/shape-circle-3.svg`}
          sx={{
            width: 150,
            height: 150,
            opacity: 0.08,
            position: 'absolute',
            color: 'primary.light',
          }}
        />
      </Box>

      <div>
        <Box sx={{ typography: 'h3', fontWeight: 700 }}>{value}</Box>
        <Box sx={{ typography: 'h6', opacity: 0.8, fontWeight: 600, fontSize: 18 }}>{title}</Box>
      </div>

      <Iconify
        icon={icon}
        sx={{
          width: 100,
          right: -30,
          height: 100,
          opacity: 0.08,
          position: 'absolute',
        }}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function Dashboard1View() {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetDashboardStatistics();

  // Filter states
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const stats = data?.data;

  // Calculate filtered counts based on selected region and filter
  const filteredCounts = useMemo(() => {
    if (!stats) return { total: 0, newBuildings: 0, renovations: 0 };

    let { buildings } = stats;

    // Filter by region if selected
    if (selectedRegionId !== null) {
      buildings = buildings.filter((b) => b.regionId === selectedRegionId);
    }

    // Filter by active tab filter
    if (activeFilter === 'in_progress') {
      buildings = buildings.filter((b) => b.statusName !== 'Topshirish');
    } else if (activeFilter === 'completed') {
      buildings = buildings.filter((b) => b.statusName === 'Topshirish');
    } else if (activeFilter === 'deadline_close') {
      const sixMonthsFromNow = dayjs().add(6, 'month');
      buildings = buildings.filter(
        (b) =>
          b.constructionEndDate &&
          dayjs(b.constructionEndDate).isBefore(sixMonthsFromNow) &&
          dayjs(b.constructionEndDate).isAfter(dayjs())
      );
    } else if (activeFilter === 'overdue') {
      buildings = buildings.filter((b) => b.isOverdue);
    }

    return {
      total: buildings.length,
      newBuildings: buildings.filter((b) => b.buildingType === 'new_building').length,
      renovations: buildings.filter((b) => b.buildingType === 'major_renovation').length,
    };
  }, [stats, selectedRegionId, activeFilter]);

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

  const handleFilterChange = (_event: React.SyntheticEvent, newValue: FilterType) => {
    setActiveFilter(newValue);
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
    <Box
      sx={{
        height: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pb: 4,
      }}
    >
      {/* Filter Tabs */}
      <Box
        sx={{
          flexShrink: 0,
          mb: 2,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 2,
          border: '1px solid',
          borderColor: 'white',
        }}
      >
        <CustomTabs
          value={activeFilter}
          onChange={handleFilterChange}
          variant="fullWidth"
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
          slotProps={{
            tab: {
              fontSize: 24,
              fontWeight: 600,
              py: 1,
            },
          }}
        >
          <Tab
            value="all"
            label={t('All')}
            sx={{
              fontSize: 18,
              fontWeight: 600,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'primary.lighter',
                borderRadius: 2,
              },
            }}
          />
          <Tab
            value="in_progress"
            label={t('Work in Progress')}
            sx={{
              fontSize: 18,
              fontWeight: 600,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              '&.Mui-selected': {
                color: 'info.main',
                bgcolor: 'info.lighter',
                borderRadius: 2,
              },
            }}
          />
          <Tab
            value="completed"
            label={t('Completed')}
            sx={{
              fontSize: 18,
              fontWeight: 600,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              '&.Mui-selected': {
                color: 'success.main',
                bgcolor: 'success.lighter',
                borderRadius: 2,
              },
            }}
          />
          <Tab
            value="deadline_close"
            label={t('Deadline Close')}
            sx={{
              fontSize: 18,
              fontWeight: 600,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              '&.Mui-selected': {
                color: 'warning.main',
                bgcolor: 'warning.lighter',
                borderRadius: 2,
              },
            }}
          />
          <Tab
            value="overdue"
            label={t('Overdue')}
            sx={{
              fontSize: 18,
              fontWeight: 600,
              '&.Mui-selected': {
                color: 'error.main',
                bgcolor: 'error.lighter',
                borderRadius: 2,
              },
            }}
          />
        </CustomTabs>
      </Box>

      {/* Count Cards - Full Width */}
      <Box sx={{ display: 'flex', gap: 1.5, flexShrink: 0, mb: 2 }}>
        <CompletionWidget
          title={t('Total Buildings')}
          value={filteredCounts.total}
          icon="mdi:building"
          color="primary"
        />
        <CompletionWidget
          title={t('New Buildings')}
          value={filteredCounts.newBuildings}
          icon="mdi:home-plus"
          color="info"
        />
        <CompletionWidget
          title={t('Major Renovations')}
          value={filteredCounts.renovations}
          icon="mdi:home-edit"
          color="warning"
        />
      </Box>

      {/* Map and Table Row */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, minHeight: 0 }}>
        {/* Map */}
        <Box sx={{ flex: '0 0 56%', minHeight: 0, overflow: 'hidden' }}>
          <UzbekistanMap
            regionStats={stats.byRegion}
            selectedRegionId={selectedRegionId}
            selectedRegion={selectedRegion}
            onRegionClick={handleRegionClick}
          />
        </Box>

        {/* Buildings table */}
        <Box sx={{ flex: '0 0 42%', minHeight: 0 }}>
          <BuildingsTable
            buildings={stats.buildings}
            filter={activeFilter}
            selectedRegionId={selectedRegionId}
            onBuildingClick={handleBuildingClick}
          />
        </Box>
      </Box>
    </Box>
  );
}
