// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { teacherService } from '../../services/teacherService.ts';
import { renderPage } from '../../test/renderPage.tsx';
import TeacherClassesPage from './TeacherClassesPage.tsx';

vi.mock('../../services/teacherService.ts', () => ({
  teacherService: { getClasses: vi.fn() },
}));

const getClasses = vi.mocked(teacherService.getClasses);

const options = { path: '/teacher/classes', route: '/teacher/classes' };

describe('TeacherClassesPage', () => {
  beforeEach(() => {
    getClasses.mockReset();
  });

  it('shows a card for every class with the number of students', async () => {
    getClasses.mockResolvedValue([
      { id: 3, name: '9A', studentCount: 20, isHomeroom: false, subjects: [] },
      { id: 4, name: '12A', studentCount: 1, isHomeroom: false, subjects: [] },
    ]);
    renderPage(<TeacherClassesPage />, options);

    expect(await screen.findByText('9A')).toBeVisible();
    expect(screen.getByText('20 students')).toBeVisible();
    expect(screen.getByText('1 student')).toBeVisible();
  });

  it('links each class to the page with its students', async () => {
    getClasses.mockResolvedValue([
      { id: 3, name: '9A', studentCount: 20, isHomeroom: false, subjects: [] },
    ]);
    renderPage(<TeacherClassesPage />, options);

    const link = await screen.findByRole('link', { name: /9A/ });

    expect(link).toHaveAttribute('href', '/teacher/classes/3');
  });

  it('explains that no class is assigned yet', async () => {
    getClasses.mockResolvedValue([]);
    renderPage(<TeacherClassesPage />, options);

    expect(await screen.findByText('You have no classes yet')).toBeVisible();
  });

  it('shows an error and loads the classes again on retry', async () => {
    getClasses.mockRejectedValueOnce(new Error('offline'));
    getClasses.mockResolvedValueOnce([
      { id: 3, name: '9A', studentCount: 2, isHomeroom: false, subjects: [] },
    ]);
    renderPage(<TeacherClassesPage />, options);

    expect(await screen.findByRole('alert')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('9A')).toBeVisible();
  });
});
