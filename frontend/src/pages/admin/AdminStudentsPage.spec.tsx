// @vitest-environment jsdom
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminStudent } from '../../features/admin/types.ts';
import { ApiError } from '../../lib/api.ts';
import { adminService } from '../../services/adminService.ts';
import { adminUser, renderPage } from '../../test/renderPage.tsx';
import AdminStudentsPage from './AdminStudentsPage.tsx';

vi.mock('../../services/adminService.ts', () => ({
  adminService: {
    listStudents: vi.fn(),
    listClasses: vi.fn(),
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
    assignStudentClass: vi.fn(),
    deleteStudent: vi.fn(),
  },
}));

const service = vi.mocked(adminService);

const options = {
  path: '/admin/students',
  route: '/admin/students',
  user: adminUser,
};

const students: AdminStudent[] = [
  {
    id: 7,
    firstName: 'Mihai',
    lastName: 'Constantin',
    email: 'mihai.constantin@student.school.test',
    dateOfBirth: '2010-05-17',
    isActive: true,
    class: { id: 3, name: '10A' },
  },
  {
    id: 8,
    firstName: 'Ana',
    lastName: 'Popa',
    email: 'ana.popa@student.school.test',
    dateOfBirth: '2010-11-02',
    isActive: true,
    class: null,
  },
];

function meta(total: number) {
  return { page: 1, limit: 20, total, totalPages: 1 };
}

const dialog = () => screen.findByRole('dialog');

async function fillNewStudent(form: ReturnType<typeof within>) {
  fireEvent.change(form.getByLabelText('First name'), {
    target: { value: 'Maria' },
  });
  fireEvent.change(form.getByLabelText('Last name'), {
    target: { value: 'Popescu' },
  });
  fireEvent.change(form.getByLabelText('Email'), {
    target: { value: 'maria@student.school.test' },
  });
  fireEvent.change(form.getByLabelText('Date of birth'), {
    target: { value: '2010-05-17' },
  });
  fireEvent.change(form.getByLabelText('Password'), {
    target: { value: 'Parola123' },
  });
}

describe('AdminStudentsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.listStudents.mockResolvedValue({
      data: students,
      meta: meta(2),
    });
    service.listClasses.mockResolvedValue({
      data: [{ id: 3, name: '10A', teacher: null, studentCount: 20 }],
      meta: meta(1),
    });
  });

  it('lists the students with their class', async () => {
    renderPage(<AdminStudentsPage />, options);

    expect(await screen.findByText('Constantin Mihai')).toBeVisible();
    expect(screen.getByText('10A', { selector: 'span' })).toBeVisible();
    expect(screen.getByText('Popa Ana')).toBeVisible();
    expect(screen.getAllByText('No class').length).toBeGreaterThan(0);
  });

  it('searches by name or email', async () => {
    renderPage(<AdminStudentsPage />, options);

    await screen.findByText('Constantin Mihai');
    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'ana' },
    });

    await waitFor(() =>
      expect(service.listStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'ana', page: 1 }),
      ),
    );
  });

  it('filters the students that are not in a class', async () => {
    renderPage(<AdminStudentsPage />, options);

    await screen.findByRole('option', { name: '10A' });
    fireEvent.change(screen.getByLabelText('Class'), {
      target: { value: 'none' },
    });

    await waitFor(() =>
      expect(service.listStudents).toHaveBeenLastCalledWith(
        expect.objectContaining({ classFilter: 'none' }),
      ),
    );
  });

  it('tells apart an empty school from a search without results', async () => {
    service.listStudents.mockResolvedValue({ data: [], meta: meta(0) });
    renderPage(<AdminStudentsPage />, options);

    expect(await screen.findByText('There are no students yet')).toBeVisible();

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'zzz' },
    });

    expect(await screen.findByText('No results')).toBeVisible();
  });

  it('asks for the missing fields before creating a student', async () => {
    renderPage(<AdminStudentsPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add student' }));
    const form = within(await dialog());
    fireEvent.click(form.getByRole('button', { name: 'Save' }));

    expect(await form.findByText('Enter your first name.')).toBeVisible();
    expect(form.getByText('Enter a valid email.')).toBeVisible();
    expect(service.createStudent).not.toHaveBeenCalled();
  });

  it('creates a student and confirms it', async () => {
    service.createStudent.mockResolvedValue(students[0]);
    renderPage(<AdminStudentsPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add student' }));
    const form = within(await dialog());
    await fillNewStudent(form);
    fireEvent.click(form.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('The student was added.')).toBeVisible();
    expect(service.createStudent).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Maria',
        email: 'maria@student.school.test',
        password: 'Parola123',
      }),
    );
  });

  it('shows an email that is already used under the field', async () => {
    service.createStudent.mockRejectedValue(new ApiError(409, 'Conflict'));
    renderPage(<AdminStudentsPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add student' }));
    const form = within(await dialog());
    await fillNewStudent(form);
    fireEvent.click(form.getByRole('button', { name: 'Save' }));

    expect(
      await form.findByText('An account with this email already exists.'),
    ).toBeVisible();
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('edits a student and moves them out of the class', async () => {
    service.updateStudent.mockResolvedValue(students[0]);
    service.assignStudentClass.mockResolvedValue(students[0]);
    renderPage(<AdminStudentsPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Edit' }))[0],
    );
    const form = within(await dialog());

    expect(form.getByLabelText('First name')).toHaveValue('Mihai');
    expect(form.getByLabelText('Class')).toHaveValue('3');

    fireEvent.change(form.getByLabelText('Class'), { target: { value: '' } });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('The student was updated.')).toBeVisible();
    expect(service.updateStudent).toHaveBeenCalledWith(7, {
      firstName: 'Mihai',
      lastName: 'Constantin',
      email: 'mihai.constantin@student.school.test',
      dateOfBirth: '2010-05-17',
    });
    expect(service.assignStudentClass).toHaveBeenCalledWith(7, null);
  });

  it('deletes a student only after confirmation', async () => {
    service.deleteStudent.mockResolvedValue(null);
    renderPage(<AdminStudentsPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Delete' }))[0],
    );
    const confirmation = within(await dialog());

    expect(confirmation.getByText(/Mihai Constantin/)).toBeVisible();

    fireEvent.click(confirmation.getByRole('button', { name: 'Cancel' }));
    expect(service.deleteStudent).not.toHaveBeenCalled();

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Delete' }))[0],
    );
    fireEvent.click(
      within(await dialog()).getByRole('button', { name: 'Delete' }),
    );

    expect(await screen.findByText('The student was deleted.')).toBeVisible();
    expect(service.deleteStudent).toHaveBeenCalledWith(7);
  });
});
