import type {
  ClassStudent,
  GradeInput,
  HomeroomOverview,
  Subject,
  TeacherClass,
  TeacherGrade,
} from '../features/teacher/types.ts';
import { authedRequest } from '../lib/authedRequest.ts';
import { downloadFile } from '../lib/downloadFile.ts';
import type { Paginated } from '../types/api.ts';

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const teacherService = {
  getClasses: () => authedRequest<TeacherClass[]>('/teachers/me/classes'),

  getClassStudents: (classId: number, page: number, limit = PAGE_SIZE) =>
    authedRequest<Paginated<ClassStudent>>(
      `/classes/${classId}/students?page=${page}&limit=${limit}`,
    ),

  getHomeroomOverview: (classId: number) =>
    authedRequest<HomeroomOverview>(`/classes/${classId}/overview`),

  exportClassGrades: (classId: number, language: string) =>
    downloadFile(
      `/grades/export?classId=${classId}&language=${language}`,
      'grades.csv',
    ),

  getAllClassStudents: (classId: number) =>
    teacherService.getClassStudents(classId, 1, MAX_PAGE_SIZE),

  getSubjects: () =>
    authedRequest<Paginated<Subject>>(`/subjects?limit=${MAX_PAGE_SIZE}`),

  getStudentGrades: (studentId: number) =>
    authedRequest<Paginated<TeacherGrade>>(
      `/grades?studentId=${studentId}&limit=${MAX_PAGE_SIZE}`,
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
