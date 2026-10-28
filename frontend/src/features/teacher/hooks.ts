import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { teacherService } from '../../services/teacherService.ts';
import type { GradeInput } from './types.ts';

export const teacherKeys = {
  classes: ['teacher', 'classes'] as const,
  classStudents: (classId: number, page: number) =>
    ['teacher', 'classes', classId, 'students', page] as const,
  allClassStudents: (classId: number) =>
    ['teacher', 'classes', classId, 'students', 'all'] as const,
  classTeaching: (classId: number) =>
    ['teacher', 'classes', classId, 'teaching'] as const,
  subjects: ['teacher', 'subjects'] as const,
  grades: ['teacher', 'grades'] as const,
  studentGrades: (studentId: number) =>
    ['teacher', 'grades', studentId] as const,
};

export function useTeacherClasses() {
  return useQuery({
    queryKey: teacherKeys.classes,
    queryFn: teacherService.getClasses,
  });
}

export function useClassStudents(classId: number, page: number) {
  return useQuery({
    queryKey: teacherKeys.classStudents(classId, page),
    queryFn: () => teacherService.getClassStudents(classId, page),
    enabled: Number.isInteger(classId),
    placeholderData: keepPreviousData,
  });
}

export function useAllClassStudents(classId: number) {
  return useQuery({
    queryKey: teacherKeys.allClassStudents(classId),
    queryFn: () => teacherService.getAllClassStudents(classId),
    enabled: Number.isInteger(classId),
  });
}

export function useClassTeaching(classId: number, enabled: boolean) {
  return useQuery({
    queryKey: teacherKeys.classTeaching(classId),
    queryFn: () => teacherService.getClassTeaching(classId),
    enabled: enabled && Number.isInteger(classId),
    staleTime: 5 * 60_000,
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: teacherKeys.subjects,
    queryFn: teacherService.getSubjects,
    staleTime: 5 * 60_000,
  });
}

export function useStudentGrades(studentId: number) {
  return useQuery({
    queryKey: teacherKeys.studentGrades(studentId),
    queryFn: () => teacherService.getStudentGrades(studentId),
    enabled: Number.isInteger(studentId),
  });
}

interface SaveGradeVariables {
  studentId: number;
  gradeId?: number;
  input: GradeInput;
}

export function useSaveGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, gradeId, input }: SaveGradeVariables) =>
      gradeId
        ? teacherService.updateGrade(gradeId, input)
        : teacherService.createGrade(studentId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: teacherKeys.grades }),
  });
}
