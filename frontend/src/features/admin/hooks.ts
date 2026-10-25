import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminService } from '../../services/adminService.ts';
import type {
  AdminStudent,
  NewStudentInput,
  StudentFilters,
  StudentInput,
} from './types.ts';

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

function useRefreshAdminData() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminKeys.students }),
      queryClient.invalidateQueries({ queryKey: adminKeys.classes }),
    ]);
}

interface SaveStudentVariables {
  student: AdminStudent | null;
  input: NewStudentInput | (StudentInput & { classId?: number });
}

export function useSaveStudent() {
  const refresh = useRefreshAdminData();

  return useMutation({
    mutationFn: async ({ student, input }: SaveStudentVariables) => {
      if (!student) {
        return adminService.createStudent(input as NewStudentInput);
      }

      const { classId, ...profile } = input;
      await adminService.updateStudent(student.id, profile);

      if ((student.class?.id ?? null) !== (classId ?? null)) {
        await adminService.assignStudentClass(student.id, classId ?? null);
      }
    },
    onSuccess: refresh,
  });
}

export function useDeleteStudent() {
  const refresh = useRefreshAdminData();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteStudent(id),
    onSuccess: refresh,
  });
}
