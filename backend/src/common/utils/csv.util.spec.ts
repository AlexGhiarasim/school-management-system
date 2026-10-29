import { parseCsv } from './csv.util.js';

describe('parseCsv', () => {
  it('reads a file with ";" like Romanian spreadsheets write it', () => {
    const table = parseCsv(
      '﻿Nume;Prenume\r\nPopescu;Maria\r\n\r\nIonescu;Andrei\r\n',
    );

    expect(table.headers).toEqual(['Nume', 'Prenume']);
    expect(table.rows).toEqual([
      ['Popescu', 'Maria'],
      ['Ionescu', 'Andrei'],
    ]);
  });

  it('reads "," and quoted fields', () => {
    const table = parseCsv('name,note\n"Arte, plastice","He said ""hi"""\n');

    expect(table.headers).toEqual(['name', 'note']);
    expect(table.rows).toEqual([['Arte, plastice', 'He said "hi"']]);
  });
});
