import {
  NO_CLASS_FILTER,
  type AdminAccount,
  type AdminClass,
  type AdminGrade,
  type GradeAuditAction,
  type ImportKind,
  type ImportPreview,
  type ImportResult,
  type GradeChange,
  type ClassInput,
  type GradeEditInput,
  type GradeFilters,
  type AdminStudent,
  type AdminSubject,
  type AdminTeacher,
  type ListFilters,
  type Statistics,
  type NewStudentInput,
  type NewTeacherInput,
  type StudentFilters,
  type StudentInput,
  type SubjectInput,
  type TeacherInput,
} from '../features/admin/types.ts';
import type { ClassStudent } from '../features/teacher/types.ts';
import { authedRequest } from '../lib/authedRequest.ts';
import { downloadFile } from '../lib/downloadFile.ts';
import type { Paginated } from '../types/api.ts';

const PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function listQuery({ page, search }: ListFilters): string {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  if (search.trim()) query.set('search', search.trim());

  return query.toString();
}

export const adminService = {
  listAdmins: () => authedRequest<AdminAccount[]>('/admins'),

  listStudents: ({ page, search, classFilter }: StudentFilters) => {
    const query = new URLSearchParams(listQuery({ page, search }));

    if (classFilter === NO_CLASS_FILTER) query.set('unassigned', 'true');
    else if (classFilter) query.set('classId', classFilter);
    else query.set('assigned', 'true');

    return authedRequest<Paginated<AdminStudent>>(`/students?${query}`);
  },

  createStudent: (input: NewStudentInput) =>
    authedRequest<AdminStudent>('/students', { method: 'POST', body: input }),

  updateStudent: (id: number, input: StudentInput) =>
    authedRequest<AdminStudent>(`/students/${id}`, {
      method: 'PATCH',
      body: input,
    }),

  assignStudentClass: (id: number, classId: number | null) =>
    authedRequest<AdminStudent>(`/students/${id}/class`, {
      method: 'PATCH',
      body: { classId },
    }),

  deleteStudent: (id: number) =>
    authedRequest<null>(`/students/${id}`, { method: 'DELETE' }),

  listClasses: () =>
    authedRequest<Paginated<AdminClass>>(`/classes?limit=${MAX_PAGE_SIZE}`),

  listClassPage: (filters: ListFilters) =>
    authedRequest<Paginated<AdminClass>>(`/classes?${listQuery(filters)}`),

  createClass: (input: ClassInput) =>
    authedRequest<AdminClass>('/classes', { method: 'POST', body: input }),

  updateClass: (id: number, name: string) =>
    authedRequest<AdminClass>(`/classes/${id}`, {
      method: 'PATCH',
      body: { name },
    }),

  assignClassTeacher: (id: number, teacherId: number | null) =>
    authedRequest<AdminClass>(`/classes/${id}/teacher`, {
      method: 'PATCH',
      body: { teacherId },
    }),

  deleteClass: (id: number) =>
    authedRequest<null>(`/classes/${id}`, { method: 'DELETE' }),

  listAllTeachers: () =>
    authedRequest<Paginated<AdminTeacher>>(`/teachers?limit=${MAX_PAGE_SIZE}`),

  listClassStudents: (classId: number, page: number) =>
    authedRequest<Paginated<ClassStudent>>(
      `/classes/${classId}/students?page=${page}&limit=${PAGE_SIZE}`,
    ),

  listGrades: ({ page, classId, studentId, subjectId }: GradeFilters) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    if (classId) query.set('classId', classId);
    if (studentId) query.set('studentId', studentId);
    if (subjectId) query.set('subjectId', subjectId);

    return authedRequest<Paginated<AdminGrade>>(`/grades?${query}`);
  },

  previewImport: (kind: ImportKind, content: string) =>
    authedRequest<ImportPreview>(`/imports/${kind}/preview`, {
      method: 'POST',
      body: { content },
    }),

  commitImport: (kind: ImportKind, content: string) =>
    authedRequest<ImportResult>(`/imports/${kind}`, {
      method: 'POST',
      body: { content },
    }),

  downloadImportTemplate: (kind: ImportKind, language: string) =>
    downloadFile(
      `/imports/${kind}/template?language=${language}`,
      `${kind}-template.csv`,
    ),

  exportGrades: (
    { classId, studentId, subjectId }: Omit<GradeFilters, 'page'>,
    language: string,
  ) => {
    const query = new URLSearchParams({ language });

    if (classId) query.set('classId', classId);
    if (studentId) query.set('studentId', studentId);
    if (subjectId) query.set('subjectId', subjectId);

    return downloadFile(`/grades/export?${query}`, 'grades.csv');
  },

  getStatistics: (classId: string) =>
    authedRequest<Statistics>(
      classId ? `/statistics?classId=${classId}` : '/statistics',
    ),

  listGradeHistory: (page: number, action: GradeAuditAction | '') => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    if (action) query.set('action', action);

    return authedRequest<Paginated<GradeChange>>(`/grades/history?${query}`);
  },

  getGradeHistory: (gradeId: number) =>
    authedRequest<GradeChange[]>(`/grades/${gradeId}/history`),

  getStudent: (id: number) => authedRequest<AdminStudent>(`/students/${id}`),

  listStudentGrades: (studentId: number) =>
    authedRequest<Paginated<AdminGrade>>(
      `/grades?studentId=${studentId}&limit=${MAX_PAGE_SIZE}`,
    ),

  updateGrade: (id: number, input: GradeEditInput) =>
    authedRequest<AdminGrade>(`/grades/${id}`, {
      method: 'PATCH',
      body: input,
    }),

  deleteGrade: (id: number) =>
    authedRequest<null>(`/grades/${id}`, { method: 'DELETE' }),

  listAllSubjects: () =>
    authedRequest<Paginated<AdminSubject>>(`/subjects?limit=${MAX_PAGE_SIZE}`),

  listAllClassStudents: (classId: number) =>
    authedRequest<Paginated<ClassStudent>>(
      `/classes/${classId}/students?limit=${MAX_PAGE_SIZE}`,
    ),

  listTeachers: (filters: ListFilters) =>
    authedRequest<Paginated<AdminTeacher>>(`/teachers?${listQuery(filters)}`),

  createTeacher: (input: NewTeacherInput) =>
    authedRequest<AdminTeacher>('/teachers', { method: 'POST', body: input }),

  updateTeacher: (id: number, input: TeacherInput) =>
    authedRequest<AdminTeacher>(`/teachers/${id}`, {
      method: 'PATCH',
      body: input,
    }),

  deleteTeacher: (id: number) =>
    authedRequest<null>(`/teachers/${id}`, { method: 'DELETE' }),

  listSubjects: (filters: ListFilters) =>
    authedRequest<Paginated<AdminSubject>>(`/subjects?${listQuery(filters)}`),

  createSubject: (input: SubjectInput) =>
    authedRequest<AdminSubject>('/subjects', { method: 'POST', body: input }),

  updateSubject: (id: number, input: SubjectInput) =>
    authedRequest<AdminSubject>(`/subjects/${id}`, {
      method: 'PATCH',
      body: input,
    }),

  deleteSubject: (id: number) =>
    authedRequest<null>(`/subjects/${id}`, { method: 'DELETE' }),
};
