// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StudentProfile } from '../../features/student/types.ts';
import { studentService } from '../../services/studentService.ts';
import { renderWithQuery } from '../../test/renderWithQuery.tsx';
import StudentProfilePage from './StudentProfilePage.tsx';

vi.mock('../../services/studentService.ts', () => ({
  studentService: { getProfile: vi.fn(), getGrades: vi.fn() },
}));

const getProfile = vi.mocked(studentService.getProfile);

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
  });

  it('shows the personal details and the class', async () => {
    getProfile.mockResolvedValue(profile);
    renderWithQuery(<StudentProfilePage />);

    expect(await screen.findByText('Mihai Constantin')).toBeVisible();
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

    expect(await screen.findByText('Mihai Constantin')).toBeVisible();
    expect(getProfile).toHaveBeenCalledTimes(2);
  });
});
