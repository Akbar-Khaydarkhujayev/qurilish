import type { NavSectionProps } from 'src/components/nav-section';

import Box from '@mui/material/Box';
import { Switch } from '@mui/material';
import { styled, useTheme, useColorScheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';

import { Logo } from 'src/components/logo';
import { SvgColor } from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';
import { AccountPopover } from 'src/components/popovers/account-popover';

import { HeaderSection } from './header-section';
import { MenuButton } from '../components/menu-button';
import { SignInButton } from '../components/sign-in-button';
import { LanguagePopover } from '../components/language-popover';

import type { HeaderSectionProps } from './header-section';
import type { AccountDrawerProps } from '../components/account-drawer';
import type { ContactsPopoverProps } from '../components/contacts-popover';
import type { LanguagePopoverProps } from '../components/language-popover';
import type { NotificationsDrawerProps } from '../components/notifications-drawer';

// ----------------------------------------------------------------------

const StyledDivider = styled('span')(({ theme }) => ({
  width: 1,
  height: 10,
  flexShrink: 0,
  display: 'none',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(2.5),
  backgroundColor: 'currentColor',
  color: theme.vars.palette.divider,
  '&::before, &::after': {
    top: -5,
    width: 3,
    height: 3,
    content: '""',
    flexShrink: 0,
    borderRadius: '50%',
    position: 'absolute',
    backgroundColor: 'currentColor',
  },
  '&::after': { bottom: -5, top: 'auto' },
}));

// ----------------------------------------------------------------------

export type HeaderBaseProps = HeaderSectionProps & {
  onOpenNav: () => void;
  data?: {
    nav?: NavSectionProps['data'];
    account?: AccountDrawerProps['data'];
    langs?: LanguagePopoverProps['data'];
    contacts?: ContactsPopoverProps['data'];
    notifications?: NotificationsDrawerProps['data'];
  };
  slots?: {
    navMobile?: {
      topArea?: React.ReactNode;
      bottomArea?: React.ReactNode;
    };
  };
  slotsDisplay?: {
    signIn?: boolean;
    account?: boolean;
    helpLink?: boolean;
    settings?: boolean;
    purchase?: boolean;
    contacts?: boolean;
    searchbar?: boolean;
    menuButton?: boolean;
    localization?: boolean;
    notifications?: boolean;
  };
};

export function HeaderBase({
  sx,
  data,
  slots,
  slotProps,
  onOpenNav,
  layoutQuery,
  slotsDisplay: {
    signIn = true,
    account = true,
    helpLink = true,
    settings = true,
    purchase = true,
    contacts = true,
    searchbar = true,
    menuButton = true,
    localization = true,
    notifications = true,
  } = {},
  ...other
}: HeaderBaseProps) {
  const theme = useTheme();

  const { colorScheme, onUpdateField } = useSettingsContext();

  const { mode, setMode } = useColorScheme();

  return (
    <HeaderSection
      sx={sx}
      layoutQuery={layoutQuery}
      slots={{
        ...slots,
        leftAreaStart: slots?.leftAreaStart,
        leftArea: (
          <>
            {slots?.leftAreaStart}

            {/* -- Menu button -- */}
            {menuButton && (
              <MenuButton
                data-slot="menu-button"
                onClick={onOpenNav}
                sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
              />
            )}

            {/* -- Logo -- */}
            <Logo data-slot="logo" />

            {/* -- Divider -- */}
            <StyledDivider data-slot="divider" />
            {slots?.leftAreaEnd}
          </>
        ),
        rightArea: (
          <>
            {slots?.rightAreaStart}

            <Box
              data-area="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => {
                  onUpdateField('colorScheme', mode === 'light' ? 'dark' : 'light');
                  setMode(mode === 'light' ? 'dark' : 'light');
                }}
              >
                <SvgColor src={`${CONFIG.site.basePath}/assets/icons/setting/ic-moon.svg`} />
                <Switch
                  name="label"
                  size="small"
                  color="default"
                  checked={colorScheme === 'dark'}
                  sx={{ mr: -0.75 }}
                />
              </Box>

              {/* -- Language popover -- */}
              {localization && <LanguagePopover data-slot="localization" data={data?.langs} />}

              {/* -- Account drawer -- */}
              {account && <AccountPopover data-slot="account" data={data?.account} />}

              {/* -- Sign in button -- */}
              {signIn && <SignInButton />}
            </Box>

            {slots?.rightAreaEnd}
          </>
        ),
      }}
      slotProps={slotProps}
      {...other}
    />
  );
}
