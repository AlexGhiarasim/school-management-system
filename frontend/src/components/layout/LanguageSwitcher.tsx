import { useTranslation } from 'react-i18next';
import { LANGUAGES, type Language } from '../../lib/i18n.ts';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage as Language;

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className="inline-flex rounded-xl bg-white/80 p-1 shadow-sm ring-1 ring-slate-200"
    >
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={current === language}
          onClick={() => void i18n.changeLanguage(language)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold uppercase transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${
            current === language
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {language}
        </button>
      ))}
    </div>
  );
}
