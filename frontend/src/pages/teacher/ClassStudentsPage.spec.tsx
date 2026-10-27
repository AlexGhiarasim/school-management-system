// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClassStudent } from '../../features/teacher/types.ts';
import { teacherService } from '../../services/teacherService.ts';
import { renderPage } from '../../test/renderPage.tsx';
import ClassStudentsPage from './ClassStudentsPage.tsx';

vi.mock('../../services/teacherService.ts', () => ({
  teacherService: { getClasses: vi.fn(), getClassStudents: vi.fn() },
}));

const getClasses = vi.mocked(teacherService.getClasses);
const getClassStudents = vi.mocked(teacherService.getClassStudents);

const options = {
  path: '/teacher/classes/3',
  route: '/teacher/classes/:classId',
};

const students: ClassStudent[] = [
  {
    id: 7,
    firstName: 'Mihai',
    lastName: 'Constantin',
    dateOfBirth: '2010-05-17',
    email: 'mihai.constantin@student.school.test',
  },
  {
    id: 8,
    firstName: 'Ana',
    lastName: 'Popa',
    dateOfBirth: '2010-11-02',
    email: 'ana.popa@student.school.test',
  },
];

function page(data: ClassStudent[], pageNumber = 1, totalPages = 1) {
  return {
    data,
    meta: { page: pageNumber, limit: 20, total: 25, totalPages },
  };
}

describe('ClassStudentsPage', () => {
  beforeEach(() => {
    getClasses.mockReset();
    getClassStudents.mockReset();
    getClasses.mockResolvedValue([
      { id: 3, name: '9A', studentCount: 25, isHomeroom: false, subjects: [] },
    ]);
  });

  it('shows the class and its students', async () => {
    getClassStudents.mockResolvedValue(page(students));
    renderPage(<ClassStudentsPage />, options);

    expect(
      await screen.findByRole('heading', { name: 'Class 9A' }),
    ).toBeVisible();
    expect(await screen.findByText('Constantin Mihai')).toBeVisible();
    expect(screen.getByText('Popa Ana')).toBeVisible();
    expect(screen.getByText('May 17, 2010')).toBeVisible();
  });

  it('links every student to the page with the grades', async () => {
    getClassStudents.mockResolvedValue(page(students));
    renderPage(<ClassStudentsPage />, options);

    const links = await screen.findAllByRole('link', { name: 'View grades' });

    expect(links[0]).toHaveAttribute('href', '/teacher/classes/3/students/7');
  });

  it('loads the next page of students', async () => {
    getClassStudents.mockResolvedValue(page(students, 1, 2));
    renderPage(<ClassStudentsPage />, options);

    await screen.findByText('Constantin Mihai');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(getClassStudents).toHaveBeenLastCalledWith(3, 2);
  });

  it('tells the teacher that a class with no students is empty', async () => {
    getClassStudents.mockResolvedValue(page([]));
    renderPage(<ClassStudentsPage />, options);

    expect(
      await screen.findByText('The class has no students yet'),
    ).toBeVisible();
  });

  it('does not open a class that is not assigned to the teacher', async () => {
    getClasses.mockResolvedValue([
      { id: 99, name: '12B', studentCount: 3, isHomeroom: false, subjects: [] },
    ]);
    getClassStudents.mockResolvedValue(page(students));
    renderPage(<ClassStudentsPage />, options);

    expect(await screen.findByText('Class not found')).toBeVisible();
    expect(screen.queryByText('Constantin Mihai')).not.toBeInTheDocument();
  });
});
