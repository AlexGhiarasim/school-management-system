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
