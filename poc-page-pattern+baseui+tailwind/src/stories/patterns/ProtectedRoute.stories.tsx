import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../components';

const meta = {
  title: 'Components/ProtectedRoute',
  component: ProtectedRoute,
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
} satisfies Meta<typeof ProtectedRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

const DashboardPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p className="text-gray-600">This is a protected page that requires authentication.</p>
  </div>
);

export const Authenticated: Story = {
  args: {
    children: <DashboardPage />,
  },
  decorators: [
    (Story) => {
      // Mock authenticated state
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ email: 'user@example.com' }));
      return (
        <Routes>
          <Route path="/*" element={<Story />} />
        </Routes>
      );
    },
  ],
  render: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
};

export const Unauthenticated: Story = {
  args: {
    children: <DashboardPage />,
  },
  decorators: [
    (Story) => {
      // Mock unauthenticated state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return (
        <Routes>
          <Route path="/*" element={<Story />} />
          <Route path="/login" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Login Page</h1>
              <p className="text-gray-600">You have been redirected to the login page.</p>
            </div>
          } />
        </Routes>
      );
    },
  ],
  render: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
};
