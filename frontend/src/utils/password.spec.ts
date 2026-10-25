import { describe, expect, it } from 'vitest';
import { getPasswordStrength } from './password.ts';

describe('getPasswordStrength', () => {
  it('treats passwords under 8 characters as too short', () => {
    expect(getPasswordStrength('Ab1!')).toEqual({
      score: 0,
      level: 'tooShort',
    });
  });

  it('gives at least a weak score to a plain 8 character password', () => {
    expect(getPasswordStrength('abcdefgh')).toEqual({
      score: 1,
      level: 'weak',
    });
  });

  it('rewards mixed case, digits, symbols and length', () => {
    expect(getPasswordStrength('Abcdefg1').score).toBe(2);
    expect(getPasswordStrength('Abcdefg1!').score).toBe(3);
    expect(getPasswordStrength('Abcdefg1!xyz')).toEqual({
      score: 4,
      level: 'strong',
    });
  });
});
