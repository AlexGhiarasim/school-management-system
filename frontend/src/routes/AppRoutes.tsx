import { Route, Routes } from 'react-router';
import { AppLayout } from '../layouts/AppLayout.tsx';
import HomePage from '../pages/HomePage.tsx';
import NotFoundPage from '../pages/NotFoundPage.tsx';
import PlaceholderPage from '../pages/PlaceholderPage.tsx';
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
              element={<PlaceholderPage titleKey="nav.student.profile" />}
            />
            <Route
              path={paths.student.grades}
              element={<PlaceholderPage titleKey="nav.student.grades" />}
            />
          </Route>

          <Route element={<RequireRole role="TEACHER" />}>
            <Route
              path={paths.teacher.classes}
              element={<PlaceholderPage titleKey="nav.teacher.classes" />}
            />
          </Route>

          <Route element={<RequireRole role="ADMIN" />}>
            <Route
              path={paths.admin.students}
              element={<PlaceholderPage titleKey="nav.admin.students" />}
            />
            <Route
              path={paths.admin.teachers}
              element={<PlaceholderPage titleKey="nav.admin.teachers" />}
            />
            <Route
              path={paths.admin.classes}
              element={<PlaceholderPage titleKey="nav.admin.classes" />}
            />
            <Route
              path={paths.admin.subjects}
              element={<PlaceholderPage titleKey="nav.admin.subjects" />}
            />
            <Route
              path={paths.admin.grades}
              element={<PlaceholderPage titleKey="nav.admin.grades" />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
