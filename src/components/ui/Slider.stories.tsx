import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed above the slider',
    },
    showValue: {
      control: 'boolean',
      description: 'Whether to display the current value next to the label',
    },
    unit: {
      control: 'text',
      description: 'Unit suffix for the value display (e.g., "%", "px")',
    },
    min: {
      control: 'number',
      description: 'Minimum value of the slider',
    },
    max: {
      control: 'number',
      description: 'Maximum value of the slider',
    },
    step: {
      control: 'number',
      description: 'Step increment between values',
    },
    value: {
      control: 'number',
      description: 'Current value of the slider',
    },
    onChange: {
      action: 'onChange',
      description: 'Callback fired when the slider value changes',
    },
    showTicks: {
      control: 'boolean',
      description: 'Whether to show tick marks at min and max',
    },
    tickLabels: {
      description: 'Custom labels for tick marks',
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    min: 0,
    max: 100,
    value: 50,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Volume',
    min: 0,
    max: 100,
    value: 75,
  },
};

export const WithUnit: Story = {
  args: {
    label: 'Opacity',
    min: 0,
    max: 100,
    value: 80,
    unit: '%',
  },
};

export const WithTicks: Story = {
  args: {
    label: 'Quality',
    min: 0,
    max: 100,
    value: 60,
    unit: '%',
    showTicks: true,
  },
};

export const CustomRange: Story = {
  args: {
    label: 'Opacity',
    min: 0,
    max: 1,
    step: 0.1,
    value: 0.3,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Slider min={0} max={100} value={50} />
      <Slider label="With Label" min={0} max={100} value={75} />
      <Slider label="With Unit" min={0} max={100} value={80} unit="%" />
      <Slider label="With Ticks" min={0} max={100} value={60} unit="%" showTicks />
      <Slider
        label="Custom Tick Labels"
        min={1}
        max={5}
        step={1}
        value={3}
        showTicks
        tickLabels={['Very Low', 'Low', 'Medium', 'High', 'Very High']}
      />
      <Slider label="Fine Control" min={0} max={1} step={0.1} value={0.3} />
    </div>
  ),
};
