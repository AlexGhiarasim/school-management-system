import { describe, expect, it } from 'vitest';
import { ApiError } from './api.ts';
import { createQueryClient } from './queryClient.ts';

type RetryFn = (failureCount: number, error: Error) => boolean;

const retry = createQueryClient().getDefaultOptions().queries!.retry as RetryFn;

describe('query retry policy', () => {
  it.each([400, 401, 403, 404, 409])(
    'does not retry a %i response',
    (status) => {
      expect(retry(0, new ApiError(status, 'x'))).toBe(false);
    },
  );

  it('retries server errors and unreachable servers', () => {
    expect(retry(0, new ApiError(500, 'x'))).toBe(true);
    expect(retry(1, new ApiError(0, 'x'))).toBe(true);
  });

  it('stops after two retries', () => {
    expect(retry(2, new ApiError(500, 'x'))).toBe(false);
  });
});
