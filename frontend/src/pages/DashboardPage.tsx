import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher.tsx';
import { Logo } from '../components/layout/Logo.tsx';
import { Button } from '../components/ui/Button.tsx';
import { useAuth } from '../hooks/useAuth.ts';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const name = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <header className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-6 sm:px-10">
        <Logo />
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          {t('common.appName')}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitcher />
          <Button variant="secondary" fullWidth={false} onClick={logout}>
            {t('dashboard.signOut')}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <div className="rounded-3xl bg-white/90 p-8 shadow-2xl shadow-indigo-900/10 ring-1 ring-slate-200/80">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('dashboard.greeting', { name })}
          </h1>
          <p className="mt-2 text-slate-600">
            {t('dashboard.signedInAs', {
              role: t(`dashboard.roles.${user.role}`),
            })}
          </p>
          <p className="mt-6 text-sm text-slate-500">
            {t('dashboard.placeholder')}
          </p>
        </div>
      </main>
    </div>
  );
}
