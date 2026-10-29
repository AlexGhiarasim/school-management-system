// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminService } from '../../../services/adminService.ts';
import { renderPage, adminUser } from '../../../test/renderPage.tsx';
import { ImportModal } from './ImportModal.tsx';

vi.mock('../../../services/adminService.ts', () => ({
  adminService: {
    previewImport: vi.fn(),
    commitImport: vi.fn(),
    downloadImportTemplate: vi.fn(),
  },
}));

const service = vi.mocked(adminService);

const preview = {
  ignoredColumns: [],
  total: 2,
  valid: 1,
  invalid: 1,
  rows: [
    {
      line: 2,
      values: {
        lastName: 'Popescu',
        firstName: 'Maria',
        email: 'maria@school.test',
      },
      errors: [],
    },
    {
      line: 3,
      values: { lastName: 'Ionescu', firstName: 'Andrei', email: 'oops' },
      errors: [{ field: 'email', code: 'email' }],
    },
  ],
};

describe('ImportModal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // jsdom has no File.arrayBuffer.
    File.prototype.arrayBuffer = function () {
      return Promise.resolve(
        new TextEncoder().encode('a;b').buffer as ArrayBuffer,
      );
    };
  });

  it('shows the rows before importing and imports only after confirmation', async () => {
    service.previewImport.mockResolvedValue(preview);
    service.commitImport.mockResolvedValue({
      created: 1,
      skipped: 1,
      accounts: [
        {
          name: 'Popescu Maria',
          email: 'maria@school.test',
          password: 'Abc12345',
        },
      ],
    });
    renderPage(<ImportModal kind="students" open onClose={vi.fn()} />, {
      path: '/',
      route: '/',
      user: adminUser,
    });

    fireEvent.change(
      document.querySelector('input[type=file]') as HTMLInputElement,
      {
        target: {
          files: [new File(['a;b'], 'students.csv', { type: 'text/csv' })],
        },
      },
    );

    expect(await screen.findByText('Popescu')).toBeVisible();
    expect(screen.getByText('The email is not valid')).toBeVisible();
    expect(service.commitImport).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Import 1 student' }));

    expect(await screen.findByText('Imported 1 student')).toBeVisible();
    expect(service.commitImport).toHaveBeenCalledWith('students', 'a;b');
    expect(
      screen.getByRole('button', { name: 'Download the accounts (CSV)' }),
    ).toBeVisible();
  });

  it('tells which columns are missing', async () => {
    service.previewImport.mockResolvedValue({
      ...preview,
      total: 0,
      valid: 0,
      invalid: 0,
      rows: [],
      fileError: { code: 'missingColumns', columns: ['email'] },
    });
    renderPage(<ImportModal kind="students" open onClose={vi.fn()} />, {
      path: '/',
      route: '/',
      user: adminUser,
    });

    fireEvent.change(
      document.querySelector('input[type=file]') as HTMLInputElement,
      {
        target: { files: [new File(['a'], 'students.csv')] },
      },
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'These columns are missing: Email.',
    );
  });
});
