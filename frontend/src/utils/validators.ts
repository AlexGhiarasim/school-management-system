export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const EMAIL_MAX_LENGTH = 255;
export const PHONE_MAX_LENGTH = 20;

const PHONE_PATTERN = /^\+?\d[\d ()-]{5,18}\d$/;

// A phone number is optional, so an empty value is valid.
export function isValidPhone(value: string): boolean {
  const phone = value.trim();

  return phone === '' || PHONE_PATTERN.test(phone);
}
export const MIN_BIRTH_DATE_ISO = '1900-01-01';

const EMAIL_PATTERN = /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/;
const NAME_PATTERN = /^\p{L}[\p{L} '.-]*$/u;
const MIN_BIRTH_DATE = new Date(MIN_BIRTH_DATE_ISO);

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
}

export function isValidName(value: string): boolean {
  const name = value.trim();

  return (
    name.length >= NAME_MIN_LENGTH &&
    name.length <= NAME_MAX_LENGTH &&
    NAME_PATTERN.test(name)
  );
}

export function isNameTooLong(value: string): boolean {
  return value.trim().length > NAME_MAX_LENGTH;
}

export function hasLetterAndDigit(value: string): boolean {
  return /\p{L}/u.test(value) && /\d/.test(value);
}

export function isPasswordTooLong(password: string): boolean {
  return new TextEncoder().encode(password).length > PASSWORD_MAX_LENGTH;
}

export function isValidBirthDate(value: string): boolean {
  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    date >= MIN_BIRTH_DATE &&
    date <= new Date()
  );
}

export const GRADE_MIN = 1;
export const GRADE_MAX = 10;

export function isValidGradeValue(value: string): boolean {
  const grade = Number(value);

  return (
    value.trim() !== '' &&
    Number.isInteger(grade) &&
    grade >= GRADE_MIN &&
    grade <= GRADE_MAX
  );
}

export function isValidGradeDate(value: string): boolean {
  const date = new Date(value);

  return !Number.isNaN(date.getTime()) && date <= new Date();
}
