import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from '../../components/ui/SearchBar';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text for search input',
    },
    onChange: { action: 'changed' },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search...',
  },
};

export const FileSearch: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search files by name...',
  },
};

export const UserSearch: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Search users by email or name...',
  },
};

export const WithInitialValue: Story = {
  args: {
    value: 'example search',
    onChange: () => {},
    placeholder: 'Search...',
  },
};

/**
 * Base UI Feature: Using Base UI Input component
 * SearchBar now uses @base-ui-components/react/input with onValueChange
 */
export const BaseUIFeatures: Story = {
  args: {
    value: '',
    onChange: () => {},
    placeholder: 'Type to search... (Base UI Input)',
  },
  parameters: {
    docs: {
      description: {
        story: 'SearchBar uses Base UI Input component with onValueChange handler and automatic data attributes (data-[disabled], data-[filled], data-[focused]) for enhanced accessibility.',
      },
    },
  },
};
