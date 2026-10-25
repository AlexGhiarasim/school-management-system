import { apiRequest } from './api.ts';
import { getToken } from './tokenStorage.ts';

type Options = Parameters<typeof apiRequest>[1];

export function authedRequest<T>(path: string, options: Options = {}) {
  return apiRequest<T>(path, { ...options, token: getToken() ?? undefined });
}
