import type { Meta, StoryObj } from '@storybook/react';
import { Logo } from './Logo';

const meta = {
  title: 'UI/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Logo size variant',
    },
    showText: {
      control: 'boolean',
      description: 'Whether to show the brand name text',
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const IconOnly: Story = {
  args: {
    showText: false,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 items-start">
      <Logo size="sm" />
      <Logo size="md" />
      <Logo size="lg" />
      <Logo size="md" showText={false} />
    </div>
  ),
};
