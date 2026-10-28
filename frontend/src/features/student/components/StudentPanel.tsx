import { useId, type ReactNode } from 'react';

interface StudentPanelProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  embedded?: boolean;
}

export function StudentPanel({
  title,
  actions,
  children,
  className = '',
  embedded = false,
}: StudentPanelProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`min-w-0 bg-white ${embedded ? '' : 'rounded-2xl border border-slate-300 shadow-sm'} ${className}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-t-2xl border-b border-slate-300 bg-slate-50 px-5 py-4 sm:px-6">
        <h2
          id={titleId}
          className="text-base font-semibold tracking-tight text-slate-900"
        >
          {title}
        </h2>
        {actions}
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
