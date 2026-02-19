import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, LabelWithTooltip } from './Tooltip';

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="p-20">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Content displayed inside the tooltip',
    },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Position of the tooltip relative to the trigger element',
    },
    delay: {
      control: 'number',
      description: 'Delay in milliseconds before the tooltip appears',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the tooltip wrapper',
    },
    children: {
      description: 'Trigger element; defaults to a help icon if not provided',
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a helpful tooltip with more information.',
  },
};

export const WithChild: Story = {
  args: {
    content: 'Tooltip triggered by hovering the button',
    children: (
      <button
        type="button"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Hover me
      </button>
    ),
  },
};

export const TopPosition: Story = {
  args: {
    content: 'Tooltip on top',
    position: 'top',
    children: (
      <button
        type="button"
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium"
      >
        Top
      </button>
    ),
  },
};

export const BottomPosition: Story = {
  args: {
    content: 'Tooltip on bottom',
    position: 'bottom',
    children: (
      <button
        type="button"
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium"
      >
        Bottom
      </button>
    ),
  },
};

export const WithLabelTooltip: Story = {
  args: {
    content: 'Label tooltip example',
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <LabelWithTooltip
        label="Email Address"
        tooltip="We will never share your email with third parties."
      />
      <LabelWithTooltip
        label="API Key"
        tooltip="Your API key is used to authenticate programmatic requests."
        required
      />
    </div>
  ),
};
