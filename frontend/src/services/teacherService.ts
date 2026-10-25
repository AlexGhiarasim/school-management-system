import type { ClassStudent, TeacherClass } from '../features/teacher/types.ts';
import { authedRequest } from '../lib/authedRequest.ts';
import type { Paginated } from '../types/api.ts';

const STUDENTS_PER_PAGE = 20;

export const teacherService = {
  getClasses: () => authedRequest<TeacherClass[]>('/teachers/me/classes'),

  getClassStudents: (classId: number, page: number) =>
    authedRequest<Paginated<ClassStudent>>(
      `/classes/${classId}/students?page=${page}&limit=${STUDENTS_PER_PAGE}`,
    ),
};
