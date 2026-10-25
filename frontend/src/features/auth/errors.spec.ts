import { describe, expect, it } from 'vitest';
import { ApiError } from '../../lib/api.ts';
import { getAuthErrorKey, isEmailTaken } from './errors.ts';

describe('getAuthErrorKey', () => {
  it.each([
    [0, 'auth.errors.network'],
    [400, 'auth.errors.serverInvalid'],
    [401, 'auth.errors.invalidCredentials'],
    [409, 'auth.errors.emailTaken'],
    [429, 'auth.errors.tooManyRequests'],
    [500, 'auth.errors.unexpected'],
  ])('maps status %i to %s', (status, key) => {
    expect(getAuthErrorKey(new ApiError(status, 'x'))).toBe(key);
  });

  it('falls back to an unexpected error for anything else', () => {
    expect(getAuthErrorKey(new Error('boom'))).toBe('auth.errors.unexpected');
  });
});

describe('isEmailTaken', () => {
  it('recognises only a conflict response', () => {
    expect(isEmailTaken(new ApiError(409, 'x'))).toBe(true);
    expect(isEmailTaken(new ApiError(401, 'x'))).toBe(false);
    expect(isEmailTaken(null)).toBe(false);
  });
});
