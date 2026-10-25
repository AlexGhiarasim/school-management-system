import { ApiError } from '../../lib/api.ts';

export function isEmailTaken(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}

export function getAuthErrorKey(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return 'auth.errors.network';
      case 400:
        return 'auth.errors.serverInvalid';
      case 401:
        return 'auth.errors.invalidCredentials';
      case 409:
        return 'auth.errors.emailTaken';
      case 429:
        return 'auth.errors.tooManyRequests';
    }
  }

  return 'auth.errors.unexpected';
}
