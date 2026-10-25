import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/layout/PageHeader.tsx';

export default function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();

  return (
    <section>
      <PageHeader title={t(titleKey)} description={t('pages.comingSoon')} />
    </section>
  );
}
