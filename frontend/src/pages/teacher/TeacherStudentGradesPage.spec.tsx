// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmSave } from '../../test/confirmSave.ts';
import type { TeacherGrade } from '../../features/teacher/types.ts';
import { ApiError } from '../../lib/api.ts';
import { teacherService } from '../../services/teacherService.ts';
import { renderPage } from '../../test/renderPage.tsx';
import TeacherStudentGradesPage from './TeacherStudentGradesPage.tsx';

vi.mock('../../services/teacherService.ts', () => ({
  teacherService: {
    getClasses: vi.fn(),
    getAllClassStudents: vi.fn(),
    getSubjects: vi.fn(),
    getStudentGrades: vi.fn(),
    createGrade: vi.fn(),
    updateGrade: vi.fn(),
  },
}));

const service = vi.mocked(teacherService);

const options = {
  path: '/teacher/classes/3/students/7',
  route: '/teacher/classes/:classId/students/:studentId',
};

const student = { id: 7, firstName: 'Mihai', lastName: 'Constantin' };
const ownTeacher = { id: 5, firstName: 'Laura', lastName: 'Marin' };
const otherTeacher = { id: 6, firstName: 'Daniel', lastName: 'Preda' };

const maths = { id: 1, name: 'Mathematics' };
const english = { id: 2, name: 'English' };

const grades: TeacherGrade[] = [
  {
    id: 1,
    value: 10,
    date: '2026-10-02',
    subject: maths,
    student,
    teacher: ownTeacher,
  },
  {
    id: 2,
    value: 7,
    date: '2026-10-01',
    subject: english,
    student,
    teacher: otherTeacher,
  },
  {
    id: 3,
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

function dialog() {
  return screen.findByRole('dialog');
}

describe('TeacherStudentGradesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.getClasses.mockResolvedValue([
      {
        id: 3,
        name: '9A',
        studentCount: 1,
        isHomeroom: false,
        subjects: [english, maths],
      },
    ]);
    service.getAllClassStudents.mockResolvedValue({
      data: [
        {
          ...student,
          dateOfBirth: '2010-05-17',
          email: 'mihai.constantin@student.school.test',
        },
      ],
      meta: meta(1),
    });
    service.getSubjects.mockResolvedValue({
      data: [english, maths],
      meta: meta(2),
    });
    service.getStudentGrades.mockResolvedValue({
      data: grades,
      meta: meta(3),
    });
  });

  it('shows the student and the grades', async () => {
    renderPage(<TeacherStudentGradesPage />, options);

    expect(
      await screen.findByRole('heading', { name: 'Constantin Mihai' }),
    ).toBeVisible();
    expect(
      await screen.findByRole('article', { name: 'English' }),
    ).toBeVisible();
    expect(screen.getByRole('article', { name: 'Mathematics' })).toBeVisible();
  });

  it('lets the teacher edit only the grades they gave', async () => {
    renderPage(<TeacherStudentGradesPage />, options);

    const buttons = await screen.findAllByRole('button', { name: 'Edit' });

    expect(buttons).toHaveLength(1);
    expect(
      within(buttons[0].closest('article') as HTMLElement).getByText(
        'Mathematics',
      ),
    ).toBeVisible();
  });

  it('asks for the missing fields before saving a new grade', async () => {
    renderPage(<TeacherStudentGradesPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add grade' }));
    const form = within(await dialog());
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await form.findByText('Choose the subject.')).toBeVisible();
    expect(form.getByText('Choose a grade from 1 to 10.')).toBeVisible();
    expect(service.createGrade).not.toHaveBeenCalled();
  });

  it('adds a grade, confirms it and closes the window', async () => {
    service.createGrade.mockResolvedValue(grades[0]);
    renderPage(<TeacherStudentGradesPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add grade' }));
    const form = within(await dialog());
    fireEvent.change(form.getByLabelText('Subject'), {
      target: { value: '1' },
    });
    fireEvent.change(form.getByLabelText('Grade'), { target: { value: '9' } });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await screen.findByText('The grade was added.')).toBeVisible();
    expect(service.createGrade).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ subjectId: 1, value: 9 }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('opens an existing grade with its values and saves the change', async () => {
    service.updateGrade.mockResolvedValue(grades[0]);
    renderPage(<TeacherStudentGradesPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
    const form = within(await dialog());

    expect(form.getByLabelText('Subject')).toHaveValue('1');
    expect(form.getByLabelText('Grade')).toHaveValue('10');

    fireEvent.change(form.getByLabelText('Grade'), { target: { value: '8' } });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await screen.findByText('The grade was updated.')).toBeVisible();
    expect(service.updateGrade).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ subjectId: 1, value: 8, date: '2026-10-02' }),
    );
  });

  it('shows the server error and keeps the window open', async () => {
    service.createGrade.mockRejectedValue(new ApiError(403, 'Forbidden'));
    renderPage(<TeacherStudentGradesPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add grade' }));
    const form = within(await dialog());
    fireEvent.change(form.getByLabelText('Subject'), {
      target: { value: '1' },
    });
    fireEvent.change(form.getByLabelText('Grade'), { target: { value: '9' } });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await form.findByRole('alert')).toHaveTextContent(
      'You are not allowed to do this.',
    );
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('does not open a student who is not in the class', async () => {
    service.getAllClassStudents.mockResolvedValue({ data: [], meta: meta(0) });
    renderPage(<TeacherStudentGradesPage />, options);

    expect(await screen.findByText('Student not found')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Add grade' }),
    ).not.toBeInTheDocument();
  });
});
