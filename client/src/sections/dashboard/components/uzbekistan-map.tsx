import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { fNumber, fShortenNumber } from 'src/utils/format-number';

import { useTranslate } from 'src/locales';

import type { IRegionStats } from '../api/get';

// Map SVG region IDs to database region IDs
// Based on seed data order:
// 1: Toshkent shahri, 2: Toshkent viloyati, 3: Andijon, 4: Buxoro, 5: Farg'ona
// 6: Jizzax, 7: Xorazm, 8: Namangan, 9: Navoiy, 10: Qashqadaryo
// 11: Qoraqalpog'iston, 12: Samarqand, 13: Sirdaryo, 14: Surxondaryo
const SVG_TO_DB_REGION_MAP: Record<string, number> = {
  'UZ-TK': 1, // Toshkent shahri (city)
  'UZ-TO': 2, // Toshkent viloyati
  'UZ-AN': 3, // Andijon
  'UZ-BU': 4, // Buxoro
  'UZ-FA': 5, // Farg'ona
  'UZ-JI': 6, // Jizzax
  'UZ-XO': 7, // Xorazm
  'UZ-NG': 8, // Namangan
  'UZ-NW': 9, // Navoiy
  'UZ-QA': 10, // Qashqadaryo
  'UZ-QR': 11, // Qoraqalpog'iston
  'UZ-SA': 12, // Samarqand
  'UZ-SI': 13, // Sirdaryo
  'UZ-SU': 14, // Surxondaryo
};

interface Props {
  regionStats: IRegionStats[];
  selectedRegionId?: number | null;
  selectedRegion?: IRegionStats | null;
  onRegionClick?: (regionId: number | null) => void;
  sx?: object;
}

export function UzbekistanMap({
  regionStats,
  selectedRegionId,
  selectedRegion,
  onRegionClick,
  sx,
}: Props) {
  const { t } = useTranslate();
  const theme = useTheme();
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    open: boolean;
    region: IRegionStats | null;
    position: { x: number; y: number };
  }>({
    open: false,
    region: null,
    position: { x: 0, y: 0 },
  });

  // Create a map from DB region ID to stats
  const regionStatsMap = useMemo(() => new Map(regionStats.map((r) => [r.id, r])), [regionStats]);

  // Get max building count for color scaling
  const maxBuildingCount = Math.max(...regionStats.map((r) => r.buildingCount), 1);

  // Get color based on building count
  const getRegionColor = useCallback(
    (buildingCount: number) => {
      if (buildingCount === 0) return theme.palette.grey[300];
      const intensity = buildingCount / maxBuildingCount;
      // From light to dark primary color
      if (intensity < 0.25) return theme.palette.primary.lighter;
      if (intensity < 0.5) return theme.palette.primary.light;
      if (intensity < 0.75) return theme.palette.primary.main;
      return theme.palette.primary.dark;
    },
    [maxBuildingCount, theme]
  );

  useEffect(() => {
    const loadSvg = async () => {
      if (!svgContainerRef.current) return;

      try {
        const response = await fetch('/assets/uzbekistan.svg');
        const svgText = await response.text();

        svgContainerRef.current.innerHTML = svgText;

        const svgElement = svgContainerRef.current.querySelector('svg');
        if (!svgElement) return;

        // Style the SVG
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';
        svgElement.style.maxWidth = '100%';
        svgElement.style.objectFit = 'contain';

        // Style each region path
        const paths = svgElement.querySelectorAll('path[id^="UZ-"]');
        paths.forEach((path) => {
          const pathElement = path as SVGPathElement;
          const svgRegionId = pathElement.id;
          const dbRegionId = SVG_TO_DB_REGION_MAP[svgRegionId];
          const stats = dbRegionId ? regionStatsMap.get(dbRegionId) : null;

          // Skip Aral Sea (UZ-AS)
          if (svgRegionId === 'UZ-AS') {
            pathElement.style.fill = theme.palette.info.lighter;
            pathElement.style.stroke = theme.palette.info.light;
            pathElement.style.strokeWidth = '0.5';
            return;
          }

          const buildingCount = stats?.buildingCount || 0;
          const isSelected = selectedRegionId === dbRegionId;

          pathElement.style.fill = getRegionColor(buildingCount);
          pathElement.style.stroke = isSelected
            ? theme.palette.primary.dark
            : theme.palette.divider;
          pathElement.style.strokeWidth = isSelected ? '3' : '1';
          pathElement.style.cursor = 'pointer';
          pathElement.style.transition = 'all 0.2s ease';

          if (isSelected) {
            pathElement.style.filter = 'brightness(0.9)';
          } else {
            pathElement.style.filter = 'none';
          }

          // Add event listeners
          pathElement.addEventListener('mouseenter', (e) => {
            pathElement.style.opacity = '0.8';
            pathElement.style.strokeWidth = '2';
            pathElement.style.stroke = theme.palette.primary.dark;

            if (stats) {
              setTooltipData({
                open: true,
                region: stats,
                position: { x: e.clientX, y: e.clientY },
              });
            }
          });

          pathElement.addEventListener('mousemove', (e) => {
            if (stats) {
              setTooltipData((prev) => ({
                ...prev,
                position: { x: e.clientX, y: e.clientY },
              }));
            }
          });

          pathElement.addEventListener('mouseleave', () => {
            pathElement.style.opacity = '1';
            pathElement.style.strokeWidth = '1';
            pathElement.style.stroke = theme.palette.divider;
            setTooltipData((prev) => ({ ...prev, open: false }));
          });

          pathElement.addEventListener('click', () => {
            if (dbRegionId && onRegionClick) {
              // Toggle selection: if already selected, deselect; otherwise select
              onRegionClick(selectedRegionId === dbRegionId ? null : dbRegionId);
            }
          });
        });
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };

    loadSvg();
  }, [regionStats, theme, getRegionColor, regionStatsMap, onRegionClick, selectedRegionId]);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      <CardHeader
        title={t('Buildings by Region')}
        sx={{
          flexShrink: 0,
          '& .MuiCardHeader-title': {
            mt: -1,
            fontSize: 24,
            fontWeight: 600,
          },
        }}
      />
      <Box
        sx={{
          p: 2,
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Box
          ref={svgContainerRef}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 0,
          }}
        />

        {/* Region Info or Legend */}
        <Box
          sx={{
            position: 'absolute',
            top: -46,
            right: 8,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            overflow: 'hidden',
            minWidth: selectedRegion ? 180 : 'auto',
          }}
        >
          {selectedRegion && (
            <>
              {/* Selected Region Header */}
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} fontSize={16}>
                  {selectedRegion.regionName}
                </Typography>
              </Box>
              {/* Selected Region Stats */}
              <Box sx={{ px: 1.5, py: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" fontSize={14}>
                    {t('Buildings')}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} fontSize={14}>
                    {fNumber(selectedRegion.buildingCount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" fontSize={14}>
                    {t('New Buildings')}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="primary.main" fontSize={14}>
                    {fNumber(selectedRegion.newBuildings)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" fontSize={14}>
                    {t('Renovations')}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="warning.main" fontSize={14}>
                    {fNumber(selectedRegion.renovations)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    pt: 0.5,
                    mt: 0.5,
                    borderTop: `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontSize={14}>
                    {t('Total Cost')}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main" fontSize={14}>
                    {fShortenNumber(selectedRegion.totalCost)}
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* Custom Tooltip */}
        {tooltipData.open && tooltipData.region && (
          <Box
            sx={{
              position: 'fixed',
              left: tooltipData.position.x + 12,
              top: tooltipData.position.y + 12,
              zIndex: 9999,
              pointerEvents: 'none',
              bgcolor: 'background.paper',
              borderRadius: 1.5,
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
              minWidth: 180,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} fontSize={16}>
                {tooltipData.region.regionName}
              </Typography>
            </Box>
            {/* Content */}
            <Box sx={{ px: 1.5, py: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontSize={14}>
                  {t('Buildings')}
                </Typography>
                <Typography variant="body2" fontWeight={600} fontSize={14}>
                  {fNumber(tooltipData.region.buildingCount)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontSize={14}>
                  {t('New Buildings')}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="primary.main" fontSize={14}>
                  {fNumber(tooltipData.region.newBuildings)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontSize={14}>
                  {t('Renovations')}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="warning.main" fontSize={14}>
                  {fNumber(tooltipData.region.renovations)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  pt: 0.5,
                  mt: 0.5,
                  borderTop: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Typography variant="body2" color="text.secondary" fontSize={14}>
                  {t('Total Cost')}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="success.main" fontSize={14}>
                  {fShortenNumber(tooltipData.region.totalCost)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
}
