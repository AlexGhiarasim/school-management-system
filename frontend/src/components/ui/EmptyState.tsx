import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { InboxIcon } from './icons.tsx';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <InboxIcon />
      </span>
      <p className="font-medium text-slate-900">
        {title ?? t('common.emptyTitle')}
      </p>
      <p className="max-w-sm text-sm text-slate-500">
        {description ?? t('common.emptyDescription')}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
