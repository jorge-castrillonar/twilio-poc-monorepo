import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileUploadModal } from '../../components';
import { Button } from '../../components';

const meta = {
  title: 'Components/FileUploadModal',
  component: FileUploadModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FileUploadModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const FileUploadWithTrigger = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Upload File</Button>
      <FileUploadModal 
        {...args} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export const Default: Story = {
  render: (args) => <FileUploadWithTrigger {...args} />,
  args: {
    isOpen: false,
    onClose: () => {},
    onUploadSuccess: () => {
      console.log('Upload successful!');
    },
    uploadFile: async (file: File, onProgress?: (progress: number) => void) => {
      // Simulate upload with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        onProgress?.(i);
      }
      console.log('File uploaded:', file.name);
      return { success: true };
    },
  },
};

export const WithCustomHandler: Story = {
  render: (args) => <FileUploadWithTrigger {...args} />,
  args: {
    isOpen: false,
    onClose: () => {},
    onUploadSuccess: () => {
      alert('File uploaded successfully!');
    },
    uploadFile: async (file: File, onProgress?: (progress: number) => void) => {
      console.log('Starting upload:', file.name);
      // Simulate slower upload
      for (let i = 0; i <= 100; i += 5) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        onProgress?.(i);
      }
      console.log('Upload complete:', file.name);
      return { success: true };
    },
  },
};
