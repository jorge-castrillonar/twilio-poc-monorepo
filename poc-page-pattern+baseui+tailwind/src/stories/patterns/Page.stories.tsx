import type { Meta, StoryObj } from '@storybook/react';
import { Page } from '../../components/patterns/Page';
import { PageHeader } from '../../components/patterns/PageHeader';
import { Button } from '../../components/ui/Button';

const meta = {
  title: 'Layout/Page',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <PageHeader title="Dashboard" />
        <div className="space-y-4">
          <p className="text-gray-600">This is the main content area of the page.</p>
          <p className="text-gray-600">The Page component follows Twilio's Page Pattern with consistent header, spacing, and layout.</p>
        </div>
      </>
    ),
  },
};

export const WithDescription: Story = {
  args: {
    children: (
      <>
        <PageHeader 
          title="User Management" 
          description="Manage users, roles, and permissions for your organization."
        />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Active Users</h3>
          <p className="text-gray-600">Content goes here...</p>
        </div>
      </>
    ),
  },
};

export const WithActions: Story = {
  args: {
    children: (
      <>
        <PageHeader 
          title="Files" 
          description="Upload and manage your files securely."
          actions={
            <div className="flex gap-2">
              <Button variant="secondary">Export</Button>
              <Button variant="primary">Upload File</Button>
            </div>
          }
        />
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600">File list would appear here...</p>
        </div>
      </>
    ),
  },
};

export const WithMultipleSections: Story = {
  args: {
    children: (
      <>
        <PageHeader 
          title="Settings" 
          description="Configure your account and application settings."
        />
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
            <p className="text-gray-600">Personal information and preferences.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
            <p className="text-gray-600">Password, MFA, and security preferences.</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
            <p className="text-gray-600">Email and push notification preferences.</p>
          </div>
        </div>
      </>
    ),
  },
};
