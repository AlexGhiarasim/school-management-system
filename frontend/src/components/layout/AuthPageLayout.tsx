import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { paths } from '../../routes/paths.ts';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { Logo } from './Logo.tsx';

// Frame of the pages reached from an email or from the sign in form.
export function AuthPageLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-cyan-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 sm:px-10">
        <header className="flex items-center gap-3">
          <Link to={paths.home} className="flex items-center gap-3">
            <Logo />
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              {t('common.appName')}
            </span>
          </Link>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-8">
          <div className="animate-rise w-full max-w-md rounded-3xl bg-white/90 p-7 shadow-2xl shadow-brand-900/10 ring-1 ring-slate-200/80">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
