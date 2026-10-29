import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher.tsx';
import { Logo } from '../components/layout/Logo.tsx';
import { useRegistrationEnabled } from '../features/auth/hooks.ts';
import { AuthCard } from '../features/auth/components/AuthCard.tsx';
import { RotatingHeadline } from '../features/landing/components/RotatingHeadline.tsx';

const CURRENT_YEAR = new Date().getFullYear();

export default function HomePage() {
  const { t } = useTranslation();
  const registrationEnabled = useRegistrationEnabled();

  return (
    <div className="relative min-h-screen overflow-clip bg-gradient-to-br from-brand-50 via-white to-cyan-50">
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-drift pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl [animation-direction:alternate-reverse]"
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
            <div className="animate-rise">
              <RotatingHeadline />
            </div>
            <p
              className="animate-rise mt-5 max-w-md text-lg text-slate-600"
              style={{ animationDelay: '120ms' }}
            >
              {t(
                registrationEnabled
                  ? 'landing.subtitle'
                  : 'landing.subtitleSignInOnly',
              )}
            </p>
            <p
              className="animate-rise mt-6 max-w-md border-l-2 border-brand-200 pl-4 text-sm leading-relaxed text-slate-500"
              style={{ animationDelay: '240ms' }}
            >
              {t('landing.description')}
            </p>
          </section>

          <section
            className="animate-rise flex justify-center lg:justify-end"
            style={{ animationDelay: '200ms' }}
          >
            <AuthCard />
          </section>
        </main>

        <footer className="pt-6 pb-2 text-center text-xs text-slate-400">
          {t('landing.copyright', { year: CURRENT_YEAR })}
        </footer>
      </div>
    </div>
  );
}
