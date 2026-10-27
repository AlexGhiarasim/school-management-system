import type { Role } from '../features/auth/types.ts';

export const paths = {
  home: '/',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  student: {
    profile: '/student',
    grades: '/student/grades',
  },
  teacher: {
    profile: '/teacher/profile',
    classes: '/teacher/classes',
    classStudents: (classId: number | string) => `/teacher/classes/${classId}`,
    studentGrades: (classId: number | string, studentId: number | string) =>
      `/teacher/classes/${classId}/students/${studentId}`,
  },
  admin: {
    profile: '/admin/profile',
    students: '/admin/students',
    teachers: '/admin/teachers',
    classes: '/admin/classes',
    classStudents: (classId: number | string) => `/admin/classes/${classId}`,
    subjects: '/admin/subjects',
    grades: '/admin/grades',
  },
} as const;

export const roleProfile: Record<Role, string> = {
  STUDENT: paths.student.profile,
  TEACHER: paths.teacher.profile,
  ADMIN: paths.admin.profile,
};

export const roleHome: Record<Role, string> = {
  STUDENT: paths.student.profile,
  TEACHER: paths.teacher.classes,
  ADMIN: paths.admin.students,
};
