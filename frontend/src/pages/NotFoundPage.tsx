import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { paths, roleHome } from '../routes/paths.ts';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-cyan-50 px-6 text-center">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <p className="text-6xl font-bold tracking-tight text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">
        {t('pages.notFound.title')}
      </h1>
      <p className="mt-2 max-w-sm text-slate-600">
        {t('pages.notFound.description')}
      </p>
      <Link
        to={user ? roleHome[user.role] : paths.home}
        className="mt-8 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
      >
        {t('pages.notFound.back')}
      </Link>
    </div>
  );
}
