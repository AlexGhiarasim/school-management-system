import type { PrismaService } from '../../database/prisma.service.js';

export const IMPORT_KINDS = [
  'students',
  'teachers',
  'classes',
  'subjects',
] as const;
export type ImportKind = (typeof IMPORT_KINDS)[number];

export const IMPORT_LANGUAGES = ['ro', 'en'] as const;
export type ImportLanguage = (typeof IMPORT_LANGUAGES)[number];

// A file is read in this many rows at most. Every new account costs about
// 0.1 s of password hashing, so a larger file would take too long.
export const MAX_IMPORT_ROWS = 200;

// What is wrong with one field of one row. The code is turned into a message
// by the application, in the language of the user.
export interface RowError {
  field: string;
  code: string;
}

export interface ColumnDefinition {
  key: string;
  // The header written in the template, in each language.
  header: Record<ImportLanguage, string>;
  // Other spellings of the header that are accepted, such as the English one.
  aliases: string[];
  required: boolean;
  examples: [string, string];
}

export interface RawRow {
  line: number;
  values: Record<string, string>;
}

export interface ValidatedRow extends RawRow {
  errors: RowError[];
  // What is saved. Present only when the row has no errors.
  data?: unknown;
}

// An account created by the import. The password is shown only when the
// application chose it, because the administrator has no other way to know it.
export interface CreatedAccount {
  name: string;
  email: string;
  password: string;
}

export interface KindDefinition {
  columns: ColumnDefinition[];
  validate(rows: RawRow[], prisma: PrismaService): Promise<ValidatedRow[]>;
  save(rows: ValidatedRow[], prisma: PrismaService): Promise<CreatedAccount[]>;
}
