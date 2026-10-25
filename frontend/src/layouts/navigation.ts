import type { Role } from '../features/auth/types.ts';
import { paths } from '../routes/paths.ts';

export interface NavItem {
  to: string;
  labelKey: string;
  end?: boolean;
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  STUDENT: [
    { to: paths.student.profile, labelKey: 'nav.student.profile' },
    { to: paths.student.grades, labelKey: 'nav.student.grades' },
  ],
  TEACHER: [
    { to: paths.teacher.classes, labelKey: 'nav.teacher.classes', end: false },
  ],
  ADMIN: [
    { to: paths.admin.students, labelKey: 'nav.admin.students' },
    { to: paths.admin.teachers, labelKey: 'nav.admin.teachers' },
    { to: paths.admin.classes, labelKey: 'nav.admin.classes' },
    { to: paths.admin.subjects, labelKey: 'nav.admin.subjects' },
    { to: paths.admin.grades, labelKey: 'nav.admin.grades' },
  ],
};
