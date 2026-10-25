import type {
  StudentGrades,
  StudentProfile,
} from '../features/student/types.ts';
import { authedRequest } from '../lib/authedRequest.ts';

export const studentService = {
  getProfile: () => authedRequest<StudentProfile>('/students/me'),
  getGrades: () => authedRequest<StudentGrades>('/grades/me'),
};
