import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

interface Props {
  title: string;
  value: number;
  icon: string;
  color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
  selected?: boolean;
  onClick?: () => void;
}

export function FilterStatCard({
  title,
  value,
  icon,
  color = 'primary',
  selected = false,
  onClick,
}: Props) {
  const theme = useTheme();

  const colorValue = theme.palette[color];

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        border: `2px solid ${selected ? colorValue.main : 'transparent'}`,
        bgcolor: selected ? colorValue.lighter : 'background.paper',
        '&:hover': onClick
          ? {
              bgcolor: colorValue.lighter,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4],
              '& .stat-title': {
                color: colorValue.dark,
              },
              '& .stat-value': {
                color: colorValue.dark,
              },
            }
          : {},
      }}
    >
      <Box>
        <Typography
          variant="caption"
          className="stat-title"
          color={selected ? `${color}.dark` : 'text.secondary'}
          sx={{ mb: 0.5, display: 'block', fontWeight: selected ? 600 : 400, transition: 'color 0.2s ease' }}
        >
          {title}
        </Typography>
        <Typography
          variant="h6"
          className="stat-value"
          color={selected ? `${color}.dark` : 'text.primary'}
          sx={{ transition: 'color 0.2s ease' }}
        >
          {fNumber(value)}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          borderRadius: '50%',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: selected ? colorValue.main : colorValue.lighter,
          color: selected ? 'white' : colorValue.dark,
        }}
      >
        <Iconify icon={icon} width={20} />
      </Box>
    </Card>
  );
}
