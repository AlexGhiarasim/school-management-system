import type { ReactNode } from 'react';
import { AlertIcon } from '../../../components/ui/icons.tsx';

export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex animate-fade-in items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
    >
      <AlertIcon />
      {children}
    </p>
  );
}
