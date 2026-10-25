import type { ReactNode } from 'react';
import { InfoIcon } from '../../../components/ui/icons.tsx';

export function FormNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="flex animate-fade-in items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm text-indigo-700"
    >
      <InfoIcon />
      {children}
    </p>
  );
}
