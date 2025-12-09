import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Control modal visibility',
    },
    title: {
      control: 'text',
      description: 'Modal header title',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const ModalWithTrigger = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const Default: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Modal Title',
    children: <p>This is the modal content. You can put any React components here.</p>,
    isOpen: false,
    onClose: () => {},
  },
};

export const WithForm: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Create New Item',
    children: (
      <div className="space-y-4">
        <Input
          label="Name"
          name="name"
          placeholder="Enter name"
        />
        <Input
          label="Description"
          name="description"
          placeholder="Enter description"
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Create</Button>
        </div>
      </div>
    ),
    isOpen: false,
    onClose: () => {},
  },
};

export const Confirmation: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Confirm Deletion',
    children: (
      <div className="space-y-4">
        <p className="text-gray-600">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary">Cancel</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </div>
    ),
    isOpen: false,
    onClose: () => {},
  },
};

export const LongContent: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Terms and Conditions',
    children: (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <div className="flex justify-end">
          <Button variant="primary">Accept</Button>
        </div>
      </div>
    ),
    isOpen: false,
    onClose: () => {},
  },
};
