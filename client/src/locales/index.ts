import { ru } from './ru';
import { uzLatn } from './uz-latn';
import { uzCyrl } from './uz-cyrl';

export const translations = {
  ru,
  'uz-Latn': uzLatn,
  'uz-Cyrl': uzCyrl,
};

export type TranslationKeys = typeof ru;
export type SupportedLocale = keyof typeof translations;

export const DEFAULT_LOCALE: SupportedLocale = 'ru';

export const SUPPORTED_LOCALES: { value: string; label: string; countryCode: string }[] = [
  { value: 'ru', label: 'Русский', countryCode: 'RU' },
  { value: 'uz-Latn', label: "O'zbekcha", countryCode: 'UZ' },
  { value: 'uz-Cyrl', label: 'Ўзбекча', countryCode: 'UZ' },
];
