// @vitest-environment jsdom
import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmSave } from '../../test/confirmSave.ts';
import type { AdminClass } from '../../features/admin/types.ts';
import { ApiError } from '../../lib/api.ts';
import { adminService } from '../../services/adminService.ts';
import { adminUser, renderPage } from '../../test/renderPage.tsx';
import AdminClassesPage from './AdminClassesPage.tsx';

vi.mock('../../services/adminService.ts', () => ({
  adminService: {
    listClassPage: vi.fn(),
    listAllTeachers: vi.fn(),
    createClass: vi.fn(),
    updateClass: vi.fn(),
    assignClassTeacher: vi.fn(),
    deleteClass: vi.fn(),
  },
}));

const service = vi.mocked(adminService);

const options = {
  path: '/admin/classes',
  route: '/admin/classes',
  user: adminUser,
};

const laura = { id: 5, firstName: 'Laura', lastName: 'Marin' };

const classes: AdminClass[] = [
  { id: 3, name: '9A', teacher: laura, studentCount: 20 },
  { id: 4, name: '12A', teacher: null, studentCount: 1 },
];

const meta = { page: 1, limit: 20, total: 2, totalPages: 1 };
const dialog = () => screen.findByRole('dialog');

describe('AdminClassesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.listClassPage.mockResolvedValue({ data: classes, meta });
    service.listAllTeachers.mockResolvedValue({
      data: [
        {
          ...laura,
          email: 'laura.marin@school.test',
          isActive: true,
        },
      ],
      meta: { ...meta, total: 1 },
    });
  });

  it('lists the classes with their teacher and number of students', async () => {
    renderPage(<AdminClassesPage />, options);

    expect(await screen.findByText('9A')).toBeVisible();
    expect(screen.getByText('Marin Laura')).toBeVisible();
    expect(screen.getByText('20 students')).toBeVisible();
    expect(screen.getByText('1 student')).toBeVisible();
    expect(screen.getByText('No class teacher')).toBeVisible();
  });

  it('links every class to the page with its students', async () => {
    renderPage(<AdminClassesPage />, options);

    const link = await screen.findByRole('link', { name: '9A' });

    expect(link).toHaveAttribute('href', '/admin/classes/3');
  });

  it('explains that there are no classes yet', async () => {
    service.listClassPage.mockResolvedValue({
      data: [],
      meta: { ...meta, total: 0, totalPages: 0 },
    });
    renderPage(<AdminClassesPage />, options);

    expect(await screen.findByText('There are no classes yet')).toBeVisible();
  });

  it('asks for a name before creating a class', async () => {
    renderPage(<AdminClassesPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add class' }));
    const form = within(await dialog());
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await form.findByText('Enter the name of the class.')).toBeVisible();
    expect(service.createClass).not.toHaveBeenCalled();
  });

  it('creates a class with a teacher', async () => {
    service.createClass.mockResolvedValue(classes[0]);
    renderPage(<AdminClassesPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add class' }));
    const form = within(await dialog());
    await form.findByRole('option', { name: 'Marin Laura' });
    fireEvent.change(form.getByLabelText('Class name'), {
      target: { value: '  10B  ' },
    });
    fireEvent.change(form.getByLabelText('Class teacher'), {
      target: { value: '5' },
    });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await screen.findByText('The class was added.')).toBeVisible();
    expect(service.createClass).toHaveBeenCalledWith({
      name: '10B',
      teacherId: 5,
    });
  });

  it('shows a name that already exists under the field', async () => {
    service.createClass.mockRejectedValue(new ApiError(409, 'Conflict'));
    renderPage(<AdminClassesPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add class' }));
    const form = within(await dialog());
    fireEvent.change(form.getByLabelText('Class name'), {
      target: { value: '9A' },
    });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(
      await form.findByText('A class with this name already exists.'),
    ).toBeVisible();
  });

  it('renames a class and removes its teacher', async () => {
    service.updateClass.mockResolvedValue(classes[0]);
    service.assignClassTeacher.mockResolvedValue(classes[0]);
    renderPage(<AdminClassesPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Edit' }))[0],
    );
    const form = within(await dialog());
    await form.findByRole('option', { name: 'Marin Laura' });

    expect(form.getByLabelText('Class teacher')).toHaveValue('5');

    fireEvent.change(form.getByLabelText('Class name'), {
      target: { value: '9B' },
    });
    fireEvent.change(form.getByLabelText('Class teacher'), {
      target: { value: '' },
    });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await screen.findByText('The class was updated.')).toBeVisible();
    expect(service.updateClass).toHaveBeenCalledWith(3, '9B');
    expect(service.assignClassTeacher).toHaveBeenCalledWith(3, null);
  });

  it('only changes what was edited', async () => {
    service.updateClass.mockResolvedValue(classes[0]);
    renderPage(<AdminClassesPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Edit' }))[0],
    );
    const form = within(await dialog());
    await form.findByRole('option', { name: 'Marin Laura' });
    fireEvent.change(form.getByLabelText('Class name'), {
      target: { value: '9C' },
    });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));
    confirmSave();

    expect(await screen.findByText('The class was updated.')).toBeVisible();
    expect(service.updateClass).toHaveBeenCalledWith(3, '9C');
    expect(service.assignClassTeacher).not.toHaveBeenCalled();
  });

  it('deletes a class after confirmation and says what happens to its students', async () => {
    service.deleteClass.mockResolvedValue(null);
    renderPage(<AdminClassesPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Delete' }))[0],
    );
    const confirmation = within(await dialog());

    expect(confirmation.getByText(/left without a class/)).toBeVisible();

    fireEvent.click(confirmation.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('The class was deleted.')).toBeVisible();
    expect(service.deleteClass).toHaveBeenCalledWith(3);
  });
});
