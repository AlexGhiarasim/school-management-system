import type { Role } from '../../../generated/prisma/enums.js';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
  iat?: number;
}
