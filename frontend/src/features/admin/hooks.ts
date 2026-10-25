import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService.ts';
import type { StudentFilters } from './types.ts';

export const adminKeys = {
  students: ['admin', 'students'] as const,
  studentList: (filters: StudentFilters) =>
    ['admin', 'students', filters] as const,
  classes: ['admin', 'classes'] as const,
};

export function useAdminStudents(filters: StudentFilters) {
  return useQuery({
    queryKey: adminKeys.studentList(filters),
    queryFn: () => adminService.listStudents(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminClasses() {
  return useQuery({
    queryKey: adminKeys.classes,
    queryFn: adminService.listClasses,
    staleTime: 60_000,
  });
}
