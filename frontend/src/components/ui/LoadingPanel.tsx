import { useTranslation } from 'react-i18next';
import { SpinnerIcon } from './icons.tsx';

// Shown in place of a page or a table until its data arrives.
export function LoadingPanel({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      className={`flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-300 [&_svg]:h-9 [&_svg]:w-9 ${className}`}
    >
      <SpinnerIcon />
      <span className="text-sm font-medium text-slate-500">
        {t('common.loading')}
      </span>
    </div>
  );
}
