export interface StudentProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  isActive: boolean;
  class: { id: number; name: string } | null;
}

export interface SubjectAverage {
  subjectId: number;
  subject: string;
  average: number;
  count: number;
}

export interface StudentGrade {
  id: number;
  value: number;
  date: string;
  subject: { id: number; name: string };
  teacher: { id: number; firstName: string; lastName: string } | null;
}

export interface StudentGrades {
  average: number | null;
  bySubject: SubjectAverage[];
  grades: StudentGrade[];
}
