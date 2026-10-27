import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { ConfirmSave } from '../../../components/ui/ConfirmSave.tsx';
import { Modal } from '../../../components/ui/Modal.tsx';
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
import {
  EMAIL_MAX_LENGTH,
  isValidEmail,
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../../../utils/validators.ts';
import { useSaveTeacher } from '../hooks.ts';
import type { AdminTeacher } from '../types.ts';

interface TeacherValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

function validate(values: TeacherValues, requirePassword: boolean) {
  const errors: Partial<Record<keyof TeacherValues, FormError>> = {};

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
  if (requirePassword) {
    const password = validatePassword(values.password);
    if (password) errors.password = password;
  }

  return errors;
}

function TeacherForm({
  teacher,
  onDone,
}: {
  teacher: AdminTeacher | null;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { notify } = useToast();
  const mutation = useSaveTeacher();
  const editing = teacher !== null;

  const { field, setFieldError, handleSubmit } = useFormState<TeacherValues>(
    {
      firstName: teacher?.firstName ?? '',
      lastName: teacher?.lastName ?? '',
      email: teacher?.email ?? '',
      password: '',
    },
    (values) => validate(values, !editing),
    t,
  );

  async function save(values: TeacherValues) {
    const profile = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
    };

    try {
      await mutation.mutateAsync({
        teacher,
        input: editing ? profile : { ...profile, password: values.password },
      });
      notify(
        t(
          editing
            ? 'admin.teachers.form.updated'
            : 'admin.teachers.form.created',
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
        entity="teacher"
        editing={editing}
        details={
          confirm.values
            ? [
                {
                  label: t('auth.fields.firstName'),
                  value: confirm.values.firstName.trim(),
                },
                {
                  label: t('auth.fields.lastName'),
                  value: confirm.values.lastName.trim(),
                },
                {
                  label: t('auth.fields.email'),
                  value: confirm.values.email.trim(),
                },
              ]
            : []
        }
        confirm={confirm}
      />
    </>
  );
}

interface TeacherFormModalProps {
  open: boolean;
  onClose: () => void;
  teacher: AdminTeacher | null;
}

export function TeacherFormModal({
  open,
  onClose,
  teacher,
}: TeacherFormModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(
        teacher
          ? 'admin.teachers.form.editTitle'
          : 'admin.teachers.form.createTitle',
      )}
    >
      <TeacherForm teacher={teacher} onDone={onClose} />
    </Modal>
  );
}
