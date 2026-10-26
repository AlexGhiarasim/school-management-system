import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { SelectField } from '../../../components/ui/SelectField.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useFormState, type FormError } from '../../../hooks/useFormState.ts';
import { useToast } from '../../../hooks/useToast.ts';
import { ApiError } from '../../../lib/api.ts';
import { getApiErrorKey } from '../../../lib/apiErrors.ts';
import { useSaveClass } from '../hooks.ts';
import type { AdminClass, AdminTeacher } from '../types.ts';

const CLASS_NAME_MAX_LENGTH = 50;

interface ClassValues {
  name: string;
  teacherId: string;
}

function validate({ name }: ClassValues) {
  const errors: Partial<Record<keyof ClassValues, FormError>> = {};

  if (!name.trim()) {
    errors.name = { key: 'admin.classes.form.errors.nameRequired' };
  }

  return errors;
}

interface ClassFormProps {
  schoolClass: AdminClass | null;
  teachers: AdminTeacher[];
  onDone: () => void;
}

function ClassForm({ schoolClass, teachers, onDone }: ClassFormProps) {
  const { t } = useTranslation();
  const { notify } = useToast();
  const mutation = useSaveClass();

  const { field, setFieldError, handleSubmit } = useFormState<ClassValues>(
    {
      name: schoolClass?.name ?? '',
      teacherId: schoolClass?.teacher ? String(schoolClass.teacher.id) : '',
    },
    validate,
    t,
  );

  async function save(values: ClassValues) {
    try {
      await mutation.mutateAsync({
        schoolClass,
        input: {
          name: values.name.trim(),
          teacherId: values.teacherId ? Number(values.teacherId) : undefined,
        },
      });
      notify(
        t(
          schoolClass
            ? 'admin.classes.form.updated'
            : 'admin.classes.form.created',
        ),
        'success',
      );
      onDone();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setFieldError('name', { key: 'admin.classes.form.errors.nameTaken' });
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
        label={t('admin.classes.form.name')}
        maxLength={CLASS_NAME_MAX_LENGTH}
        placeholder={t('admin.classes.form.namePlaceholder')}
        {...field('name')}
      />
      <SelectField
        label={t('admin.classes.form.teacher')}
        {...field('teacherId')}
      >
        <option value="">{t('admin.classes.form.noTeacher')}</option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.lastName} {teacher.firstName}
          </option>
        ))}
      </SelectField>

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

interface ClassFormModalProps {
  open: boolean;
  onClose: () => void;
  schoolClass: AdminClass | null;
  teachers: AdminTeacher[];
}

export function ClassFormModal({
  open,
  onClose,
  schoolClass,
  teachers,
}: ClassFormModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(
        schoolClass
          ? 'admin.classes.form.editTitle'
          : 'admin.classes.form.createTitle',
      )}
    >
      <ClassForm
        schoolClass={schoolClass}
        teachers={teachers}
        onDone={onClose}
      />
    </Modal>
  );
}
