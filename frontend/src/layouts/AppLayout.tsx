import { NavLink, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher.tsx';
import { Logo } from '../components/layout/Logo.tsx';
import { Button } from '../components/ui/Button.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { NAV_ITEMS } from './navigation.ts';

export function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const name = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="hidden text-base font-semibold tracking-tight text-slate-900 sm:inline">
              {t('common.appName')}
            </span>
          </div>

          <nav
            aria-label={t('nav.main')}
            className="order-last -mx-6 flex w-[calc(100%+3rem)] gap-1 overflow-x-auto px-6 sm:-mx-10 sm:w-[calc(100%+5rem)] sm:px-10 lg:order-none lg:mx-0 lg:w-auto lg:px-0"
          >
            {NAV_ITEMS[user.role].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? true}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden text-right leading-tight md:block">
              <p className="text-sm font-medium text-slate-900">{name}</p>
              <p className="text-xs text-slate-500">
                {t(`roles.${user.role}`)}
              </p>
            </div>
            <Button variant="secondary" fullWidth={false} onClick={logout}>
              {t('nav.signOut')}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <Outlet />
      </main>
    </div>
  );
}
