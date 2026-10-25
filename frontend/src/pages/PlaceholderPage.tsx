import { useTranslation } from 'react-i18next';

export default function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {t(titleKey)}
      </h1>
      <p className="mt-3 text-slate-600">{t('pages.comingSoon')}</p>
    </section>
  );
}
