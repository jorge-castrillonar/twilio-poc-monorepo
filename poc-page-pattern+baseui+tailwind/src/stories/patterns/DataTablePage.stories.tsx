import type { Meta, StoryObj } from '@storybook/react';
import { DataTablePage } from '../../components';
import { Button } from '../../components';

const meta = {
  title: 'Components/DataTablePage',
  component: DataTablePage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTablePage>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for demonstrations
const userData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'Manager', status: 'Active' },
];

const fileData = [
  { id: 1, name: 'document.pdf', size: '2.4 MB', uploadedAt: '2024-01-15', status: 'Uploaded' },
  { id: 2, name: 'image.png', size: '856 KB', uploadedAt: '2024-01-14', status: 'Uploaded' },
  { id: 3, name: 'report.xlsx', size: '1.2 MB', uploadedAt: '2024-01-13', status: 'Processing' },
];

export const UserTable: Story = {
  args: {
    title: 'Users',
    description: 'Manage your team members and their permissions.',
    searchPlaceholder: 'Search users...',
    data: userData,
    searchValue: '',
    onSearchChange: () => {},
    keyExtractor: (item: any) => item.id.toString(),
    actions: <Button variant="primary">Add User</Button>,
    columns: [
      {
        key: 'name',
        header: 'Name',
        render: (item: any) => <span className="font-medium">{item.name}</span>,
      },
      {
        key: 'email',
        header: 'Email',
        render: (item: any) => <span className="text-gray-600">{item.email}</span>,
      },
      {
        key: 'role',
        header: 'Role',
        render: (item: any) => (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
            {item.role}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: any) => (
          <span
            className={`px-2 py-1 rounded text-sm ${
              item.status === 'Active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {item.status}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: () => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="!text-blue-600 hover:!text-blue-800">Edit</Button>
            <Button variant="ghost" size="sm" className="!text-red-600 hover:!text-red-800">Delete</Button>
          </div>
        ),
      },
    ],
  },
};

export const FileTable: Story = {
  args: {
    title: 'Files',
    description: 'Upload and manage your files securely.',
    searchPlaceholder: 'Search files...',
    data: fileData,
    searchValue: '',
    onSearchChange: () => {},
    keyExtractor: (item: any) => item.id.toString(),
    actions: <Button variant="primary">Upload File</Button>,
    columns: [
      {
        key: 'name',
        header: 'Name',
        render: (item: any) => (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{item.name}</span>
          </div>
        ),
      },
      {
        key: 'size',
        header: 'Size',
        render: (item: any) => <span className="text-gray-600">{item.size}</span>,
      },
      {
        key: 'uploadedAt',
        header: 'Uploaded',
        render: (item: any) => <span className="text-gray-600">{item.uploadedAt}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        render: (item: any) => (
          <span
            className={`px-2 py-1 rounded text-sm ${
              item.status === 'Uploaded'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {item.status}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: () => (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="!text-blue-600 hover:!text-blue-800">Download</Button>
            <Button variant="ghost" size="sm" className="!text-red-600 hover:!text-red-800">Delete</Button>
          </div>
        ),
      },
    ],
  },
};

export const EmptyState: Story = {
  args: {
    title: 'Products',
    description: 'Manage your product catalog.',
    searchPlaceholder: 'Search products...',
    data: [],
    searchValue: '',
    onSearchChange: () => {},
    keyExtractor: (item: any) => item.id.toString(),
    actions: <Button variant="primary">Add Product</Button>,
    columns: [
      { key: 'name', header: 'Name', render: (item: any) => item.name },
      { key: 'price', header: 'Price', render: (item: any) => item.price },
      { key: 'stock', header: 'Stock', render: (item: any) => item.stock },
    ],
  },
};
