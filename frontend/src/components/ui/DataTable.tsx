import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState.tsx';
import { LoadingPanel } from './LoadingPanel.tsx';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  // Let long text wrap onto several lines. By default a cell stays on one line.
  wrap?: boolean;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  empty?: ReactNode;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  loading = false,
  empty,
}: DataTableProps<T>) {
  const showEmpty = !loading && rows.length === 0;

  if (loading) return <LoadingPanel />;

  return (
    <div className="@container overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-300">
      <table className="w-full text-left text-[15px]">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-[13px] font-semibold tracking-wide text-slate-600 uppercase">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 ${column.wrap ? '' : 'whitespace-nowrap'} ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {showEmpty && (
            <tr>
              <td colSpan={columns.length}>{empty ?? <EmptyState />}</td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => (
              <tr key={rowKey(row)} className="transition hover:bg-slate-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3.5 text-slate-700 ${column.wrap ? '' : 'whitespace-nowrap'} ${column.className ?? ''}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
