import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ChevronDownIcon } from '../components/ui/icons.tsx';

interface UserMenuProps {
  name: string;
  email: string;
  initials: string;
  role: string;
  profilePath: string;
  onSignOut: () => void;
}

const ITEM =
  'block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100';

export function UserMenu({
  name,
  email,
  initials,
  role,
  profilePath,
  onSignOut,
}: UserMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') setOpen(false);
      } else if (!root.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('nav.account')}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full bg-white py-1 pr-2 pl-1 shadow-sm ring-1 ring-slate-300 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 xl:pr-3"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {initials}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium text-slate-900 xl:block">
          {name}
        </span>
        <span className="text-slate-500">
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-in absolute right-0 z-40 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-300"
        >
          <div className="border-b border-slate-200 px-3 pt-2 pb-3">
            <p className="truncate font-semibold text-slate-900">{name}</p>
            <p className="truncate text-sm text-slate-500">{email}</p>
            <p className="mt-1 text-xs font-medium text-brand-700">{role}</p>
          </div>
          <div className="pt-2">
            <Link
              to={profilePath}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`${ITEM} text-slate-700 hover:bg-slate-100`}
            >
              {t('nav.profile')}
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className={`${ITEM} text-rose-700 hover:bg-rose-50`}
            >
              {t('nav.signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
