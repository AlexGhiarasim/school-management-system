import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  // A small label shown to the left of the title, for example a role.
  badge?: string;
  large?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  badge,
  large,
}: PageHeaderProps) {
  const heading = (
    <h1
      className={`font-bold tracking-tight text-slate-900 ${
        large ? 'text-4xl' : 'text-3xl'
      }`}
    >
      {title}
    </h1>
  );

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {badge ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              {badge}
            </span>
            {heading}
          </div>
        ) : (
          heading
        )}
        {description && <p className="mt-2 text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
