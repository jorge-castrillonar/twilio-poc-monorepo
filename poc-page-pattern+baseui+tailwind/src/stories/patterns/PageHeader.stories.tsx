import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from '../../components';
import { Button } from '../../components';

const meta = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Dashboard',
  },
};

export const WithDescription: Story = {
  args: {
    title: 'User Management',
    description: 'Manage users, roles, and permissions for your organization.',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Files',
    description: 'Upload and manage your files securely.',
    actions: (
      <div className="flex gap-2">
        <Button variant="secondary">Export</Button>
        <Button variant="primary">Upload File</Button>
      </div>
    ),
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Very Long Page Title That Demonstrates How Headers Handle Extended Text',
    description: 'This is a longer description that provides additional context about the page and what users can do here. It can span multiple lines if needed.',
  },
};

export const WithMultipleActions: Story = {
  args: {
    title: 'Projects',
    description: 'View and manage all your projects.',
    actions: (
      <div className="flex gap-2">
        <Button variant="ghost">Filter</Button>
        <Button variant="secondary">Export</Button>
        <Button variant="secondary">Import</Button>
        <Button variant="primary">New Project</Button>
      </div>
    ),
  },
};
