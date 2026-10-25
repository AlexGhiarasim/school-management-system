export type AuthMode = 'login' | 'register';

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

export interface CurrentUser extends AuthUser {
  profile: { id: number; firstName: string; lastName: string } | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  password: string;
}
