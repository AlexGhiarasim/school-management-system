import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import ro from '../locales/ro.json';

export const LANGUAGES = ['ro', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

const STORAGE_KEY = 'language';
const DEFAULT_LANGUAGE: Language = 'ro';

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // Storage can be unavailable, the default language is used instead.
  }

  return DEFAULT_LANGUAGE;
}

function applyLanguage(language: string) {
  document.documentElement.lang = language;
  document.title = i18n.t('common.appName');

  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Ignored on purpose, the choice only lasts for this session.
  }
}

void i18n.use(initReactI18next).init({
  resources: { ro: { translation: ro }, en: { translation: en } },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

applyLanguage(i18n.language);
i18n.on('languageChanged', applyLanguage);

export default i18n;
