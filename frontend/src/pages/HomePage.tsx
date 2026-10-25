import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher.tsx';
import { Logo } from '../components/layout/Logo.tsx';
import { AuthCard } from '../features/auth/components/AuthCard.tsx';
import { RoleOverview } from '../features/landing/components/RoleOverview.tsx';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen overflow-clip bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-indigo-200/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-sky-200/50 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 sm:px-10">
        <header className="flex items-center gap-3">
          <Logo />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            {t('common.appName')}
          </span>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </header>

        <main className="grid flex-1 items-center gap-12 py-8 lg:grid-cols-2 lg:gap-16">
          <section>
            <p className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
              {t('landing.badge')}
            </p>
            <h1 className="mt-5 max-w-lg text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {t('landing.headline')}
            </h1>
            <p className="mt-5 max-w-md text-lg text-slate-600">
              {t('landing.subtitle')}
            </p>
            <div className="mt-8">
              <RoleOverview />
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <AuthCard />
          </section>
        </main>
      </div>
    </div>
  );
}
