import { useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistrationEnabled } from '../hooks.ts';
import type { AuthMode } from '../types.ts';
import { LoginForm } from './LoginForm.tsx';
import { RegisterForm } from './RegisterForm.tsx';

const ALL_MODES: AuthMode[] = ['login', 'register'];

const FORMS: Record<AuthMode, () => React.JSX.Element> = {
  login: LoginForm,
  register: RegisterForm,
};

const tabId = (mode: AuthMode) => `auth-tab-${mode}`;
const panelId = (mode: AuthMode) => `auth-panel-${mode}`;

export function AuthCard() {
  const { t } = useTranslation();
  const registrationEnabled = useRegistrationEnabled();
  const modes = registrationEnabled ? ALL_MODES : ALL_MODES.slice(0, 1);
  const [selected, setMode] = useState<AuthMode>('login');
  const mode = modes.includes(selected) ? selected : 'login';
  const tabs = useRef<Partial<Record<AuthMode, HTMLButtonElement | null>>>({});

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const next = mode === 'login' ? 'register' : 'login';
    setMode(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white/90 p-7 shadow-2xl shadow-indigo-900/10 ring-1 ring-slate-200/80 backdrop-blur">
      {registrationEnabled && (
        <div
          role="tablist"
          aria-label={t('auth.tabsLabel')}
          className="relative mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1"
        >
          <span
            aria-hidden="true"
            className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow transition-transform duration-300 ease-out ${
              mode === 'register' ? 'translate-x-full' : ''
            }`}
          />
          {modes.map((tabMode) => (
            <button
              key={tabMode}
              ref={(element) => {
                tabs.current[tabMode] = element;
              }}
              id={tabId(tabMode)}
              type="button"
              role="tab"
              aria-selected={mode === tabMode}
              aria-controls={panelId(tabMode)}
              tabIndex={mode === tabMode ? 0 : -1}
              onClick={() => setMode(tabMode)}
              onKeyDown={handleTabKeyDown}
              className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100 ${
                mode === tabMode
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t(`auth.tabs.${tabMode}`)}
            </button>
          ))}
        </div>
      )}

      <div className="flex min-h-[28rem] flex-col justify-center">
        {modes.map((panelMode) => {
          const Form = FORMS[panelMode];
          const active = mode === panelMode;

          return (
            <div
              key={panelMode}
              id={panelId(panelMode)}
              role="tabpanel"
              aria-labelledby={tabId(panelMode)}
              className={active ? 'animate-fade-in' : 'hidden'}
            >
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {t(`auth.${panelMode}.title`)}
              </h2>
              <p className="mt-1 mb-5 text-sm text-slate-500">
                {t(`auth.${panelMode}.subtitle`)}
              </p>
              <Form />
              {registrationEnabled && (
                <p className="mt-5 text-center text-sm text-slate-500">
                  {t(`auth.${panelMode}.prompt`)}{' '}
                  <button
                    type="button"
                    onClick={() =>
                      setMode(panelMode === 'login' ? 'register' : 'login')
                    }
                    className="font-semibold text-indigo-600 transition hover:text-indigo-500 hover:underline focus:outline-none focus-visible:underline"
                  >
                    {t(`auth.${panelMode}.action`)}
                  </button>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
