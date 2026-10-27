import { useTranslation } from 'react-i18next';
import { Button } from './Button.tsx';
import { Modal } from './Modal.tsx';

export interface ConfirmDetail {
  label: string;
  value: string;
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  details?: ConfirmDetail[];
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  details,
  confirmLabel,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm leading-relaxed text-slate-600">{message}</p>
      {details && details.length > 0 && (
        <dl className="mt-4 divide-y divide-slate-100 border-y border-slate-100 text-sm">
          {details.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4 py-2"
            >
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-right font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" fullWidth={false} onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          fullWidth={false}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel ?? t('common.confirm')}
        </Button>
      </div>
    </Modal>
  );
}
