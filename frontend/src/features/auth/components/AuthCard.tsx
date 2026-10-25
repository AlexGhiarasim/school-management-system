import { useState } from 'react';
import type { AuthMode } from '../types.ts';
import { LoginForm } from './LoginForm.tsx';
import { RegisterForm } from './RegisterForm.tsx';

const TABS: { mode: AuthMode; label: string }[] = [
  { mode: 'login', label: 'Sign in' },
  { mode: 'register', label: 'Create account' },
];

const COPY: Record<
  AuthMode,
  {
    title: string;
    subtitle: string;
    prompt: string;
    action: string;
    target: AuthMode;
  }
> = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to continue.',
    prompt: "Don't have an account?",
    action: 'Create one',
    target: 'register',
  },
  register: {
    title: 'Create your account',
    subtitle: 'Fill in your details to get started.',
    prompt: 'Already have an account?',
    action: 'Sign in',
    target: 'login',
  },
};

export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>('login');
  const copy = COPY[mode];

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
      <div
        role="tablist"
        aria-label="Authentication"
        className="mb-8 grid grid-cols-2 rounded-lg bg-slate-100 p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            type="button"
            role="tab"
            aria-selected={mode === tab.mode}
            onClick={() => setMode(tab.mode)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              mode === tab.mode
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        {copy.title}
      </h2>
      <p className="mt-1 mb-6 text-sm text-slate-500">{copy.subtitle}</p>

      {mode === 'login' ? <LoginForm /> : <RegisterForm />}

      <p className="mt-6 text-center text-sm text-slate-500">
        {copy.prompt}{' '}
        <button
          type="button"
          onClick={() => setMode(copy.target)}
          className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus-visible:underline"
        >
          {copy.action}
        </button>
      </p>
    </div>
  );
}
