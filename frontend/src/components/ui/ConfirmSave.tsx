import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDetail } from './ConfirmDialog.tsx';

interface ConfirmSaveProps {
  entity: 'grade' | 'class' | 'student' | 'teacher' | 'subject';
  editing: boolean;
  details: ConfirmDetail[];
  confirm: { open: boolean; confirm: () => void; cancel: () => void };
}

// Asks the user to confirm a create or an update, with a summary of it.
export function ConfirmSave({
  entity,
  editing,
  details,
  confirm,
}: ConfirmSaveProps) {
  const { t } = useTranslation();
  const action = editing ? 'update' : 'create';

  return (
    <ConfirmDialog
      open={confirm.open}
      title={t(`confirm.${entity}.${action}Title`)}
      message={t(`confirm.${entity}.${action}Message`)}
      details={details}
      confirmLabel={editing ? t('confirm.save') : t('confirm.add')}
      onConfirm={confirm.confirm}
      onCancel={confirm.cancel}
    />
  );
}
