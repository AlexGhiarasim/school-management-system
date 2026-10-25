import type { Role } from '../features/auth/types.ts';

export const paths = {
  home: '/',
  student: {
    profile: '/student',
    grades: '/student/grades',
  },
  teacher: {
    classes: '/teacher/classes',
  },
  admin: {
    students: '/admin/students',
    teachers: '/admin/teachers',
    classes: '/admin/classes',
    subjects: '/admin/subjects',
    grades: '/admin/grades',
  },
} as const;

export const roleHome: Record<Role, string> = {
  STUDENT: paths.student.profile,
  TEACHER: paths.teacher.classes,
  ADMIN: paths.admin.students,
};
