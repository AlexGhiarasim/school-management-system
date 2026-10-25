// @vitest-environment jsdom
import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudentGrades } from '../../features/student/types.ts';
import { studentService } from '../../services/studentService.ts';
import { renderWithQuery } from '../../test/renderWithQuery.tsx';
import StudentGradesPage from './StudentGradesPage.tsx';

vi.mock('../../services/studentService.ts', () => ({
  studentService: { getProfile: vi.fn(), getGrades: vi.fn() },
}));

const getGrades = vi.mocked(studentService.getGrades);

const laura = { id: 5, firstName: 'Laura', lastName: 'Marin' };

const grades: StudentGrades = {
  average: 8,
  bySubject: [
    { subjectId: 2, subject: 'English', average: 6, count: 1 },
    { subjectId: 1, subject: 'Mathematics', average: 9, count: 2 },
  ],
  grades: [
    {
      id: 1,
      value: 10,
      date: '2026-10-02',
      subject: { id: 1, name: 'Mathematics' },
      teacher: laura,
    },
    {
      id: 2,
      value: 8,
      date: '2026-10-01',
      subject: { id: 1, name: 'Mathematics' },
      teacher: laura,
    },
    {
      id: 3,
      value: 6,
      date: '2026-09-30',
      subject: { id: 2, name: 'English' },
      teacher: null,
    },
  ],
};

describe('StudentGradesPage', () => {
  beforeEach(() => {
    getGrades.mockReset();
  });

  it('shows the overall average and the totals', async () => {
    getGrades.mockResolvedValue(grades);
    renderWithQuery(<StudentGradesPage />);

    const average = (await screen.findByText('Overall average')).parentElement;
    expect(average).toHaveTextContent('8.00');
    expect(
      screen.getByText('Number of grades').parentElement,
    ).toHaveTextContent('3');
    expect(screen.getByText('Subjects').parentElement).toHaveTextContent('2');
  });

  it('shows the average of every subject with its number of grades', async () => {
    getGrades.mockResolvedValue(grades);
    renderWithQuery(<StudentGradesPage />);

    const maths = await screen.findByRole('progressbar', {
      name: 'Mathematics',
    });

    expect(maths).toHaveAttribute('aria-valuenow', '9');
    expect(screen.getByText('2 grades')).toBeVisible();
    expect(screen.getByText('1 grade')).toBeVisible();
  });

  it('lists every grade and names an administrator when there is no teacher', async () => {
    getGrades.mockResolvedValue(grades);
    renderWithQuery(<StudentGradesPage />);

    const table = await screen.findByRole('table');

    expect(within(table).getAllByRole('row')).toHaveLength(4);
    expect(within(table).getAllByText('Laura Marin')).toHaveLength(2);
    expect(within(table).getByText('Administrator')).toBeVisible();
  });

  it('narrows the table to the chosen subject', async () => {
    getGrades.mockResolvedValue(grades);
    renderWithQuery(<StudentGradesPage />);

    const table = await screen.findByRole('table');
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: '2' },
    });

    expect(within(table).getAllByRole('row')).toHaveLength(2);
    expect(within(table).getByText('English')).toBeVisible();
    expect(within(table).queryByText('Mathematics')).not.toBeInTheDocument();
  });

  it('tells the student when there are no grades yet', async () => {
    getGrades.mockResolvedValue({ average: null, bySubject: [], grades: [] });
    renderWithQuery(<StudentGradesPage />);

    expect(await screen.findByText('You have no grades yet')).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an error and loads the grades again on retry', async () => {
    getGrades.mockRejectedValueOnce(new Error('offline'));
    getGrades.mockResolvedValueOnce(grades);
    renderWithQuery(<StudentGradesPage />);

    expect(await screen.findByRole('alert')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('table')).toBeVisible();
  });
});
