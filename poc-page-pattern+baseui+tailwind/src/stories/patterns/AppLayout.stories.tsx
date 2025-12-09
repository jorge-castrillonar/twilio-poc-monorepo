import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from '../../components';

const meta = {
  title: 'Layout/AppLayout',
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Page Content</h1>
        <p className="text-gray-600">
          This is the main application layout with navigation header and content area.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold mb-2">Card 1</h3>
            <p className="text-sm text-gray-600">Some content here</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold mb-2">Card 2</h3>
            <p className="text-sm text-gray-600">Some content here</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold mb-2">Card 3</h3>
            <p className="text-sm text-gray-600">Some content here</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const WithScrollableContent: Story = {
  args: {
    children: (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Long Content Page</h1>
        <p className="text-gray-600 mb-4">
          This demonstrates how the layout handles long, scrollable content.
        </p>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
            <h3 className="font-semibold mb-2">Section {i + 1}</h3>
            <p className="text-sm text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        ))}
      </div>
    ),
  },
};
