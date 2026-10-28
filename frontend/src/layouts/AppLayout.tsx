import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher.tsx';
import { Logo } from '../components/layout/Logo.tsx';
import { Button } from '../components/ui/Button.tsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { NAV_ITEMS } from './navigation.ts';

export function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  if (!user) return null;

  const name = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 sm:px-10">
          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="hidden text-base font-semibold tracking-tight text-slate-900 sm:inline xl:max-2xl:hidden">
              {t('common.appName')}
            </span>
          </div>

          <nav
            aria-label={t('nav.main')}
            className="order-last -mx-6 -mb-1 flex w-[calc(100%+3rem)] gap-1 overflow-x-auto overflow-y-hidden border-t border-slate-100 px-6 pt-2 sm:-mx-10 sm:w-[calc(100%+5rem)] sm:px-10 xl:order-none xl:mx-0 xl:mb-0 xl:w-auto xl:border-0 xl:px-0 xl:pt-0"
          >
            {NAV_ITEMS[user.role].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? true}
                className={({ isActive }) =>
                  `relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${
                    isActive
                      ? 'text-slate-900 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-indigo-600'
                      : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden text-right leading-tight md:block xl:max-2xl:hidden">
              <p className="text-sm font-medium text-slate-900">{name}</p>
              <p className="text-xs text-slate-500">
                {t(`roles.${user.role}`)}
              </p>
            </div>
            <span
              title={`${name} (${t(`roles.${user.role}`)})`}
              className="hidden h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 xl:max-2xl:flex"
            >
              {user.profile
                ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`
                : user.email[0].toUpperCase()}
            </span>
            <Button
              variant="secondary"
              fullWidth={false}
              onClick={() => setConfirmingSignOut(true)}
            >
              {t('nav.signOut')}
            </Button>
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={confirmingSignOut}
        title={t('nav.signOutConfirm.title')}
        message={t('nav.signOutConfirm.message')}
        confirmLabel={t('nav.signOutConfirm.confirm')}
        onConfirm={logout}
        onCancel={() => setConfirmingSignOut(false)}
      />

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <Outlet />
      </main>
    </div>
  );
}
