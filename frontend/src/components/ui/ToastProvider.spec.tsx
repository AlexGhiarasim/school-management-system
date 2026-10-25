// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useToast } from '../../hooks/useToast.ts';
import { ToastProvider } from './ToastProvider.tsx';

function Trigger() {
  const { notify } = useToast();

  return (
    <button type="button" onClick={() => notify('Saved', 'success')}>
      Notify
    </button>
  );
}

function renderToasts() {
  render(
    <ToastProvider>
      <Trigger />
    </ToastProvider>,
  );
}

describe('ToastProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a message and lets the user dismiss it', () => {
    renderToasts();

    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByText('Saved')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('removes the message by itself after a few seconds', () => {
    renderToasts();

    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('refuses to be used outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Trigger />)).toThrow(/ToastProvider/);

    spy.mockRestore();
  });
});
