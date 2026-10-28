import { apiRequest } from '../lib/api.ts';
import { authedRequest } from '../lib/authedRequest.ts';
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

  forgotPassword: (email: string, language: string) =>
    apiRequest<void>('/auth/forgot-password', {
      method: 'POST',
      body: { email, language },
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest<void>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    authedRequest<LoginResponse>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),
};
