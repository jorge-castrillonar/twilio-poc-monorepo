import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/ui/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'Button visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button interaction',
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <span className="flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </span>
    ),
  },
};

/**
 * Base UI Feature: focusableWhenDisabled
 * Allows disabled buttons to receive focus for accessibility
 */
export const DisabledButFocusable: Story = {
  args: {
    children: 'Disabled but Focusable (Base UI)',
    disabled: true,
    focusableWhenDisabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Base UI allows disabled buttons to be focusable, improving accessibility. Try tabbing to this button - it can receive focus but not be clicked.',
      },
    },
  },
};

/**
 * Base UI Feature: data-[disabled] attribute styling
 * Shows how disabled state is handled through data attributes
 */
export const LoadingState: Story = {
  args: {
    children: (
      <span className="flex items-center gap-2">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </span>
    ),
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading button using Base UI disabled state with data-[disabled] attribute for styling.',
      },
    },
  },
};
