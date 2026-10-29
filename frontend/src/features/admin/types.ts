import type { Role } from '../auth/types.ts';

export interface AdminStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth: string;
  isActive: boolean;
  class: { id: number; name: string } | null;
}

export interface AdminClass {
  id: number;
  name: string;
  teacher: { id: number; firstName: string; lastName: string } | null;
  studentCount: number;
}

export const NO_CLASS_FILTER = 'none';

export interface StudentFilters {
  page: number;
  search: string;
  classFilter: string;
}

export interface StudentInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
}

export interface NewStudentInput extends StudentInput {
  password: string;
  classId?: number;
}

export interface ListFilters {
  page: number;
  search: string;
}

export interface AdminAccount {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminTeacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  isActive: boolean;
}

export interface TeacherInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface NewTeacherInput extends TeacherInput {
  password: string;
}

export interface AdminSubject {
  id: number;
  name: string;
}

export interface SubjectInput {
  name: string;
}

export interface ClassInput {
  name: string;
  teacherId?: number;
}

export interface AdminGrade {
  id: number;
  value: number;
  date: string;
  subject: { id: number; name: string };
  student: { id: number; firstName: string; lastName: string };
  teacher: { id: number; firstName: string; lastName: string } | null;
}

export interface GradeFilters {
  page: number;
  classId: string;
  studentId: string;
  subjectId: string;
}

export interface GradeEditInput {
  subjectId: number;
  value: number;
  date: string;
}

export interface StudentResult {
  studentId: number;
  firstName: string;
  lastName: string;
  className: string | null;
  average: number;
}

export interface Statistics {
  totals: { students: number; gradedStudents: number; grades: number };
  passRate: number | null;
  distribution: { value: number; count: number }[];
  byClass: {
    classId: number;
    name: string;
    average: number | null;
    students: number;
  }[];
  bySubject: {
    subjectId: number;
    name: string;
    average: number | null;
    grades: number;
  }[];
  trend: { weekStart: string; average: number | null; grades: number }[];
  topStudents: StudentResult[];
  atRisk: (Omit<StudentResult, 'average'> & {
    failingSubjects: { subject: string; average: number }[];
  })[];
}

export type GradeAuditAction = 'CREATED' | 'UPDATED' | 'DELETED';

export interface GradeChange {
  id: number;
  gradeId: number;
  action: GradeAuditAction;
  createdAt: string;
  actor: { name: string; role: Role } | null;
  studentId: number | null;
  studentName: string;
  subjectName: string;
  previousSubjectName: string | null;
  oldValue: number | null;
  newValue: number | null;
  oldDate: string | null;
  newDate: string | null;
}

export interface TeachingAssignment {
  id: number;
  subject: { id: number; name: string };
  teacher: { id: number; firstName: string; lastName: string };
}

export type ImportKind = 'students' | 'teachers' | 'classes' | 'subjects';

export type ImportFileError =
  | { code: 'empty' }
  | { code: 'tooManyRows'; max: number }
  | { code: 'missingColumns'; columns: string[] };

export interface ImportRow {
  line: number;
  values: Record<string, string>;
  errors: { field: string; code: string }[];
}

export interface ImportPreview {
  fileError?: ImportFileError;
  ignoredColumns: string[];
  total: number;
  valid: number;
  invalid: number;
  rows: ImportRow[];
}

export interface ImportResult {
  created: number;
  skipped: number;
  // The accounts whose password was generated. Shown once.
  accounts: { name: string; email: string; password: string }[];
}
