// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudentProfile } from '../../features/student/types.ts';
import { studentService } from '../../services/studentService.ts';
import { renderWithQuery } from '../../test/renderWithQuery.tsx';
import StudentProfilePage from './StudentProfilePage.tsx';

vi.mock('../../services/studentService.ts', () => ({
  studentService: {
    getProfile: vi.fn(),
    getGrades: vi.fn(),
    getClassOverview: vi.fn(),
  },
}));

const getProfile = vi.mocked(studentService.getProfile);
const getGrades = vi.mocked(studentService.getGrades);
const getClassOverview = vi.mocked(studentService.getClassOverview);

const profile: StudentProfile = {
  id: 1,
  firstName: 'Mihai',
  lastName: 'Constantin',
  email: 'mihai.constantin@student.school.test',
  dateOfBirth: '2010-05-17',
  isActive: true,
  class: { id: 3, name: '10A' },
};

describe('StudentProfilePage', () => {
  beforeEach(() => {
    getProfile.mockReset();
    getGrades.mockReset();
    getGrades.mockResolvedValue({ average: null, bySubject: [], grades: [] });
    getClassOverview.mockReset();
    getClassOverview.mockReturnValue(new Promise(() => undefined));
  });

  it('shows the class teacher, its size and the classmates', async () => {
    getProfile.mockResolvedValue({ ...profile, id: 7 });
    getClassOverview.mockResolvedValue({
      id: 3,
      name: '10A',
      teacher: { firstName: 'Laura', lastName: 'Marin' },
      studentCount: 2,
      students: [
        { id: 7, firstName: 'Mihai', lastName: 'Constantin' },
        { id: 8, firstName: 'Ana', lastName: 'Pop' },
      ],
    });
    renderWithQuery(<StudentProfilePage />);

    const count = await screen.findByRole('button', { name: '2 students' });
    expect(screen.queryByText('Pop')).not.toBeInTheDocument();

    fireEvent.click(count);

    expect(screen.getByText('Pop')).toBeInTheDocument();
    expect(screen.getByText('you')).toBeInTheDocument();
    expect(screen.getByText(/Laura Marin/)).toBeInTheDocument();
  });

  it('shows the average and the latest grades', async () => {
    getProfile.mockResolvedValue(profile);
    getGrades.mockResolvedValue({
      average: 8,
      bySubject: [
        { subjectId: 1, subject: 'Mathematics', average: 8, count: 1 },
      ],
      grades: [
        {
          id: 1,
          value: 8,
          date: '2026-10-02',
          subject: { id: 1, name: 'Mathematics' },
          teacher: null,
        },
      ],
    });
    renderWithQuery(
      <MemoryRouter>
        <StudentProfilePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Latest grades')).toBeVisible();
    expect(screen.getByText('Mathematics')).toBeVisible();
    expect(screen.getByText('8.00')).toBeVisible();
  });

  it('shows the personal details and the class', async () => {
    getProfile.mockResolvedValue(profile);
    renderWithQuery(<StudentProfilePage />);

    expect(await screen.findByText('Constantin Mihai')).toBeVisible();
    expect(
      screen.getByText('mihai.constantin@student.school.test'),
    ).toBeVisible();
    expect(screen.getByText('May 17, 2010')).toBeVisible();
    expect(screen.getByText('10A')).toBeVisible();
  });

  it('explains that the student has no class yet', async () => {
    getProfile.mockResolvedValue({ ...profile, class: null });
    renderWithQuery(<StudentProfilePage />);

    expect(await screen.findByText('You are not in a class yet')).toBeVisible();
  });

  it('shows an error and loads the data again on retry', async () => {
    getProfile.mockRejectedValueOnce(new Error('offline'));
    getProfile.mockResolvedValueOnce(profile);
    renderWithQuery(<StudentProfilePage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not load the data',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Constantin Mihai')).toBeVisible();
    expect(getProfile).toHaveBeenCalledTimes(2);
  });
});
