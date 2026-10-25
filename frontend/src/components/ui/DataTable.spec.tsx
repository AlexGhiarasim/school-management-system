// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable, type Column } from './DataTable.tsx';

interface Row {
  id: number;
  name: string;
}

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name', render: (row) => row.name },
];

describe('DataTable', () => {
  it('renders a row for every item with accessible headers', () => {
    render(
      <DataTable
        caption="People"
        columns={columns}
        rows={[
          { id: 1, name: 'Maria' },
          { id: 2, name: 'Ion' },
        ]}
        rowKey={(row) => row.id}
      />,
    );

    expect(screen.getByRole('table', { name: 'People' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    expect(screen.getByText('Maria')).toBeVisible();
    expect(screen.getByText('Ion')).toBeVisible();
  });

  it('shows the empty state when there are no rows', () => {
    render(
      <DataTable
        caption="People"
        columns={columns}
        rows={[]}
        rowKey={(row: Row) => row.id}
      />,
    );

    expect(screen.getByText('Nothing to show')).toBeVisible();
  });

  it('shows placeholders instead of rows while loading', () => {
    render(
      <DataTable
        caption="People"
        columns={columns}
        rows={[{ id: 1, name: 'Maria' }]}
        rowKey={(row) => row.id}
        loading
        skeletonRows={3}
      />,
    );

    expect(screen.queryByText('Maria')).not.toBeInTheDocument();
    expect(screen.queryByText('Nothing to show')).not.toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });
});
