// @vitest-environment jsdom
import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmSave } from '../../test/confirmSave.ts';
import type { AdminTeacher } from '../../features/admin/types.ts';
import { ApiError } from '../../lib/api.ts';
import { adminService } from '../../services/adminService.ts';
import { adminUser, renderPage } from '../../test/renderPage.tsx';
import AdminTeachersPage from './AdminTeachersPage.tsx';

vi.mock('../../services/adminService.ts', () => ({
  adminService: {
    listTeachers: vi.fn(),
    createTeacher: vi.fn(),
    updateTeacher: vi.fn(),
    deleteTeacher: vi.fn(),
  },
}));

const service = vi.mocked(adminService);

const options = {
  path: '/admin/teachers',
  route: '/admin/teachers',
  user: adminUser,
};

const teachers: AdminTeacher[] = [
  {
    id: 5,
    firstName: 'Laura',
    lastName: 'Marin',
    email: 'laura.marin@school.test',
    isActive: true,
  },
  {
    id: 6,
    firstName: 'Daniel',
    lastName: 'Preda',
    email: 'daniel.preda@school.test',
    isActive: true,
  },
];

const meta = { page: 1, limit: 20, total: 2, totalPages: 1 };
const dialog = () => screen.findByRole('dialog');

function fillNewTeacher(form: ReturnType<typeof within>) {
  fireEvent.change(form.getByLabelText('First name'), {
    target: { value: 'Elena' },
  });
  fireEvent.change(form.getByLabelText('Last name'), {
    target: { value: 'Ionescu' },
  });
  fireEvent.change(form.getByLabelText('Email'), {
    target: { value: 'elena.ionescu@school.test' },
  });
  fireEvent.change(form.getByLabelText('Password'), {
    target: { value: 'Parola123' },
  });
}

describe('AdminTeachersPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.listTeachers.mockResolvedValue({ data: teachers, meta });
  });

  it('lists the teachers', async () => {
    renderPage(<AdminTeachersPage />, options);

    expect(await screen.findByText('Marin Laura')).toBeVisible();
    expect(screen.getByText('Preda Daniel')).toBeVisible();
  });

  it('explains that there are no teachers yet', async () => {
    service.listTeachers.mockResolvedValue({
      data: [],
      meta: { ...meta, total: 0, totalPages: 0 },
    });
    renderPage(<AdminTeachersPage />, options);

    expect(await screen.findByText('There are no teachers yet')).toBeVisible();
  });

  it('creates a teacher with a password and confirms it', async () => {
    service.createTeacher.mockResolvedValue(teachers[0]);
    renderPage(<AdminTeachersPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add teacher' }));
    const form = within(await dialog());
    fillNewTeacher(form);
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await screen.findByText('The teacher was added.')).toBeVisible();
    expect(service.createTeacher).toHaveBeenCalledWith({
      firstName: 'Elena',
      lastName: 'Ionescu',
      email: 'elena.ionescu@school.test',
      password: 'Parola123',
    });
  });

  it('rejects a weak password before sending anything', async () => {
    renderPage(<AdminTeachersPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add teacher' }));
    const form = within(await dialog());
    fillNewTeacher(form);
    fireEvent.change(form.getByLabelText('Password'), {
      target: { value: 'onlyletters' },
    });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await form.findByText('Add a letter and a digit.')).toBeVisible();
    expect(service.createTeacher).not.toHaveBeenCalled();
  });

  it('shows an email that is already used under the field', async () => {
    service.createTeacher.mockRejectedValue(new ApiError(409, 'Conflict'));
    renderPage(<AdminTeachersPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add teacher' }));
    const form = within(await dialog());
    fillNewTeacher(form);
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(
      await form.findByText('An account with this email already exists.'),
    ).toBeVisible();
  });

  it('edits a teacher without asking for a password', async () => {
    service.updateTeacher.mockResolvedValue(teachers[0]);
    renderPage(<AdminTeachersPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Edit' }))[0],
    );
    const form = within(await dialog());

    expect(form.queryByLabelText('Password')).not.toBeInTheDocument();

    fireEvent.change(form.getByLabelText('Last name'), {
      target: { value: 'Marinescu' },
    });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await screen.findByText('The teacher was updated.')).toBeVisible();
    expect(service.updateTeacher).toHaveBeenCalledWith(5, {
      firstName: 'Laura',
      lastName: 'Marinescu',
      email: 'laura.marin@school.test',
    });
  });

  it('deletes a teacher after confirmation', async () => {
    service.deleteTeacher.mockResolvedValue(null);
    renderPage(<AdminTeachersPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Delete' }))[0],
    );
    fireEvent.click(
      within(await dialog()).getByRole('button', { name: 'Delete' }),
    );

    expect(await screen.findByText('The teacher was deleted.')).toBeVisible();
    expect(service.deleteTeacher).toHaveBeenCalledWith(5);
  });
});
