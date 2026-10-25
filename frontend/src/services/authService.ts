import { apiRequest } from '../lib/api.ts';
import type {
  CurrentUser,
  LoginResponse,
  RegisterPayload,
} from '../features/auth/types.ts';

export const authService = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (payload: RegisterPayload) =>
    apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    }),

  getMe: (token: string) => apiRequest<CurrentUser>('/auth/me', { token }),
};
