import { useTranslation } from 'react-i18next';
import { SpinnerIcon } from '../ui/icons.tsx';

export function LoadingScreen() {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      className="flex min-h-screen items-center justify-center gap-3 bg-slate-50 text-slate-600"
    >
      <SpinnerIcon />
      {t('common.loading')}
    </div>
  );
}
