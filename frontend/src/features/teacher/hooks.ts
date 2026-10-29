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
  // Under "grades" so that a saved grade refreshes the overview too.
  homeroom: (classId: number) =>
    ['teacher', 'grades', 'homeroom', classId] as const,
  subjects: ['teacher', 'subjects'] as const,
  grades: ['teacher', 'grades'] as const,
  studentGrades: (studentId: number) =>
    ['teacher', 'grades', studentId] as const,
};

export function useTeacherClasses(enabled = true) {
  return useQuery({
    queryKey: teacherKeys.classes,
    queryFn: teacherService.getClasses,
    enabled,
  });
}

// The class the teacher leads, if any.
export function useHomeroomClass(enabled = true) {
  const classes = useTeacherClasses(enabled);

  return {
    ...classes,
    homeroomClass: classes.data?.find((item) => item.isHomeroom),
  };
}

export function useHomeroomOverview(classId: number | undefined) {
  return useQuery({
    queryKey: teacherKeys.homeroom(classId ?? -1),
    queryFn: () => teacherService.getHomeroomOverview(classId ?? -1),
    enabled: classId !== undefined,
    placeholderData: keepPreviousData,
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
