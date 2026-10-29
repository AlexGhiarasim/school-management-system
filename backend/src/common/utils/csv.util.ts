const DELIMITERS = [';', ',', '\t'] as const;

export interface CsvTable {
  headers: string[];
  rows: string[][];
}

// Spreadsheet programs write ";" in Romanian and "," in English, so the
// delimiter is read from the first line: the one that appears most often.
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  let best: string = DELIMITERS[0];
  let bestCount = -1;

  for (const delimiter of DELIMITERS) {
    const count = firstLine.split(delimiter).length - 1;

    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  }

  return best;
}

// Reads CSV with quoted fields ("a;b", "he said ""hi""") and any line ending.
export function parseCsv(input: string): CsvTable {
  const text = input.replace(/^﻿/, '');
  const delimiter = detectDelimiter(text);
  const records: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  const endField = () => {
    row.push(field.trim());
    field = '';
  };
  const endRow = () => {
    endField();

    // Blank lines between records are ignored.
    if (row.some((value) => value !== '')) {
      records.push(row);
    }

    row = [];
  };

  for (let index = 0; index < text.length; index++) {
    const char = text[index];

    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      endField();
    } else if (char === '\n') {
      endRow();
    } else if (char !== '\r') {
      field += char;
    }
  }

  endRow();

  const [headers = [], ...rows] = records;

  return { headers, rows };
}
