import type { Meta, StoryObj } from '@storybook/react';
import { ToastContainer } from './Toast';
import { toast } from '../../stores/toastStore';
import { Button } from './Button';

const meta = {
  title: 'UI/Toast',
  component: ToastContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => (
    <div className="p-8 space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Click buttons to trigger toast notifications.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => toast.success('Action completed successfully!')}>
          Success Toast
        </Button>
        <Button variant="danger" onClick={() => toast.error('Something went wrong.')}>
          Error Toast
        </Button>
        <Button variant="secondary" onClick={() => toast.info('Here is some information.')}>
          Info Toast
        </Button>
        <Button variant="secondary" onClick={() => toast.warning('Please check your input.')}>
          Warning Toast
        </Button>
      </div>
      <ToastContainer />
    </div>
  ),
};
