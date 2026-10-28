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
