import type { Meta, StoryObj } from '@storybook/react';
import { FloatingAction } from './FloatingAction';

const meta = {
  title: 'UI/FloatingAction',
  component: FloatingAction,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A floating action button fixed to the bottom-right corner. Hidden on large screens (lg:hidden). Stories use className="!block" to force visibility at all viewport sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: {
      action: 'onClick',
      description: 'Callback when the floating button is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof FloatingAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => {},
    className: '!block',
  },
};

export const CustomPosition: Story = {
  args: {
    onClick: () => {},
    className: '!block !bottom-10 !right-10',
  },
};
