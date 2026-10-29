import { BadRequestException, Injectable } from '@nestjs/common';
import { parseCsv } from '../../common/utils/csv.util.js';
import { PrismaService } from '../../database/prisma.service.js';
import { BOM, escapeField } from '../grades/grades-csv.util.js';
import {
  MAX_IMPORT_ROWS,
  type ImportKind,
  type ImportLanguage,
  type KindDefinition,
  type RawRow,
  type ValidatedRow,
} from './import.types.js';
import { classesKind } from './kinds/classes.kind.js';
import { studentsKind } from './kinds/students.kind.js';
import { subjectsKind } from './kinds/subjects.kind.js';
import { teachersKind } from './kinds/teachers.kind.js';

const KINDS: Record<ImportKind, KindDefinition> = {
  students: studentsKind,
  teachers: teachersKind,
  classes: classesKind,
  subjects: subjectsKind,
};

// "Data nașterii", "date_of_birth" and "Date of birth" all become the same.
function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export type FileError =
  | { code: 'empty' }
  | { code: 'tooManyRows'; max: number }
  | { code: 'missingColumns'; columns: string[] };

interface Prepared {
  fileError?: FileError;
  ignoredColumns: string[];
  rows: ValidatedRow[];
}

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  // Checks the file and tells what would happen. Nothing is saved.
  async preview(kind: ImportKind, content: string) {
    const { fileError, ignoredColumns, rows } = await this.prepare(
      kind,
      content,
    );
    const valid = rows.filter(({ errors }) => errors.length === 0).length;

    return {
      fileError,
      ignoredColumns,
      total: rows.length,
      valid,
      invalid: rows.length - valid,
      rows: rows.map(({ line, values, errors }) => ({ line, values, errors })),
    };
  }

  // The file is checked again, so a changed or doctored preview cannot add
  // anything. The rows with errors are skipped, the others are saved together.
  async commit(kind: ImportKind, content: string) {
    const { fileError, rows } = await this.prepare(kind, content);

    if (fileError) {
      throw new BadRequestException(
        `The file cannot be imported: ${fileError.code}`,
      );
    }

    const valid = rows.filter(({ errors }) => errors.length === 0);

    if (valid.length === 0) {
      throw new BadRequestException('There is no valid row to import');
    }

    const accounts = await KINDS[kind].save(valid, this.prisma);

    return {
      created: valid.length,
      skipped: rows.length - valid.length,
      accounts,
    };
  }

  // A file to start from: the headers and two example rows.
  template(kind: ImportKind, language: ImportLanguage = 'ro'): string {
    const { columns } = KINDS[kind];
    const separator = language === 'ro' ? ';' : ',';
    const lines = [
      columns.map(({ header }) => header[language]),
      ...[0, 1].map((index) => columns.map(({ examples }) => examples[index])),
    ];

    return (
      BOM +
      lines
        .map((line) =>
          line.map((field) => escapeField(field, separator)).join(separator),
        )
        .join('\r\n') +
      '\r\n'
    );
  }

  private async prepare(kind: ImportKind, content: string): Promise<Prepared> {
    const { columns, validate } = KINDS[kind];
    const { headers, rows } = parseCsv(content);

    if (rows.length === 0) {
      return { fileError: { code: 'empty' }, ignoredColumns: [], rows: [] };
    }

    if (rows.length > MAX_IMPORT_ROWS) {
      return {
        fileError: { code: 'tooManyRows', max: MAX_IMPORT_ROWS },
        ignoredColumns: [],
        rows: [],
      };
    }

    const keyOfColumn = new Map<number, string>();
    const ignoredColumns: string[] = [];

    headers.forEach((header, index) => {
      const column = columns.find(({ aliases }) =>
        aliases.includes(normalizeHeader(header)),
      );

      // A column that appears twice is read once, from the first one.
      if (column && ![...keyOfColumn.values()].includes(column.key)) {
        keyOfColumn.set(index, column.key);
      } else if (header) {
        ignoredColumns.push(header);
      }
    });

    const found = new Set(keyOfColumn.values());
    const missing = columns
      .filter(({ key, required }) => required && !found.has(key))
      .map(({ key }) => key);

    if (missing.length > 0) {
      return {
        fileError: { code: 'missingColumns', columns: missing },
        ignoredColumns,
        rows: [],
      };
    }

    const raw: RawRow[] = rows.map((cells, position) => ({
      // The header is line 1, like in a spreadsheet.
      line: position + 2,
      values: Object.fromEntries(
        columns
          .map(({ key }) => [key, ''])
          .concat(
            [...keyOfColumn].map(([index, key]) => [key, cells[index] ?? '']),
          ),
      ),
    }));

    return { ignoredColumns, rows: await validate(raw, this.prisma) };
  }
}
