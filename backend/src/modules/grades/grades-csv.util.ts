export const CSV_LANGUAGES = ['ro', 'en'] as const;
export type CsvLanguage = (typeof CSV_LANGUAGES)[number];

export interface CsvGrade {
  date: string;
  className: string | null;
  student: string;
  subject: string;
  value: number;
  teacher: string | null;
}

const HEADERS: Record<CsvLanguage, string[]> = {
  ro: ['Data', 'Clasa', 'Elev', 'Materie', 'Nota', 'Profesor'],
  en: ['Date', 'Class', 'Student', 'Subject', 'Grade', 'Teacher'],
};

// Excel set to Romanian expects ";" between columns, and "," otherwise.
const SEPARATORS: Record<CsvLanguage, string> = { ro: ';', en: ',' };

// The byte order mark makes Excel read the file as UTF-8, so diacritics show.
const BOM = '﻿';

function escapeField(value: string | number, separator: string): string {
  let text = String(value);

  // A leading = + - or @ would make a spreadsheet run the cell as a formula.
  if (typeof value === 'string' && /^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return text.includes(separator) || /["\r\n]/.test(text)
    ? `"${text.replaceAll('"', '""')}"`
    : text;
}

export function toGradesCsv(grades: CsvGrade[], language: CsvLanguage): string {
  const separator = SEPARATORS[language];
  const rows = [
    HEADERS[language],
    ...grades.map((grade) => [
      grade.date,
      grade.className ?? '',
      grade.student,
      grade.subject,
      grade.value,
      grade.teacher ?? '',
    ]),
  ];

  return (
    BOM +
    rows
      .map((row) =>
        row.map((field) => escapeField(field, separator)).join(separator),
      )
      .join('\r\n') +
    '\r\n'
  );
}
