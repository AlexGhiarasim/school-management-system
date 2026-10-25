import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber } from './format.ts';

describe('formatDate', () => {
  it('formats a date in the language of the user', () => {
    expect(formatDate('2010-05-17', 'en')).toBe('May 17, 2010');
    expect(formatDate('2010-05-17', 'ro')).toBe('17 mai 2010');
  });

  it('does not shift the day because of the time zone', () => {
    expect(formatDate('2026-01-01', 'en')).toBe('January 1, 2026');
  });

  it('returns the original text for an invalid date', () => {
    expect(formatDate('not a date', 'en')).toBe('not a date');
  });
});

describe('formatNumber', () => {
  it('always shows two decimals with the separator of the language', () => {
    expect(formatNumber(8.333, 'en')).toBe('8.33');
    expect(formatNumber(8.333, 'ro')).toBe('8,33');
    expect(formatNumber(7, 'en')).toBe('7.00');
  });
});
