import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/studentService.ts';

export const studentKeys = {
  profile: ['student', 'profile'] as const,
  grades: ['student', 'grades'] as const,
};

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
