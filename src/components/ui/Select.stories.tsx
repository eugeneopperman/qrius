import type { Meta, StoryObj } from '@storybook/react';
import { Select, type SelectOption } from './Select';

const sampleOptions: SelectOption[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed above the select',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below the select',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
    options: {
      description: 'Array of { value, label } objects for the select options',
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: sampleOptions,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Size',
    options: sampleOptions,
  },
};

export const WithError: Story = {
  args: {
    label: 'Size',
    options: sampleOptions,
    error: 'Please select a valid size',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Size',
    options: sampleOptions,
    disabled: true,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Size',
    options: sampleOptions,
    hint: 'Choose a t-shirt size',
  },
};

export const Required: Story = {
  args: {
    label: 'Size',
    options: sampleOptions,
    required: true,
  },
};

export const AllStates: Story = {
  args: {
    options: sampleOptions,
  },
  render: () => (
    <div className="flex flex-col gap-6 w-64">
      <Select options={sampleOptions} />
      <Select label="With Label" options={sampleOptions} />
      <Select label="With Hint" options={sampleOptions} hint="Choose a size" />
      <Select label="Required" options={sampleOptions} required />
      <Select label="With Error" options={sampleOptions} error="This field is required" />
      <Select label="Disabled" options={sampleOptions} disabled />
    </div>
  ),
};
