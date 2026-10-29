import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { RowError } from './import.types.js';

// Turns a failed rule of a DTO into a short code.
function codeOf(property: string, constraints: string[]): string {
  switch (property) {
    case 'email':
      return 'email';
    case 'phone':
      return 'phone';
    case 'password':
      return 'password';
    case 'dateOfBirth':
      return 'date';
    case 'firstName':
    case 'lastName':
      return constraints.includes('matches') ? 'nameChars' : 'nameLength';
    default:
      return constraints.includes('maxLength') ? 'tooLong' : 'invalid';
  }
}

export function missing(
  values: Record<string, string>,
  fields: string[],
): RowError[] {
  return fields
    .filter((field) => !values[field])
    .map((field) => ({ field, code: 'required' }));
}

// Checks a row with the same rules as the form of the application.
export function validateWith<T extends object>(
  dto: new () => T,
  plain: Record<string, unknown>,
  skip: RowError[],
): { instance: T; errors: RowError[] } {
  const instance = plainToInstance(dto, plain);
  const skipped = new Set(skip.map(({ field }) => field));
  const errors = validateSync(instance, { whitelist: true })
    .filter(({ property }) => !skipped.has(property))
    .map(({ property, constraints }) => ({
      field: property,
      code: codeOf(property, Object.keys(constraints ?? {})),
    }));

  return { instance, errors };
}

const DATE_FORMATS = [
  /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/,
];

// Accepts 2010-05-17 and 17.05.2010 (also with / or -), returns 2010-05-17.
export function parseDate(text: string): string | null {
  const iso = DATE_FORMATS[0].exec(text);
  const local = DATE_FORMATS[1].exec(text);
  const parts = iso
    ? [iso[1], iso[2], iso[3]]
    : local
      ? [local[3], local[2], local[1]]
      : null;

  if (!parts) return null;

  const [year, month, day] = parts.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Rejects dates that do not exist, such as 31.02.2010.
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date.toISOString().slice(0, 10)
    : null;
}
