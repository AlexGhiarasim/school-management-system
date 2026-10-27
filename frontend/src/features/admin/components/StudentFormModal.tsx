import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { ConfirmSave } from '../../../components/ui/ConfirmSave.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
import { SelectField } from '../../../components/ui/SelectField.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useConfirmedSubmit } from '../../../hooks/useConfirmedSubmit.ts';
import { useFormState, type FormError } from '../../../hooks/useFormState.ts';
import { useToast } from '../../../hooks/useToast.ts';
import { ApiError } from '../../../lib/api.ts';
import { getApiErrorKey } from '../../../lib/apiErrors.ts';
import {
  validateName,
  validatePassword,
} from '../../../utils/accountValidation.ts';
import { formatDate } from '../../../utils/format.ts';
import {
  EMAIL_MAX_LENGTH,
  isValidBirthDate,
  isValidEmail,
  MIN_BIRTH_DATE_ISO,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../../../utils/validators.ts';
import { useSaveStudent } from '../hooks.ts';
import type { AdminClass, AdminStudent } from '../types.ts';

const TODAY = new Date().toISOString().slice(0, 10);

interface StudentValues {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  password: string;
  classId: string;
}

function validate(values: StudentValues, requirePassword: boolean) {
  const errors: Partial<Record<keyof StudentValues, FormError>> = {};

  const firstName = validateName(
    values.firstName,
    'auth.errors.firstNameRequired',
  );
  if (firstName) errors.firstName = firstName;

  const lastName = validateName(
    values.lastName,
    'auth.errors.lastNameRequired',
  );
  if (lastName) errors.lastName = lastName;

  if (!isValidEmail(values.email)) {
    errors.email = { key: 'auth.errors.emailInvalid' };
  }
  if (!isValidBirthDate(values.dateOfBirth)) {
    errors.dateOfBirth = { key: 'auth.errors.dateOfBirthInvalid' };
  }
  if (requirePassword) {
    const password = validatePassword(values.password);
    if (password) errors.password = password;
  }

  return errors;
}

interface StudentFormProps {
  student: AdminStudent | null;
  classes: AdminClass[];
  onDone: () => void;
}

function StudentForm({ student, classes, onDone }: StudentFormProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? 'ro';
  const { notify } = useToast();
  const mutation = useSaveStudent();
  const editing = student !== null;

  const { field, setFieldError, handleSubmit } = useFormState<StudentValues>(
    {
      firstName: student?.firstName ?? '',
      lastName: student?.lastName ?? '',
      email: student?.email ?? '',
      dateOfBirth: student?.dateOfBirth ?? '',
      password: '',
      classId: student?.class ? String(student.class.id) : '',
    },
    (values) => validate(values, !editing),
    t,
  );

  async function save(values: StudentValues) {
    const classId = values.classId ? Number(values.classId) : undefined;
    const profile = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      dateOfBirth: values.dateOfBirth,
    };

    try {
      await mutation.mutateAsync({
        student,
        input: editing
          ? { ...profile, classId }
          : { ...profile, password: values.password, classId },
      });
      notify(
        t(
          editing
            ? 'admin.students.form.updated'
            : 'admin.students.form.created',
        ),
        'success',
      );
      onDone();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setFieldError('email', { key: 'auth.errors.emailTaken' });
      }
    }
  }

  const confirm = useConfirmedSubmit(save);

  const showAlert =
    mutation.isError &&
    !(mutation.error instanceof ApiError && mutation.error.status === 409);

  return (
    <>
      <form
        onSubmit={(event) => handleSubmit(event, confirm.request)}
        noValidate
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t('auth.fields.firstName')}
            placeholder={t('auth.fields.firstNamePlaceholder')}
            autoCapitalize="words"
            maxLength={NAME_MAX_LENGTH}
            {...field('firstName')}
          />
          <TextField
            label={t('auth.fields.lastName')}
            placeholder={t('auth.fields.lastNamePlaceholder')}
            autoCapitalize="words"
            maxLength={NAME_MAX_LENGTH}
            {...field('lastName')}
          />
        </div>
        <TextField
          label={t('auth.fields.email')}
          placeholder={t('auth.fields.emailPlaceholder')}
          type="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={EMAIL_MAX_LENGTH}
          {...field('email')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t('auth.fields.dateOfBirth')}
            type="date"
            min={MIN_BIRTH_DATE_ISO}
            max={TODAY}
            {...field('dateOfBirth')}
          />
          <SelectField
            label={t('admin.students.filter.label')}
            {...field('classId')}
          >
            <option value="">{t('admin.students.form.noClass')}</option>
            {classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </SelectField>
        </div>
        {!editing && (
          <TextField
            label={t('auth.fields.password')}
            type="password"
            autoComplete="new-password"
            maxLength={PASSWORD_MAX_LENGTH}
            placeholder={t('auth.fields.newPasswordPlaceholder')}
            {...field('password')}
          />
        )}

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
      <ConfirmSave
        entity="student"
        editing={editing}
        details={
          confirm.values
            ? [
                {
                  label: t('auth.fields.lastName'),
                  value: confirm.values.lastName.trim(),
                },
                {
                  label: t('auth.fields.firstName'),
                  value: confirm.values.firstName.trim(),
                },
                {
                  label: t('auth.fields.email'),
                  value: confirm.values.email.trim(),
                },
                {
                  label: t('auth.fields.dateOfBirth'),
                  value: formatDate(confirm.values.dateOfBirth, language),
                },
                {
                  label: t('admin.students.filter.label'),
                  value:
                    classes.find(
                      (item) => String(item.id) === confirm.values?.classId,
                    )?.name ?? t('confirm.none'),
                },
              ]
            : []
        }
        confirm={confirm}
      />
    </>
  );
}

interface StudentFormModalProps {
  open: boolean;
  onClose: () => void;
  student: AdminStudent | null;
  classes: AdminClass[];
}

export function StudentFormModal({
  open,
  onClose,
  student,
  classes,
}: StudentFormModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(
        student
          ? 'admin.students.form.editTitle'
          : 'admin.students.form.createTitle',
      )}
    >
      <StudentForm student={student} classes={classes} onDone={onClose} />
    </Modal>
  );
}
