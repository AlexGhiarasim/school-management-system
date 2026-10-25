// @vitest-environment jsdom
import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminSubject } from '../../features/admin/types.ts';
import { ApiError } from '../../lib/api.ts';
import { adminService } from '../../services/adminService.ts';
import { adminUser, renderPage } from '../../test/renderPage.tsx';
import AdminSubjectsPage from './AdminSubjectsPage.tsx';

vi.mock('../../services/adminService.ts', () => ({
  adminService: {
    listSubjects: vi.fn(),
    createSubject: vi.fn(),
    updateSubject: vi.fn(),
    deleteSubject: vi.fn(),
  },
}));

const service = vi.mocked(adminService);

const options = {
  path: '/admin/subjects',
  route: '/admin/subjects',
  user: adminUser,
};

const subjects: AdminSubject[] = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'English' },
];

const meta = { page: 1, limit: 20, total: 2, totalPages: 1 };
const dialog = () => screen.findByRole('dialog');

describe('AdminSubjectsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.listSubjects.mockResolvedValue({ data: subjects, meta });
  });

  it('lists the subjects', async () => {
    renderPage(<AdminSubjectsPage />, options);

    expect(await screen.findByText('Mathematics')).toBeVisible();
    expect(screen.getByText('English')).toBeVisible();
  });

  it('asks for a name before creating a subject', async () => {
    renderPage(<AdminSubjectsPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add subject' }));
    const form = within(await dialog());
    fireEvent.click(form.getByRole('button', { name: 'Save' }));

    expect(
      await form.findByText('Enter the name of the subject.'),
    ).toBeVisible();
    expect(service.createSubject).not.toHaveBeenCalled();
  });

  it('creates a subject with a trimmed name', async () => {
    service.createSubject.mockResolvedValue({ id: 3, name: 'History' });
    renderPage(<AdminSubjectsPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add subject' }));
    const form = within(await dialog());
    fireEvent.change(form.getByLabelText('Subject name'), {
      target: { value: '  History  ' },
    });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('The subject was added.')).toBeVisible();
    expect(service.createSubject).toHaveBeenCalledWith({ name: 'History' });
  });

  it('shows a name that already exists under the field', async () => {
    service.createSubject.mockRejectedValue(new ApiError(409, 'Conflict'));
    renderPage(<AdminSubjectsPage />, options);

    fireEvent.click(await screen.findByRole('button', { name: 'Add subject' }));
    const form = within(await dialog());
    fireEvent.change(form.getByLabelText('Subject name'), {
      target: { value: 'Mathematics' },
    });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));

    expect(
      await form.findByText('A subject with this name already exists.'),
    ).toBeVisible();
  });

  it('renames a subject', async () => {
    service.updateSubject.mockResolvedValue(subjects[0]);
    renderPage(<AdminSubjectsPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Edit' }))[0],
    );
    const form = within(await dialog());

    expect(form.getByLabelText('Subject name')).toHaveValue('Mathematics');

    fireEvent.change(form.getByLabelText('Subject name'), {
      target: { value: 'Algebra' },
    });
    fireEvent.click(form.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('The subject was updated.')).toBeVisible();
    expect(service.updateSubject).toHaveBeenCalledWith(1, { name: 'Algebra' });
  });

  it('deletes a subject after confirmation', async () => {
    service.deleteSubject.mockResolvedValue(null);
    renderPage(<AdminSubjectsPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Delete' }))[0],
    );
    fireEvent.click(
      within(await dialog()).getByRole('button', { name: 'Delete' }),
    );

    expect(await screen.findByText('The subject was deleted.')).toBeVisible();
    expect(service.deleteSubject).toHaveBeenCalledWith(1);
  });

  it('explains why a subject that has grades cannot be deleted', async () => {
    service.deleteSubject.mockRejectedValue(new ApiError(409, 'Conflict'));
    renderPage(<AdminSubjectsPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Delete' }))[0],
    );
    fireEvent.click(
      within(await dialog()).getByRole('button', { name: 'Delete' }),
    );

    expect(
      await screen.findByText('The subject has grades and cannot be deleted.'),
    ).toBeVisible();
  });
});
