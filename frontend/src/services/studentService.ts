import type {
  ClassOverview,
  StudentGrades,
  StudentProfile,
} from '../features/student/types.ts';
import { authedRequest } from '../lib/authedRequest.ts';

export const studentService = {
  getProfile: () => authedRequest<StudentProfile>('/students/me'),
  getClassOverview: () => authedRequest<ClassOverview>('/students/me/class'),
  getGrades: () => authedRequest<StudentGrades>('/grades/me'),
};
