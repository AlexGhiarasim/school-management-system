// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import {
  AuthContext,
  type AuthContextValue,
} from '../features/auth/authContext.ts';
import type { CurrentUser, Role } from '../features/auth/types.ts';
import { AppRoutes } from './AppRoutes.tsx';

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

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

const heading = (name: string) =>
  screen.getByRole('heading', { level: 1, name });

describe('route guards', () => {
  it('sends a visitor to the start page from a protected route', () => {
    renderAt('/admin/students', null);

    expect(
      heading('Everything your school needs, in one place.'),
    ).toBeVisible();
  });

  it.each([
    ['STUDENT', '/admin/students', 'My profile'],
    ['TEACHER', '/student/grades', 'My classes'],
    ['ADMIN', '/teacher/classes', 'Students'],
  ] as const)('keeps a %s out of %s', (role, path, expected) => {
    renderAt(path, userWith(role));

    expect(heading(expected)).toBeVisible();
  });

  it.each([
    ['STUDENT', 'My profile'],
    ['TEACHER', 'My classes'],
    ['ADMIN', 'Students'],
  ] as const)(
    'moves a signed-in %s from the start page to their home',
    (role, expected) => {
      renderAt('/', userWith(role));

      expect(heading(expected)).toBeVisible();
    },
  );

  it('lets an admin open an admin page', () => {
    renderAt('/admin/classes', userWith('ADMIN'));

    expect(heading('Classes')).toBeVisible();
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
