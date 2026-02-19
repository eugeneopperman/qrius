import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
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
      description: 'Label text displayed above the textarea',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below the textarea',
    },
    hint: {
      control: 'text',
      description: 'Hint text displayed below the textarea (hidden when error is present)',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when textarea is empty',
    },
    required: {
      control: 'boolean',
      description: 'Whether the textarea is required (shows asterisk on label)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the textarea is disabled',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text rows',
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    hint: 'Maximum 500 characters',
  },
};

export const WithError: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    error: 'Description is required',
  },
};

export const Required: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Enter your comments...',
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Notes',
    placeholder: 'This field is disabled',
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Textarea placeholder="Default textarea" />
      <Textarea label="With Label" placeholder="Enter text..." />
      <Textarea label="With Hint" placeholder="Enter text..." hint="This is a helpful hint" />
      <Textarea label="With Error" placeholder="Enter text..." error="This field is required" />
      <Textarea label="Required Field" placeholder="Enter text..." required />
      <Textarea label="Disabled" placeholder="Cannot edit" disabled />
    </div>
  ),
};
