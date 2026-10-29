import type { Role } from '../features/auth/types.ts';
import { paths } from '../routes/paths.ts';

export interface NavItem {
  to: string;
  labelKey: string;
  end?: boolean;
  // Shown only to a teacher who leads a class.
  homeroomOnly?: boolean;
}

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  STUDENT: [
    { to: paths.student.profile, labelKey: 'nav.student.profile' },
    { to: paths.student.grades, labelKey: 'nav.student.grades' },
  ],
  TEACHER: [
    { to: paths.teacher.profile, labelKey: 'nav.teacher.profile' },
    { to: paths.teacher.classes, labelKey: 'nav.teacher.classes', end: false },
    {
      to: paths.teacher.homeroom,
      labelKey: 'nav.teacher.homeroom',
      end: false,
      homeroomOnly: true,
    },
  ],
  ADMIN: [
    { to: paths.admin.profile, labelKey: 'nav.admin.profile' },
    { to: paths.admin.statistics, labelKey: 'nav.admin.statistics' },
    { to: paths.admin.students, labelKey: 'nav.admin.students', end: false },
    { to: paths.admin.teachers, labelKey: 'nav.admin.teachers' },
    { to: paths.admin.classes, labelKey: 'nav.admin.classes', end: false },
    { to: paths.admin.subjects, labelKey: 'nav.admin.subjects' },
    { to: paths.admin.grades, labelKey: 'nav.admin.grades' },
    { to: paths.admin.activity, labelKey: 'nav.admin.activity' },
  ],
};
