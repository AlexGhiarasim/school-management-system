import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface LinkButtonProps {
  to: string;
  variant?: 'primary' | 'secondary';
  className?: string;
  children: ReactNode;
}

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 focus-visible:ring-brand-200',
  secondary:
    'bg-white text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:ring-brand-200',
};

// A link that looks like a Button.
export function LinkButton({
  to,
  variant = 'secondary',
  className = '',
  children,
}: LinkButtonProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 print:hidden ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
