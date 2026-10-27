import { describe, expect, it } from 'vitest';
import { gradeTone } from './grades.ts';

describe('gradeTone', () => {
  it.each([
    [10, 'emerald'],
    [8, 'emerald'],
    [7, 'amber'],
    [5, 'amber'],
    [4, 'rose'],
    [1, 'rose'],
  ])('colors a grade of %i as %s', (value, color) => {
    expect(gradeTone(value)).toContain(color);
  });
});
