import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../components/ui/Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'HTML input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable input interaction',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const Email: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'user@example.com',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    required: true,
    placeholder: 'John Doe',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    value: 'Cannot edit this',
    disabled: true,
  },
};

export const Number: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: '18',
  },
};

/**
 * Base UI Feature: Automatic data attributes
 * Field component provides data-[invalid], data-[valid], data-[filled], etc.
 */
export const WithValidation: Story = {
  args: {
    label: 'Email with Real-time Validation',
    type: 'email',
    placeholder: 'user@example.com',
    helperText: 'Base UI Field automatically adds data-[invalid] and data-[valid] attributes',
  },
  parameters: {
    docs: {
      description: {
        story: 'Base UI Field provides automatic ARIA attributes and data attributes for styling based on validation state (data-[invalid], data-[valid], data-[dirty], data-[touched], data-[filled], data-[focused]).',
      },
    },
  },
};

/**
 * Base UI Feature: Helper text and descriptions
 * Field.Description component for additional context
 */
export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    helperText: 'Must be at least 8 characters with uppercase, lowercase, and numbers',
    placeholder: 'Enter secure password',
  },
  parameters: {
    docs: {
      description: {
        story: 'Helper text is rendered using Field.Description component with proper ARIA associations.',
      },
    },
  },
};
