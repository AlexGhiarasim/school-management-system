// @vitest-environment jsdom
import { fireEvent, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminClass, AdminStudent } from '../../features/admin/types.ts';
import type { ClassStudent } from '../../features/teacher/types.ts';
import { adminService } from '../../services/adminService.ts';
import { adminUser, renderPage } from '../../test/renderPage.tsx';
import AdminClassStudentsPage from './AdminClassStudentsPage.tsx';

vi.mock('../../services/adminService.ts', () => ({
  adminService: {
    listClasses: vi.fn(),
    listClassStudents: vi.fn(),
    listStudents: vi.fn(),
    assignStudentClass: vi.fn(),
  },
}));

const service = vi.mocked(adminService);

const options = {
  path: '/admin/classes/3',
  route: '/admin/classes/:classId',
  user: adminUser,
};

const schoolClass: AdminClass = {
  id: 3,
  name: '9A',
  teacher: { id: 5, firstName: 'Laura', lastName: 'Marin' },
  studentCount: 2,
};

const members: ClassStudent[] = [
  {
    id: 7,
    firstName: 'Mihai',
    lastName: 'Constantin',
    dateOfBirth: '2010-05-17',
    email: 'mihai.constantin@student.school.test',
  },
  {
    id: 9,
    firstName: 'Ion',
    lastName: 'Dumitru',
    dateOfBirth: '2010-02-01',
    email: 'ion.dumitru@student.school.test',
  },
];

const unassigned: AdminStudent[] = [
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

async function openAddWindow() {
  await screen.findByRole('heading', { name: 'Class 9A' });
  fireEvent.click(screen.getByRole('button', { name: 'Add students' }));
}

describe('AdminClassStudentsPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    service.listClasses.mockResolvedValue({
      data: [schoolClass],
      meta: meta(1),
    });
    service.listClassStudents.mockResolvedValue({
      data: members,
      meta: meta(2),
    });
    service.listStudents.mockResolvedValue({
      data: unassigned,
      meta: meta(1),
    });
  });

  it('shows the class, its teacher and its students', async () => {
    renderPage(<AdminClassStudentsPage />, options);

    expect(
      await screen.findByRole('heading', { name: 'Class 9A' }),
    ).toBeVisible();
    expect(screen.getByText('Class teacher: Laura Marin')).toBeVisible();
    expect(await screen.findByText('Constantin Mihai')).toBeVisible();
    expect(screen.getByText('Dumitru Ion')).toBeVisible();
  });

  it('says so when the class has no teacher', async () => {
    service.listClasses.mockResolvedValue({
      data: [{ ...schoolClass, teacher: null }],
      meta: meta(1),
    });
    renderPage(<AdminClassStudentsPage />, options);

    expect(
      await screen.findByText('The class has no class teacher yet.'),
    ).toBeVisible();
  });

  it('does not open a class that does not exist', async () => {
    service.listClasses.mockResolvedValue({
      data: [{ ...schoolClass, id: 99 }],
      meta: meta(1),
    });
    renderPage(<AdminClassStudentsPage />, options);

    expect(await screen.findByText('Class not found')).toBeVisible();
    expect(screen.queryByText('Constantin Mihai')).not.toBeInTheDocument();
  });

  it('removes a student from the class only after confirmation', async () => {
    service.assignStudentClass.mockResolvedValue(unassigned[0]);
    renderPage(<AdminClassStudentsPage />, options);

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Remove from class' }))[0],
    );
    const confirmation = within(await dialog());

    expect(confirmation.getByText(/Mihai Constantin/)).toBeVisible();

    fireEvent.click(confirmation.getByRole('button', { name: 'Remove' }));

    expect(
      await screen.findByText('The student was removed from the class.'),
    ).toBeVisible();
    expect(service.assignStudentClass).toHaveBeenCalledWith(7, null);
  });

  it('lists only the students without a class in the add window', async () => {
    renderPage(<AdminClassStudentsPage />, options);

    await openAddWindow();
    const form = within(await dialog());

    expect(await form.findByText('Popa Ana')).toBeVisible();
    expect(service.listStudents).toHaveBeenCalledWith(
      expect.objectContaining({ classFilter: 'none' }),
    );
  });

  it('adds a student to the class from the add window', async () => {
    service.assignStudentClass.mockResolvedValue(unassigned[0]);
    renderPage(<AdminClassStudentsPage />, options);

    await openAddWindow();
    const form = within(await dialog());
    await form.findByText('Popa Ana');
    fireEvent.click(form.getByRole('button', { name: 'Add' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, add' }));

    expect(
      await screen.findByText('The student was added to the class.'),
    ).toBeVisible();
    expect(service.assignStudentClass).toHaveBeenCalledWith(8, 3);
  });

  it('tells when every student already has a class', async () => {
    service.listStudents.mockResolvedValue({ data: [], meta: meta(0) });
    renderPage(<AdminClassStudentsPage />, options);

    await openAddWindow();

    expect(
      await within(await dialog()).findByText(
        'There are no students without a class',
      ),
    ).toBeVisible();
  });
});
