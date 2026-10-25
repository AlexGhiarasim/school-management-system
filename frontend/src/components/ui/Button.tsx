import type { ButtonHTMLAttributes } from 'react';
import { SpinnerIcon } from './icons.tsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function Button({
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 hover:shadow-indigo-600/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      {loading && <SpinnerIcon />}
      {children}
    </button>
  );
}
