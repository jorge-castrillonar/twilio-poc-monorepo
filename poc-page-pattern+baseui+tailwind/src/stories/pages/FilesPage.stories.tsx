import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { FilesPage } from '../../pages/FilesPage';

const meta = {
  title: 'Pages/FilesPage',
  component: FilesPage,
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
} satisfies Meta<typeof FilesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMockAuth: Story = {
  // Note: This page requires authentication context to work properly
};
