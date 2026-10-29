import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/layout/LanguageSwitcher.tsx';
import { Logo } from '../components/layout/Logo.tsx';
import { ConfirmDialog } from '../components/ui/ConfirmDialog.tsx';
import { CloseIcon, MenuIcon } from '../components/ui/icons.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import { roleProfile } from '../routes/paths.ts';
import { NAV_ITEMS } from './navigation.ts';
import { UserMenu } from './UserMenu.tsx';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
    isActive
      ? 'text-slate-900 after:absolute after:inset-x-3 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-brand-600'
      : 'text-slate-500 hover:text-slate-900'
  }`;

export function AppLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const name = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.email;
  const initials = user.profile
    ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`
    : user.email[0].toUpperCase();
  // The profile has its own entry in the user menu.
  const links = NAV_ITEMS[user.role].filter(
    (item) => item.to !== roleProfile[user.role],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-gray-100 shadow-sm print:hidden">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            aria-label={t(menuOpen ? 'nav.closeMenu' : 'nav.openMenu')}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 lg:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <div className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="hidden text-base font-semibold tracking-tight whitespace-nowrap text-slate-900 2xl:inline">
              {t('common.appName')}
            </span>
          </div>

          <nav
            aria-label={t('nav.main')}
            className="ml-4 hidden items-center gap-1 lg:flex"
          >
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? true}
                className={linkClass}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <UserMenu
              name={name}
              email={user.email}
              initials={initials}
              role={t(`roles.${user.role}`)}
              profilePath={roleProfile[user.role]}
              onSignOut={() => setConfirmingSignOut(true)}
            />
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label={t('nav.main')}
            className="animate-fade-in grid gap-1 border-t border-gray-200 px-4 py-3 sm:px-6 lg:hidden"
          >
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? true}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
                    isActive
                      ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-600 hover:bg-gray-200'
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <ConfirmDialog
        open={confirmingSignOut}
        title={t('nav.signOutConfirm.title')}
        message={t('nav.signOutConfirm.message')}
        confirmLabel={t('nav.signOutConfirm.confirm')}
        onConfirm={logout}
        onCancel={() => setConfirmingSignOut(false)}
      />

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10 print:max-w-none print:p-0">
        <div className="min-w-0 rounded-3xl border border-slate-300 bg-slate-100/60 p-3 shadow-sm sm:p-6 print:border-0 print:bg-transparent print:p-0 print:shadow-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
