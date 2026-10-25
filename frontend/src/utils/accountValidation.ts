import type { FormError } from '../hooks/useFormState.ts';
import {
  hasLetterAndDigit,
  isNameTooLong,
  isPasswordTooLong,
  isValidName,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from './validators.ts';

export function validateName(
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

export function validatePassword(password: string): FormError | undefined {
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
