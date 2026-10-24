import type { Role } from '../../generated/prisma/enums.js';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: Role;
  teacherId: number | null;
  studentId: number | null;
}
