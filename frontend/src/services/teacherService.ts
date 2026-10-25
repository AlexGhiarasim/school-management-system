import type {
  ClassStudent,
  GradeInput,
  Subject,
  TeacherClass,
  TeacherGrade,
} from '../features/teacher/types.ts';
import { authedRequest } from '../lib/authedRequest.ts';
import type { Paginated } from '../types/api.ts';

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const teacherService = {
  getClasses: () => authedRequest<TeacherClass[]>('/teachers/me/classes'),

  getClassStudents: (classId: number, page: number, limit = PAGE_SIZE) =>
    authedRequest<Paginated<ClassStudent>>(
      `/classes/${classId}/students?page=${page}&limit=${limit}`,
    ),

  getAllClassStudents: (classId: number) =>
    teacherService.getClassStudents(classId, 1, MAX_PAGE_SIZE),

  getSubjects: () =>
    authedRequest<Paginated<Subject>>(`/subjects?limit=${MAX_PAGE_SIZE}`),

  getStudentGrades: (studentId: number, page: number, subjectId?: number) =>
    authedRequest<Paginated<TeacherGrade>>(
      `/grades?studentId=${studentId}&page=${page}&limit=${PAGE_SIZE}${
        subjectId ? `&subjectId=${subjectId}` : ''
      }`,
    ),

  createGrade: (studentId: number, input: GradeInput) =>
    authedRequest<TeacherGrade>('/grades', {
      method: 'POST',
      body: { studentId, ...input },
    }),

  updateGrade: (gradeId: number, input: GradeInput) =>
    authedRequest<TeacherGrade>(`/grades/${gradeId}`, {
      method: 'PATCH',
      body: input,
    }),
};
