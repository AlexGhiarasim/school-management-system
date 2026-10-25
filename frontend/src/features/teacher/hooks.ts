import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { teacherService } from '../../services/teacherService.ts';

export const teacherKeys = {
  classes: ['teacher', 'classes'] as const,
  classStudents: (classId: number, page: number) =>
    ['teacher', 'classes', classId, 'students', page] as const,
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
