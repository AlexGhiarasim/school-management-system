import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminService } from '../../services/adminService.ts';
import type {
  AdminStudent,
  AdminTeacher,
  ListFilters,
  NewStudentInput,
  NewTeacherInput,
  StudentFilters,
  StudentInput,
  SubjectInput,
  TeacherInput,
} from './types.ts';

export const adminKeys = {
  students: ['admin', 'students'] as const,
  studentList: (filters: StudentFilters) =>
    ['admin', 'students', filters] as const,
  classes: ['admin', 'classes'] as const,
  teachers: ['admin', 'teachers'] as const,
  teacherList: (filters: ListFilters) =>
    ['admin', 'teachers', filters] as const,
  subjects: ['admin', 'subjects'] as const,
  subjectList: (filters: ListFilters) =>
    ['admin', 'subjects', filters] as const,
};

function useRefresh(...keys: (readonly unknown[])[]) {
  const queryClient = useQueryClient();

  return () =>
    Promise.all(
      keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
}

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

interface SaveStudentVariables {
  student: AdminStudent | null;
  input: NewStudentInput | (StudentInput & { classId?: number });
}

export function useSaveStudent() {
  const refresh = useRefresh(adminKeys.students, adminKeys.classes);

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
  const refresh = useRefresh(adminKeys.students, adminKeys.classes);

  return useMutation({
    mutationFn: (id: number) => adminService.deleteStudent(id),
    onSuccess: refresh,
  });
}

export function useAdminTeachers(filters: ListFilters) {
  return useQuery({
    queryKey: adminKeys.teacherList(filters),
    queryFn: () => adminService.listTeachers(filters),
    placeholderData: keepPreviousData,
  });
}

interface SaveTeacherVariables {
  teacher: AdminTeacher | null;
  input: TeacherInput | NewTeacherInput;
}

export function useSaveTeacher() {
  const refresh = useRefresh(adminKeys.teachers, adminKeys.classes);

  return useMutation({
    mutationFn: ({ teacher, input }: SaveTeacherVariables) =>
      teacher
        ? adminService.updateTeacher(teacher.id, input)
        : adminService.createTeacher(input as NewTeacherInput),
    onSuccess: refresh,
  });
}

export function useDeleteTeacher() {
  const refresh = useRefresh(adminKeys.teachers, adminKeys.classes);

  return useMutation({
    mutationFn: (id: number) => adminService.deleteTeacher(id),
    onSuccess: refresh,
  });
}

export function useAdminSubjects(filters: ListFilters) {
  return useQuery({
    queryKey: adminKeys.subjectList(filters),
    queryFn: () => adminService.listSubjects(filters),
    placeholderData: keepPreviousData,
  });
}

interface SaveSubjectVariables {
  subjectId: number | null;
  input: SubjectInput;
}

export function useSaveSubject() {
  const refresh = useRefresh(adminKeys.subjects);

  return useMutation({
    mutationFn: ({ subjectId, input }: SaveSubjectVariables) =>
      subjectId
        ? adminService.updateSubject(subjectId, input)
        : adminService.createSubject(input),
    onSuccess: refresh,
  });
}

export function useDeleteSubject() {
  const refresh = useRefresh(adminKeys.subjects);

  return useMutation({
    mutationFn: (id: number) => adminService.deleteSubject(id),
    onSuccess: refresh,
  });
}
