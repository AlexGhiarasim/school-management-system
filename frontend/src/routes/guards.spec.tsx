// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../components/ui/ToastProvider.tsx';
import {
  AuthContext,
  type AuthContextValue,
} from '../features/auth/authContext.ts';
import type { CurrentUser, Role } from '../features/auth/types.ts';
import { AppRoutes } from './AppRoutes.tsx';

vi.mock('../services/adminService.ts', () => ({
  adminService: {
    listStudents: () => new Promise(() => undefined),
    listClasses: () => new Promise(() => undefined),
    listTeachers: () => new Promise(() => undefined),
    listClassPage: () => new Promise(() => undefined),
    listAllTeachers: () => new Promise(() => undefined),
    listClassStudents: () => new Promise(() => undefined),
    listGrades: () => new Promise(() => undefined),
    listAllSubjects: () => new Promise(() => undefined),
    listAdmins: () => new Promise(() => undefined),
    listAllClassStudents: () => new Promise(() => undefined),
    listSubjects: () => new Promise(() => undefined),
  },
}));

vi.mock('../services/studentService.ts', () => ({
  studentService: {
    getProfile: () => new Promise(() => undefined),
    getGrades: () => new Promise(() => undefined),
  },
}));

function userWith(role: Role): CurrentUser {
  return {
    id: 1,
    email: `${role.toLowerCase()}@school.test`,
    role,
    profile: { id: 1, firstName: 'Test', lastName: role },
  };
}

function renderAt(path: string, user: CurrentUser | null) {
  const value: AuthContextValue = {
    status: user ? 'authenticated' : 'anonymous',
    user,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <AuthContext.Provider value={value}>
          <MemoryRouter initialEntries={[path]}>
            <AppRoutes />
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

const heading = (name: string) =>
  screen.getByRole('heading', { level: 1, name });

describe('route guards', () => {
  it('sends a visitor to the start page from a protected route', () => {
    renderAt('/admin/students', null);

    expect(heading('Your school, made simpler.')).toBeVisible();
  });

  it.each([
    ['STUDENT', '/admin/students', 'My profile'],
    ['TEACHER', '/admin/teachers', 'My profile'],
    ['TEACHER', '/admin/grades', 'My profile'],
    ['STUDENT', '/admin/classes/3', 'My profile'],
    ['STUDENT', '/admin/subjects', 'My profile'],
    ['STUDENT', '/teacher/classes/3/students/7', 'My profile'],
    ['TEACHER', '/student/grades', 'My profile'],
    ['ADMIN', '/teacher/classes', 'My profile'],
  ] as const)('keeps a %s out of %s', (role, path, expected) => {
    renderAt(path, userWith(role));

    expect(heading(expected)).toBeVisible();
  });

  it.each([
    ['STUDENT', 'My profile'],
    ['TEACHER', 'My profile'],
    ['ADMIN', 'My profile'],
  ] as const)(
    'moves a signed-in %s from the start page to their home',
    (role, expected) => {
      renderAt('/', userWith(role));

      expect(heading(expected)).toBeVisible();
    },
  );

  it.each([
    ['/admin/students', 'Students'],
    ['/admin/teachers', 'Teachers'],
    ['/admin/subjects', 'Subjects'],
    ['/admin/classes', 'Classes'],
    ['/admin/classes/3', 'Classes'],
    ['/admin/grades', 'Grades'],
  ])('lets an admin open %s', (path, expected) => {
    renderAt(path, userWith('ADMIN'));

    expect(heading(expected)).toBeVisible();
  });

  it('shows the not found page for an unknown address', () => {
    renderAt('/does-not-exist', null);

    expect(heading('Page not found')).toBeVisible();
  });
});

describe('navigation', () => {
  it('shows each role only its own links', () => {
    renderAt('/student', userWith('STUDENT'));

    const navigation = screen.getByRole('navigation', {
      name: 'Main navigation',
    });

    expect(navigation).toHaveTextContent('My grades');
    expect(navigation).not.toHaveTextContent('Teachers');
  });

  it('shows the name and role of the signed-in user', () => {
    renderAt('/teacher/classes', userWith('TEACHER'));

    expect(screen.getByText('Test TEACHER')).toBeInTheDocument();
    expect(screen.getByText('Teacher')).toBeInTheDocument();
  });
});
