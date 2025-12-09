import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '../../components/ui/Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Alert visual style and semantic meaning',
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    type: 'success',
    message: 'Your changes have been saved successfully!',
  },
};

export const Error: Story = {
  args: {
    type: 'error',
    message: 'Failed to save changes. Please try again.',
  },
};

export const Warning: Story = {
  args: {
    type: 'warning',
    message: 'Your session will expire in 5 minutes. Please save your work.',
  },
};

export const Info: Story = {
  args: {
    type: 'info',
    message: 'New features are available! Check out our latest updates.',
  },
};

export const LongMessage: Story = {
  args: {
    type: 'error',
    message: 'An unexpected error occurred while processing your request. The server may be temporarily unavailable. Please check your internet connection and try again in a few minutes. If the problem persists, contact support.',
  },
};

/**
 * Base UI Feature: Close button using Base UI Button
 * Alert close button now uses @base-ui-components/react/button
 */
export const Dismissible: Story = {
  args: {
    type: 'info',
    title: 'Dismissible Alert',
    message: 'This alert can be dismissed using the Base UI Button component.',
    onClose: () => console.log('Alert dismissed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Close button uses Base UI Button component for consistent behavior and accessibility.',
      },
    },
  },
};
