import type { BoxProps } from '@mui/material/Box';

import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import NoSsr from '@mui/material/NoSsr';

import { RouterLink } from 'src/routes/components';

import logo from './image.png';
import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = BoxProps & {
  href?: string;
  disableLink?: boolean;
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ width = 40, height = 40, disableLink = false, className, href = '/', sx, ...other }, ref) => (
    <NoSsr
      fallback={
        <Box
          width={width}
          height={height}
          className={logoClasses.root.concat(className ? ` ${className}` : '')}
          sx={{ flexShrink: 0, display: 'inline-flex', verticalAlign: 'middle', ...sx }}
        />
      }
    >
      <Box
        ref={ref}
        component={RouterLink}
        href={href}
        width={width}
        height={height}
        className={logoClasses.root.concat(className ? ` ${className}` : '')}
        aria-label="logo"
        sx={{
          flexShrink: 0,
          display: 'inline-flex',
          verticalAlign: 'middle',
          ...(disableLink && { pointerEvents: 'none' }),
          ...sx,
        }}
        {...other}
      >
        <Box component="img" src={logo} width={1} height={1} />
      </Box>
    </NoSsr>
  )
);
