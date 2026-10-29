import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { adminService } from '../../services/adminService.ts';
import type {
  AdminClass,
  AdminStudent,
  AdminTeacher,
  ClassInput,
  GradeAuditAction,
  ImportKind,
  GradeEditInput,
  GradeFilters,
  ListFilters,
  NewStudentInput,
  NewTeacherInput,
  StudentFilters,
  StudentInput,
  SubjectInput,
  TeacherInput,
} from './types.ts';

export const adminKeys = {
  admins: ['admin', 'admins'] as const,
  students: ['admin', 'students'] as const,
  studentList: (filters: StudentFilters) =>
    ['admin', 'students', filters] as const,
  classes: ['admin', 'classes'] as const,
  classList: (filters: ListFilters) =>
    ['admin', 'classes', 'list', filters] as const,
  allTeachers: ['admin', 'teachers', 'all'] as const,
  grades: ['admin', 'grades'] as const,
  gradeList: (filters: GradeFilters) => ['admin', 'grades', filters] as const,
  // Kept under "grades" so that every change to a grade refreshes them.
  statistics: (classId: string) =>
    ['admin', 'grades', 'statistics', classId] as const,
  history: (page: number, action: string) =>
    ['admin', 'grades', 'history', page, action] as const,
  gradeHistory: (gradeId: number) =>
    ['admin', 'grades', gradeId, 'history'] as const,
  studentReport: (studentId: number) =>
    ['admin', 'grades', 'report', studentId] as const,
  allSubjects: ['admin', 'subjects', 'all'] as const,
  allClassStudents: (classId: number) =>
    ['admin', 'classes', classId, 'students', 'all'] as const,
  classStudents: (classId: number, page: number) =>
    ['admin', 'classes', classId, 'students', page] as const,
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

export function useAdmins() {
  return useQuery({
    queryKey: adminKeys.admins,
    queryFn: adminService.listAdmins,
    staleTime: 60_000,
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

export function useAdminClassPage(filters: ListFilters) {
  return useQuery({
    queryKey: adminKeys.classList(filters),
    queryFn: () => adminService.listClassPage(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAllTeachers() {
  return useQuery({
    queryKey: adminKeys.allTeachers,
    queryFn: adminService.listAllTeachers,
    staleTime: 60_000,
  });
}

interface SaveClassVariables {
  schoolClass: AdminClass | null;
  input: ClassInput;
}

export function useSaveClass() {
  const refresh = useRefresh(adminKeys.classes, adminKeys.students);

  return useMutation({
    mutationFn: async ({ schoolClass, input }: SaveClassVariables) => {
      if (!schoolClass) {
        return adminService.createClass(input);
      }

      if (schoolClass.name !== input.name) {
        await adminService.updateClass(schoolClass.id, input.name);
      }

      if ((schoolClass.teacher?.id ?? null) !== (input.teacherId ?? null)) {
        await adminService.assignClassTeacher(
          schoolClass.id,
          input.teacherId ?? null,
        );
      }
    },
    onSuccess: refresh,
  });
}

export function useDeleteClass() {
  const refresh = useRefresh(adminKeys.classes, adminKeys.students);

  return useMutation({
    mutationFn: (id: number) => adminService.deleteClass(id),
    onSuccess: refresh,
  });
}

export function useAdminClassStudents(classId: number, page: number) {
  return useQuery({
    queryKey: adminKeys.classStudents(classId, page),
    queryFn: () => adminService.listClassStudents(classId, page),
    enabled: Number.isInteger(classId),
    placeholderData: keepPreviousData,
  });
}

interface AssignClassVariables {
  studentId: number;
  classId: number | null;
}

export function useAssignStudentClass() {
  const refresh = useRefresh(adminKeys.classes, adminKeys.students);

  return useMutation({
    mutationFn: ({ studentId, classId }: AssignClassVariables) =>
      adminService.assignStudentClass(studentId, classId),
    onSuccess: refresh,
  });
}

export function useAdminGrades(filters: GradeFilters) {
  return useQuery({
    queryKey: adminKeys.gradeList(filters),
    queryFn: () => adminService.listGrades(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAllSubjects() {
  return useQuery({
    queryKey: adminKeys.allSubjects,
    queryFn: adminService.listAllSubjects,
    staleTime: 60_000,
  });
}

export function useAllClassStudents(classId: number | null) {
  return useQuery({
    queryKey: adminKeys.allClassStudents(classId ?? 0),
    queryFn: () => adminService.listAllClassStudents(classId ?? 0),
    enabled: classId !== null,
  });
}

export function useEditGrade() {
  const refresh = useRefresh(adminKeys.grades);

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: GradeEditInput }) =>
      adminService.updateGrade(id, input),
    onSuccess: refresh,
  });
}

export function useDeleteGrade() {
  const refresh = useRefresh(adminKeys.grades);

  return useMutation({
    mutationFn: (id: number) => adminService.deleteGrade(id),
    onSuccess: refresh,
  });
}

export function useStatistics(classId: string) {
  return useQuery({
    queryKey: adminKeys.statistics(classId),
    queryFn: () => adminService.getStatistics(classId),
    placeholderData: keepPreviousData,
  });
}

export function useGradeHistory(page: number, action: GradeAuditAction | '') {
  return useQuery({
    queryKey: adminKeys.history(page, action),
    queryFn: () => adminService.listGradeHistory(page, action),
    placeholderData: keepPreviousData,
  });
}

export function useGradeChanges(gradeId: number) {
  return useQuery({
    queryKey: adminKeys.gradeHistory(gradeId),
    queryFn: () => adminService.getGradeHistory(gradeId),
  });
}

export function useStudentReport(studentId: number) {
  return useQuery({
    queryKey: adminKeys.studentReport(studentId),
    queryFn: async () => {
      const [student, grades] = await Promise.all([
        adminService.getStudent(studentId),
        adminService.listStudentGrades(studentId),
      ]);

      return { student, grades: grades.data };
    },
  });
}

export function useImportPreview(kind: ImportKind) {
  return useMutation({
    mutationFn: (content: string) => adminService.previewImport(kind, content),
  });
}

export function useImportCommit(kind: ImportKind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => adminService.commitImport(kind, content),
    // An import can add students, teachers and classes, so everything reloads.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}
