/**
 * DataTablePage Component
 * Complete data table page following Twilio Design System DataTablePage Pattern
 */

import { ReactNode } from 'react';
import { Page } from './Page';
import { PageHeader } from './PageHeader';
import { SearchBar } from '../ui/SearchBar';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  width?: string;
}

interface DataTablePageProps<T> {
  title: string;
  description?: string;
  actions?: ReactNode;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
}

export function DataTablePage<T>({
  title,
  description,
  actions,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  keyExtractor,
}: DataTablePageProps<T>) {
  return (
    <Page>
      <PageHeader title={title} description={description} actions={actions} />

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-lg border border-twilio-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-twilio-gray-200">
            <thead className="bg-twilio-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-twilio-gray-700"
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-twilio-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-sm text-twilio-gray-500"
                  >
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-twilio-gray-300 border-t-twilio-blue"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-sm text-twilio-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    className="hover:bg-twilio-gray-50 transition-colors"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="whitespace-nowrap px-6 py-4 text-sm text-twilio-gray-900"
                      >
                        {column.render(item)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer */}
      {data.length > 0 && (
        <div className="mt-4 flex items-center justify-between px-2">
          <div className="text-sm text-twilio-gray-700">
            Showing <span className="font-medium">{data.length}</span>{' '}
            {data.length === 1 ? 'result' : 'results'}
          </div>
        </div>
      )}
    </Page>
  );
}
