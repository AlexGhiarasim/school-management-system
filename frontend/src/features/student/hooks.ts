import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService.ts';

export const studentKeys = {
  profile: ['student', 'profile'] as const,
  grades: ['student', 'grades'] as const,
  classOverview: ['student', 'class'] as const,
};

export function useClassOverview(enabled: boolean) {
  return useQuery({
    queryKey: studentKeys.classOverview,
    queryFn: studentService.getClassOverview,
    enabled,
  });
}

export function useStudentProfile() {
  return useQuery({
    queryKey: studentKeys.profile,
    queryFn: studentService.getProfile,
  });
}

export function useStudentGrades() {
  return useQuery({
    queryKey: studentKeys.grades,
    queryFn: studentService.getGrades,
  });
}
