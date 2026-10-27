// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination.tsx';

const meta = { page: 2, limit: 20, total: 45, totalPages: 3 };

describe('Pagination', () => {
  it('shows the total and marks the current page', () => {
    render(<Pagination meta={meta} onPageChange={vi.fn()} />);

    expect(screen.getByText('45 records')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('jumps to a page and shortens a long list of pages', () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        meta={{ page: 5, limit: 10, total: 200, totalPages: 20 }}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Page 20' }));

    expect(onPageChange).toHaveBeenCalledWith(20);
    expect(screen.queryByRole('button', { name: 'Page 10' })).toBeNull();
  });

  it('moves to the previous and the next page', () => {
    const onPageChange = vi.fn();
    render(<Pagination meta={meta} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
  });

  it('disables the buttons at both ends', () => {
    const { rerender } = render(
      <Pagination meta={{ ...meta, page: 1 }} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    rerender(<Pagination meta={{ ...meta, page: 3 }} onPageChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('renders nothing when there are no records', () => {
    const { container } = render(
      <Pagination
        meta={{ page: 1, limit: 20, total: 0, totalPages: 0 }}
        onPageChange={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
