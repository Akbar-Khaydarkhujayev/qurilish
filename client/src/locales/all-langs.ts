// core (MUI)
import { ruRU as ruRUCore } from '@mui/material/locale';
// date pickers (MUI)
import { enUS as enUSDate, ruRU as ruRUDate } from '@mui/x-date-pickers/locales';
// data grid (MUI)
import { enUS as enUSDataGrid, ruRU as ruRUDataGrid } from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'ru',
    label: 'Russian',
    countryCode: 'RU',
    adapterLocale: 'ru',
    numberFormat: { code: 'ru-RU', currency: 'UZS' },
    systemValue: {
      components: { ...ruRUCore.components, ...ruRUDate.components, ...ruRUDataGrid.components },
    },
  },
  {
    value: 'uz-latn',
    label: 'Uzbek (Latin)',
    countryCode: 'UZ',
    adapterLocale: 'uz-latn',
    numberFormat: { code: 'uz-Latn-UZ', currency: 'UZS' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  {
    value: 'uz-cyrl',
    label: 'Uzbek (Cyrillic)',
    countryCode: 'UZ',
    adapterLocale: 'uz-cyrl',
    numberFormat: { code: 'uz-Cyrl-UZ', currency: 'UZS' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
];

/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
