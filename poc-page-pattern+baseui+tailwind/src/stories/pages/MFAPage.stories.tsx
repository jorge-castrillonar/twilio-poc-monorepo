import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { MFAPage } from '../../pages/MFAPage';

const meta = {
  title: 'Pages/MFAPage',
  component: MFAPage,
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
} satisfies Meta<typeof MFAPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMockData: Story = {
  // Note: This page requires authentication context to work properly
};
