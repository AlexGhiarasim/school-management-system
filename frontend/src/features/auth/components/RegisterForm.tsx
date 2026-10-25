import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button.tsx';
import { TextField } from '../../../components/ui/TextField.tsx';
import { useFormState, type FormError } from '../../../hooks/useFormState.ts';
import { usePendingAction } from '../../../hooks/usePendingAction.ts';
import {
  EMAIL_MAX_LENGTH,
  hasLetterAndDigit,
  isNameTooLong,
  isPasswordTooLong,
  isValidBirthDate,
  isValidEmail,
  isValidName,
  MIN_BIRTH_DATE_ISO,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../../utils/validators.ts';
import { FormNotice } from './FormNotice.tsx';
import { PasswordStrengthMeter } from './PasswordStrengthMeter.tsx';

const TODAY = new Date().toISOString().slice(0, 10);

interface RegisterValues {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_VALUES: RegisterValues = {
  firstName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  password: '',
  confirmPassword: '',
};

function validateName(
  value: string,
  requiredKey: string,
): FormError | undefined {
  const name = value.trim();

  if (!name) return { key: requiredKey };
  if (name.length < NAME_MIN_LENGTH) {
    return {
      key: 'auth.errors.nameTooShort',
      values: { min: NAME_MIN_LENGTH },
    };
  }
  if (isNameTooLong(name)) {
    return { key: 'auth.errors.nameTooLong', values: { max: NAME_MAX_LENGTH } };
  }
  if (!isValidName(name)) return { key: 'auth.errors.nameInvalid' };
}

function validatePassword(password: string): FormError | undefined {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      key: 'auth.errors.passwordTooShort',
      values: { min: PASSWORD_MIN_LENGTH },
    };
  }
  if (isPasswordTooLong(password)) {
    return {
      key: 'auth.errors.passwordTooLong',
      values: { max: PASSWORD_MAX_LENGTH },
    };
  }
  if (!hasLetterAndDigit(password)) return { key: 'auth.errors.passwordWeak' };
}

function validate(values: RegisterValues) {
  const errors: Partial<Record<keyof RegisterValues, FormError>> = {};

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

  const password = validatePassword(values.password);
  if (password) errors.password = password;

  if (!values.confirmPassword) {
    errors.confirmPassword = { key: 'auth.errors.confirmRequired' };
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = { key: 'auth.errors.passwordsMismatch' };
  }

  return errors;
}

export function RegisterForm() {
  const { t } = useTranslation();
  const { values, field, handleSubmit } = useFormState(
    INITIAL_VALUES,
    validate,
    t,
  );
  const { loading, done, run } = usePendingAction();

  return (
    <form
      onSubmit={(event) => handleSubmit(event, run)}
      noValidate
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t('auth.fields.firstName')}
          autoComplete="given-name"
          autoCapitalize="words"
          maxLength={NAME_MAX_LENGTH}
          placeholder={t('auth.fields.firstNamePlaceholder')}
          {...field('firstName')}
        />
        <TextField
          label={t('auth.fields.lastName')}
          autoComplete="family-name"
          autoCapitalize="words"
          maxLength={NAME_MAX_LENGTH}
          placeholder={t('auth.fields.lastNamePlaceholder')}
          {...field('lastName')}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t('auth.fields.email')}
          type="email"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={EMAIL_MAX_LENGTH}
          placeholder={t('auth.fields.emailPlaceholder')}
          {...field('email')}
        />
        <TextField
          label={t('auth.fields.dateOfBirth')}
          type="date"
          autoComplete="bday"
          min={MIN_BIRTH_DATE_ISO}
          max={TODAY}
          {...field('dateOfBirth')}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t('auth.fields.password')}
          type="password"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder={t('auth.fields.newPasswordPlaceholder')}
          {...field('password')}
        >
          <PasswordStrengthMeter password={values.password} />
        </TextField>
        <TextField
          label={t('auth.fields.confirmPassword')}
          type="password"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX_LENGTH}
          placeholder={t('auth.fields.confirmPasswordPlaceholder')}
          {...field('confirmPassword')}
        />
      </div>
      <Button type="submit" loading={loading}>
        {loading ? t('auth.register.submitting') : t('auth.register.submit')}
      </Button>
      {done && <FormNotice>{t('auth.register.notice')}</FormNotice>}
    </form>
  );
}
