// ----------------------------------------------------------------------

export type LanguageValue = 'ru' | 'uzlatn' | 'uzcyrl';

export const fallbackLng = 'ru';
export const languages = ['ru', 'uzlatn', 'uzcyrl'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

// ----------------------------------------------------------------------

export function i18nOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    lng,
    fallbackLng,
    ns,
    defaultNS,
    fallbackNS: defaultNS,
    supportedLngs: languages,
  };
}

// ----------------------------------------------------------------------

export const changeLangMessages: Record<
  LanguageValue,
  { success: string; error: string; loading: string }
> = {
  ru: {
    success: 'Язык был изменен!',
    error: 'Ошибка при изменении языка!',
    loading: 'Загрузка...',
  },
  uzlatn: {
    success: "Til o'zgartirildi!",
    error: "Tilni o'zgartirishda xato!",
    loading: 'Yuklanmoqda...',
  },
  uzcyrl: {
    success: 'Тил ўзгартирилди!',
    error: 'Тилни ўзгартиришда хато!',
    loading: 'Юкланмоқда...',
  },
};
