import { useTranslation } from 'react-i18next';
import { Button } from './Button.tsx';
import { AlertIcon } from './icons.tsx';

interface ErrorStateProps {
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ description, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
        <AlertIcon />
      </span>
      <p className="font-medium text-slate-900">{t('common.errorTitle')}</p>
      <p className="max-w-sm text-sm text-slate-500">
        {description ?? t('common.errorDescription')}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          fullWidth={false}
          className="mt-3"
          onClick={onRetry}
        >
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
