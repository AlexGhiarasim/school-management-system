import { ApiError } from './api.ts';

export function getApiErrorKey(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return 'errors.network';
      case 400:
        return 'errors.invalid';
      case 403:
        return 'errors.forbidden';
      case 404:
        return 'errors.notFound';
      case 429:
        return 'errors.tooManyRequests';
    }
  }

  return 'errors.unexpected';
}
