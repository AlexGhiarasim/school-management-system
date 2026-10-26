import { Route, Routes } from 'react-router';
import { AppLayout } from '../layouts/AppLayout.tsx';
import HomePage from '../pages/HomePage.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';
import AdminClassesPage from '../pages/admin/AdminClassesPage.tsx';
import AdminClassStudentsPage from '../pages/admin/AdminClassStudentsPage.tsx';
import AdminGradesPage from '../pages/admin/AdminGradesPage.tsx';
import AdminStudentsPage from '../pages/admin/AdminStudentsPage.tsx';
import AdminSubjectsPage from '../pages/admin/AdminSubjectsPage.tsx';
import AdminTeachersPage from '../pages/admin/AdminTeachersPage.tsx';
import ClassStudentsPage from '../pages/teacher/ClassStudentsPage.tsx';
import TeacherClassesPage from '../pages/teacher/TeacherClassesPage.tsx';
import TeacherStudentGradesPage from '../pages/teacher/TeacherStudentGradesPage.tsx';
import StudentGradesPage from '../pages/student/StudentGradesPage.tsx';
import StudentProfilePage from '../pages/student/StudentProfilePage.tsx';
import { PublicOnly, RequireAuth, RequireRole } from './guards.tsx';
import { paths } from './paths.ts';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path={paths.home} element={<HomePage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route element={<RequireRole role="STUDENT" />}>
            <Route
              path={paths.student.profile}
              element={<StudentProfilePage />}
            />
            <Route
              path={paths.student.grades}
              element={<StudentGradesPage />}
            />
          </Route>

          <Route element={<RequireRole role="TEACHER" />}>
            <Route
              path={paths.teacher.classes}
              element={<TeacherClassesPage />}
            />
            <Route
              path={paths.teacher.classStudents(':classId')}
              element={<ClassStudentsPage />}
            />
            <Route
              path={paths.teacher.studentGrades(':classId', ':studentId')}
              element={<TeacherStudentGradesPage />}
            />
          </Route>

          <Route element={<RequireRole role="ADMIN" />}>
            <Route
              path={paths.admin.students}
              element={<AdminStudentsPage />}
            />
            <Route
              path={paths.admin.teachers}
              element={<AdminTeachersPage />}
            />
            <Route path={paths.admin.classes} element={<AdminClassesPage />} />
            <Route
              path={paths.admin.classStudents(':classId')}
              element={<AdminClassStudentsPage />}
            />
            <Route
              path={paths.admin.subjects}
              element={<AdminSubjectsPage />}
            />
            <Route path={paths.admin.grades} element={<AdminGradesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
