import { toGradesCsv, type CsvGrade } from './grades-csv.util.js';

const grade: CsvGrade = {
  date: '2026-10-01',
  className: '9A',
  student: 'Popa Ana',
  subject: 'Matematică',
  value: 9,
  teacher: 'Laura Marin',
};

describe('toGradesCsv', () => {
  it('uses ";" and Romanian headers for Romanian', () => {
    expect(toGradesCsv([grade], 'ro')).toBe(
      '﻿Data;Clasa;Elev;Materie;Nota;Profesor\r\n' +
        '2026-10-01;9A;Popa Ana;Matematică;9;Laura Marin\r\n',
    );
  });

  it('stops a spreadsheet from running a field as a formula', () => {
    const csv = toGradesCsv([{ ...grade, subject: '=SUM(A1)' }], 'ro');

    expect(csv).toContain(";'=SUM(A1);");
  });
});
