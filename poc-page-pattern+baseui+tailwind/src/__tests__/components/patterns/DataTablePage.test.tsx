/**
 * Tests for DataTablePage Component
 * Data table display pattern with search and pagination
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { DataTablePage } from '../../../components/patterns/DataTablePage';

type MockDataItem = {
  id: string;
  name: string;
  status: string;
  date: string;
};

const mockData: MockDataItem[] = [
  { id: '1', name: 'Item 1', status: 'Active', date: '2024-01-01' },
  { id: '2', name: 'Item 2', status: 'Inactive', date: '2024-01-02' },
  { id: '3', name: 'Item 3', status: 'Active', date: '2024-01-03' },
];

const mockColumns = [
  { key: 'name', header: 'Name', render: (item: MockDataItem) => item.name },
  { key: 'status', header: 'Status', render: (item: MockDataItem) => item.status },
  { key: 'date', header: 'Date', render: (item: MockDataItem) => item.date },
];

describe('DataTablePage', () => {
  const mockKeyExtractor = (item: MockDataItem) => item.id;
  const mockOnSearchChange = jest.fn();

  beforeEach(() => {
    mockOnSearchChange.mockClear();
  });

  describe('Basic rendering', () => {
    it('should render table with data', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      expect(screen.getByText('Test Table')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      // Headers are transformed to uppercase with CSS
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    it('should render with optional description', () => {
      render(
        <DataTablePage
          title="Test Table"
          description="Table description"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      expect(screen.getByText('Table description')).toBeInTheDocument();
    });

    it('should render with custom search placeholder', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          searchPlaceholder="Search items..."
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      expect(screen.getByPlaceholderText('Search items...')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner when loading', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={[]}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
          loading={true}
        />
      );

      expect(screen.getByText('Test Table')).toBeInTheDocument();
      // Loading spinner should be visible
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show data when loading', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
          loading={true}
        />
      );

      // Data should not be visible during loading
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show default empty message when no data', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={[]}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={[]}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
          emptyMessage="No items found"
        />
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should render search input', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should call onSearchChange when typing in search', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'Item 1' } });

      // BaseUI Input calls with value and event object
      expect(mockOnSearchChange).toHaveBeenCalledWith(
        'Item 1',
        expect.objectContaining({
          event: expect.any(Object),
        })
      );
    });

    it('should display the search value', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue="test query"
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
      expect(searchInput.value).toBe('test query');
    });
  });

  describe('Actions', () => {
    it('should render action buttons when provided', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
          actions={<button>Add New</button>}
        />
      );

      expect(screen.getByRole('button', { name: 'Add New' })).toBeInTheDocument();
    });

    it('should render multiple actions', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
          actions={
            <>
              <button>Export</button>
              <button>Import</button>
            </>
          }
        />
      );

      expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
    });
  });

  describe('Table footer', () => {
    it('should show results count when data is present', () => {
      const { container } = render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      // Footer text is split across multiple elements
      const footer = container.querySelector('.mt-4.flex.items-center');
      expect(footer).toHaveTextContent(/showing.*3.*results/i);
    });

    it('should show singular "result" for single item', () => {
      const { container } = render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={[mockData[0]]}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      // Footer text is split across multiple elements
      const footer = container.querySelector('.mt-4.flex.items-center');
      expect(footer).toHaveTextContent(/showing.*1.*result$/i);
    });

    it('should not show footer when no data', () => {
      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={[]}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    });
  });

  describe('Column rendering', () => {
    it('should apply custom column width', () => {
      const columnsWithWidth = [
        { key: 'name', header: 'Name', render: (item: MockDataItem) => item.name, width: '300px' },
        { key: 'status', header: 'Status', render: (item: MockDataItem) => item.status },
      ];

      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={columnsWithWidth}
          keyExtractor={mockKeyExtractor}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveStyle({ width: '300px' });
    });

    it('should render custom cell content', () => {
      const customColumns = [
        {
          key: 'name',
          header: 'Name',
          render: (item: MockDataItem) => <strong>{item.name}</strong>,
        },
      ];

      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={[mockData[0]]}
          columns={customColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      const nameCell = screen.getByText('Item 1');
      expect(nameCell.tagName).toBe('STRONG');
    });
  });

  describe('Edge cases', () => {
    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        name: `Item ${i}`,
        status: 'Active',
        date: '2024-01-01',
      }));

      const { container } = render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={largeData}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      expect(screen.getByText('Test Table')).toBeInTheDocument();
      const footer = container.querySelector('.mt-4.flex.items-center');
      expect(footer).toHaveTextContent(/showing.*100.*results/i);
    });

    it('should handle empty strings in data', () => {
      const dataWithEmptyStrings: MockDataItem[] = [
        { id: '1', name: '', status: '', date: '' },
      ];

      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={dataWithEmptyStrings}
          columns={mockColumns}
          keyExtractor={mockKeyExtractor}
        />
      );

      expect(screen.getByText('Test Table')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should use keyExtractor correctly for row keys', () => {
      const customKeyExtractor = jest.fn((item: MockDataItem) => `custom-${item.id}`);

      render(
        <DataTablePage
          title="Test Table"
          searchValue=""
          onSearchChange={mockOnSearchChange}
          data={mockData}
          columns={mockColumns}
          keyExtractor={customKeyExtractor}
        />
      );

      expect(customKeyExtractor).toHaveBeenCalledTimes(mockData.length);
      mockData.forEach((item) => {
        expect(customKeyExtractor).toHaveBeenCalledWith(item);
      });
    });
  });
});
