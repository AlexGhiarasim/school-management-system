import type { Statistics } from '../admin/types.ts';

export interface TeacherClass {
  id: number;
  name: string;
  studentCount: number;
  isHomeroom: boolean;
  subjects: { id: number; name: string }[];
}

export interface ClassStudent {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone?: string | null;
}

export interface ClassTeaching {
  id: number;
  subject: { id: number; name: string };
  teacher: { id: number; firstName: string; lastName: string };
}

export interface Subject {
  id: number;
  name: string;
}

export interface TeacherGrade {
  id: number;
  value: number;
  date: string;
  subject: Subject;
  student: { id: number; firstName: string; lastName: string };
  teacher: { id: number; firstName: string; lastName: string } | null;
}

export interface GradeInput {
  subjectId: number;
  value: number;
  date: string;
}

export interface FailingSubject {
  subject: string;
  average: number;
}

export interface HomeroomStudent {
  studentId: number;
  firstName: string;
  lastName: string;
  // Null while the student has no grades.
  average: number | null;
  grades: number;
  failingSubjects: FailingSubject[];
}

export interface HomeroomOverview {
  id: number;
  name: string;
  studentCount: number;
  statistics: Pick<
    Statistics,
    | 'totals'
    | 'passRate'
    | 'distribution'
    | 'bySubject'
    | 'trend'
    | 'topStudents'
    | 'atRisk'
  >;
  students: HomeroomStudent[];
  teaching: ClassTeaching[];
}
