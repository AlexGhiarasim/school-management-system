import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';
import { ToastProvider } from '../components/ui/ToastProvider.tsx';
import {
  AuthContext,
  type AuthContextValue,
} from '../features/auth/authContext.ts';
import type { CurrentUser } from '../features/auth/types.ts';

export const teacherUser: CurrentUser = {
  id: 10,
  email: 'laura.marin@school.test',
  role: 'TEACHER',
  profile: { id: 5, firstName: 'Laura', lastName: 'Marin' },
};

export const adminUser: CurrentUser = {
  id: 1,
  email: 'admin@school.test',
  role: 'ADMIN',
  profile: null,
};

interface RenderPageOptions {
  path: string;
  route: string;
  user?: CurrentUser;
}

export function renderPage(
  ui: ReactElement,
  { path, route, user = teacherUser }: RenderPageOptions,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const auth: AuthContextValue = {
    status: 'authenticated',
    user,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <AuthContext.Provider value={auth}>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route path={route} element={ui} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </QueryClientProvider>,
  );
}
