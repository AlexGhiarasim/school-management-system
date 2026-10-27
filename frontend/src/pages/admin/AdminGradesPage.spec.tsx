// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmSave } from '../../test/confirmSave.ts';
import type { AdminGrade } from '../../features/admin/types.ts';
import { adminService } from '../../services/adminService.ts';
import { adminUser, renderPage } from '../../test/renderPage.tsx';
import AdminGradesPage from './AdminGradesPage.tsx';

vi.mock('../../services/adminService.ts', () => ({
  adminService: {
    listGrades: vi.fn(),
    listClasses: vi.fn(),
    listAllSubjects: vi.fn(),
    listAllClassStudents: vi.fn(),
    updateGrade: vi.fn(),
    deleteGrade: vi.fn(),
  },
}));

const service = vi.mocked(adminService);

const options = {
  path: '/admin/grades',
  route: '/admin/grades',
  user: adminUser,
};

const student = { id: 7, firstName: 'Mihai', lastName: 'Constantin' };
const laura = { id: 5, firstName: 'Laura', lastName: 'Marin' };
const maths = { id: 1, name: 'Mathematics' };
const english = { id: 2, name: 'English' };

const grades: AdminGrade[] = [
  {
    id: 1,
    value: 10,
    date: '2026-10-02',
    subject: maths,
    student,
    teacher: laura,
  },
  {
    id: 2,
    value: 6,
    date: '2026-09-30',
    subject: english,
    student,
    teacher: null,
  },
];

function meta(total: number) {
  return { page: 1, limit: 20, total, totalPages: 1 };
}

const dialog = () => screen.findByRole('dialog');

describe('AdminGradesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.listGrades.mockResolvedValue({ data: grades, meta: meta(2) });
    service.listClasses.mockResolvedValue({
      data: [{ id: 3, name: '9A', teacher: laura, studentCount: 20 }],
      meta: meta(1),
    });
    service.listAllSubjects.mockResolvedValue({
      data: [english, maths],
      meta: meta(2),
    });
    service.listAllClassStudents.mockResolvedValue({
      data: [
        {
          ...student,
          dateOfBirth: '2010-05-17',
          email: 'mihai.constantin@student.school.test',
        },
      ],
      meta: meta(1),
    });
  });

  it('lists the grades with the student, subject and teacher', async () => {
    renderPage(<AdminGradesPage />, options);

    const table = within(await screen.findByRole('table'));

    expect(await table.findAllByText('Constantin Mihai')).toHaveLength(2);
    expect(table.getByText('Mathematics')).toBeVisible();
    expect(table.getByText('Laura Marin')).toBeVisible();
    expect(table.getByText('Administrator')).toBeVisible();
  });

  it('keeps the student filter off until a class is chosen', async () => {
    renderPage(<AdminGradesPage />, options);

    await screen.findAllByText('Constantin Mihai');

    expect(screen.getByLabelText('Student')).toBeDisabled();
  });

  it('filters by class, then by one of its students, then by subject', async () => {
    renderPage(<AdminGradesPage />, options);

    await screen.findByRole('option', { name: '9A' });
    fireEvent.change(screen.getByLabelText('Class'), {
      target: { value: '3' },
    });

    await screen.findByRole('option', { name: 'Constantin Mihai' });
    expect(screen.getByLabelText('Student')).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Student'), {
      target: { value: '7' },
    });
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: '1' },
    });

    await waitFor(() =>
      expect(service.listGrades).toHaveBeenLastCalledWith(
        expect.objectContaining({
          classId: '3',
          studentId: '7',
          subjectId: '1',
        }),
      ),
    );
  });

  it('clears the student when the class changes', async () => {
    renderPage(<AdminGradesPage />, options);

    await screen.findByRole('option', { name: '9A' });
    fireEvent.change(screen.getByLabelText('Class'), {
      target: { value: '3' },
    });
    await screen.findByRole('option', { name: 'Constantin Mihai' });
    fireEvent.change(screen.getByLabelText('Student'), {
      target: { value: '7' },
    });
    fireEvent.change(screen.getByLabelText('Class'), { target: { value: '' } });

    await waitFor(() =>
      expect(service.listGrades).toHaveBeenLastCalledWith(
        expect.objectContaining({ classId: '', studentId: '' }),
      ),
    );
    expect(screen.getByLabelText('Student')).toBeDisabled();
  });

  it('tells apart an empty school from filters without results', async () => {
    service.listGrades.mockResolvedValue({ data: [], meta: meta(0) });
    renderPage(<AdminGradesPage />, options);

    expect(await screen.findByText('There are no grades yet')).toBeVisible();

    await screen.findByRole('option', { name: 'Mathematics' });
    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: '1' },
    });

    expect(await screen.findByText('No grades found')).toBeVisible();
  });

  it('edits any grade, even one given by another teacher', async () => {
    service.updateGrade.mockResolvedValue(grades[1]);
    renderPage(<AdminGradesPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Edit' }))[1],
    );
    const form = within(await dialog());

    expect(form.getByLabelText('Subject')).toHaveValue('2');
    expect(form.getByLabelText('Grade')).toHaveValue('6');

    fireEvent.change(form.getByLabelText('Grade'), { target: { value: '8' } });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await screen.findByText('The grade was updated.')).toBeVisible();
    expect(service.updateGrade).toHaveBeenCalledWith(2, {
      subjectId: 2,
      value: 8,
      date: '2026-09-30',
    });
  });

  it('does not save an invalid grade', async () => {
    renderPage(<AdminGradesPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Edit' }))[0],
    );
    const form = within(await dialog());
    fireEvent.change(form.getByLabelText('Grade'), { target: { value: '' } });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await form.findByText('Choose a grade from 1 to 10.')).toBeVisible();
    expect(service.updateGrade).not.toHaveBeenCalled();
  });

  it('deletes a grade after confirmation', async () => {
    service.deleteGrade.mockResolvedValue(null);
    renderPage(<AdminGradesPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Delete' }))[0],
    );
    const confirmation = within(await dialog());

    expect(
      confirmation.getByText(
        /grade 10 in Mathematics of the student Mihai Constantin/,
      ),
    ).toBeVisible();

    fireEvent.click(confirmation.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('The grade was deleted.')).toBeVisible();
    expect(service.deleteGrade).toHaveBeenCalledWith(1);
  });
});
