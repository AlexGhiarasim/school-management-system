import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useFormState, type FormError } from '../../../hooks/useFormState.ts';
import { useToast } from '../../../hooks/useToast.ts';
import { ApiError } from '../../../lib/api.ts';
import { getApiErrorKey } from '../../../lib/apiErrors.ts';
import { useSaveSubject } from '../hooks.ts';
import type { AdminSubject } from '../types.ts';

const SUBJECT_NAME_MAX_LENGTH = 100;

interface SubjectValues {
  name: string;
}

function validate({ name }: SubjectValues) {
  const errors: Partial<Record<keyof SubjectValues, FormError>> = {};

  if (!name.trim()) {
    errors.name = { key: 'admin.subjects.form.errors.nameRequired' };
  }

  return errors;
}

function SubjectForm({
  subject,
  onDone,
}: {
  subject: AdminSubject | null;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { notify } = useToast();
  const mutation = useSaveSubject();

  const { field, setFieldError, handleSubmit } = useFormState<SubjectValues>(
    { name: subject?.name ?? '' },
    validate,
    t,
  );

  async function save(values: SubjectValues) {
    try {
      await mutation.mutateAsync({
        subjectId: subject?.id ?? null,
        input: { name: values.name.trim() },
      });
      notify(
        t(
          subject
            ? 'admin.subjects.form.updated'
            : 'admin.subjects.form.created',
        ),
        'success',
      );
      onDone();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setFieldError('name', { key: 'admin.subjects.form.errors.nameTaken' });
      }
    }
  }

  const showAlert =
    mutation.isError &&
    !(mutation.error instanceof ApiError && mutation.error.status === 409);

  return (
    <form
      onSubmit={(event) => handleSubmit(event, save)}
      noValidate
      className="space-y-4"
    >
      <TextField
        label={t('admin.subjects.form.name')}
        maxLength={SUBJECT_NAME_MAX_LENGTH}
        placeholder={t('admin.subjects.form.namePlaceholder')}
        {...field('name')}
      />

      {showAlert && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {t(getApiErrorKey(mutation.error))}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" fullWidth={false} onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" fullWidth={false} loading={mutation.isPending}>
          {mutation.isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}

interface SubjectFormModalProps {
  open: boolean;
  onClose: () => void;
  subject: AdminSubject | null;
}

export function SubjectFormModal({
  open,
  onClose,
  subject,
}: SubjectFormModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(
        subject
          ? 'admin.subjects.form.editTitle'
          : 'admin.subjects.form.createTitle',
      )}
    >
      <SubjectForm subject={subject} onDone={onClose} />
    </Modal>
  );
}
