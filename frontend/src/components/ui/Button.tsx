import type { ButtonHTMLAttributes } from 'react';
import { SpinnerIcon } from './icons.tsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'subtleDanger';
  fullWidth?: boolean;
}

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 hover:shadow-brand-600/40 focus-visible:ring-brand-200',
  secondary:
    'bg-white text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:ring-brand-200',
  danger:
    'bg-red-600 text-white shadow-lg shadow-red-600/25 hover:bg-red-500 focus-visible:ring-red-200',
  // For a delete button inside a list: quiet until the pointer is over it.
  subtleDanger:
    'bg-white text-rose-600 shadow-sm ring-1 ring-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200 focus-visible:ring-rose-200',
};

export function Button({
  loading = false,
  variant = 'primary',
  fullWidth = true,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
        fullWidth ? 'w-full' : ''
      } ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <SpinnerIcon />}
      {children}
    </button>
  );
}
