// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog.tsx';

function renderDialog(open: boolean) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  render(
    <ConfirmDialog
      open={open}
      title="Delete student"
      message="This cannot be undone."
      confirmLabel="Delete"
      danger
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );

  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('shows the title and the message when open', () => {
    renderDialog(true);

    expect(
      screen.getByRole('dialog', { name: 'Delete student' }),
    ).toBeVisible();
    expect(screen.getByText('This cannot be undone.')).toBeVisible();
  });

  it('renders no content while closed', () => {
    renderDialog(false);

    expect(
      screen.queryByText('This cannot be undone.'),
    ).not.toBeInTheDocument();
  });

  it('calls the matching callback for each button', () => {
    const { onConfirm, onCancel } = renderDialog(true);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
