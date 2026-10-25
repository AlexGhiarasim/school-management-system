import { describe, expect, it } from 'vitest';
import { averageTone, gradeTone } from './grades.ts';

describe('gradeTone', () => {
  it.each([
    [10, 'emerald'],
    [9, 'emerald'],
    [8, 'indigo'],
    [7, 'indigo'],
    [6, 'amber'],
    [5, 'amber'],
    [4, 'red'],
    [1, 'red'],
  ])('colours a grade of %i as %s', (value, colour) => {
    expect(gradeTone(value)).toContain(colour);
  });
});

describe('averageTone', () => {
  it('uses the same thresholds for averages', () => {
    expect(averageTone(9.5)).toContain('emerald');
    expect(averageTone(7.2)).toContain('indigo');
    expect(averageTone(5)).toContain('amber');
    expect(averageTone(4.99)).toContain('red');
  });
});
