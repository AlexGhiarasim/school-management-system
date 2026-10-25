import { describe, expect, it } from 'vitest';
import {
  hasLetterAndDigit,
  isNameTooLong,
  isPasswordTooLong,
  isValidBirthDate,
  isValidEmail,
  isValidName,
} from './validators.ts';

describe('isValidEmail', () => {
  it.each(['maria.popescu@scoala.test', 'a@b.ro', ' ion@scoala.ro '])(
    'accepts %j',
    (value) => {
      expect(isValidEmail(value)).toBe(true);
    },
  );

  it.each([
    '',
    'maria',
    'maria@',
    '@scoala.ro',
    'maria@scoala',
    'a b@c.ro',
    'a@b.c',
  ])('rejects %j', (value) => {
    expect(isValidEmail(value)).toBe(false);
  });

  it('rejects an address longer than 255 characters', () => {
    expect(isValidEmail(`${'a'.repeat(250)}@scoala.ro`)).toBe(false);
  });
});

describe('isValidName', () => {
  it.each(['Maria', 'Ștefan-Ionuț', "O'Neill", 'Ana Maria', 'Jr.'])(
    'accepts %j',
    (value) => {
      expect(isValidName(value)).toBe(true);
    },
  );

  it.each(['', 'M', 'Maria1', '<script>', '-Maria', '  '])(
    'rejects %j',
    (value) => {
      expect(isValidName(value)).toBe(false);
    },
  );

  it('flags names longer than 100 characters', () => {
    expect(isNameTooLong('a'.repeat(101))).toBe(true);
    expect(isNameTooLong('a'.repeat(100))).toBe(false);
  });
});

describe('password rules', () => {
  it('requires a letter and a digit', () => {
    expect(hasLetterAndDigit('Parola123')).toBe(true);
    expect(hasLetterAndDigit('doarlitere')).toBe(false);
    expect(hasLetterAndDigit('12345678')).toBe(false);
  });

  it('limits the password to 72 bytes, not characters', () => {
    expect(isPasswordTooLong('a'.repeat(72))).toBe(false);
    expect(isPasswordTooLong('a'.repeat(73))).toBe(true);
    expect(isPasswordTooLong(`${'ă'.repeat(37)}1`)).toBe(true);
  });
});

describe('isValidBirthDate', () => {
  it('accepts a past date', () => {
    expect(isValidBirthDate('2010-05-17')).toBe(true);
  });

  it.each(['', 'not-a-date', '1899-12-31', '2999-01-01'])(
    'rejects %j',
    (value) => {
      expect(isValidBirthDate(value)).toBe(false);
    },
  );
});
