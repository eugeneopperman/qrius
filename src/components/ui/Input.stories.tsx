import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed above the input',
    },
    error: {
      control: 'text',
      description: 'Error message displayed below the input',
    },
    hint: {
      control: 'text',
      description: 'Hint text displayed below the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

export const Required: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    required: true,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    type: 'password',
    hint: 'Must be at least 8 characters',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    defaultValue: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Input label="Normal" placeholder="Normal input" />
      <Input label="With Hint" placeholder="With hint" hint="This is a helpful hint" />
      <Input label="With Error" placeholder="With error" error="This field has an error" />
      <Input label="Disabled" placeholder="Disabled input" disabled />
      <Input label="Required" placeholder="Required field" required />
    </div>
  ),
};

export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4">
      <Input label="Text" type="text" placeholder="Plain text" />
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Input label="Password" type="password" placeholder="Enter password" />
      <Input label="Number" type="number" placeholder="0" />
      <Input label="Phone" type="tel" placeholder="+1 (555) 123-4567" />
      <Input label="URL" type="url" placeholder="https://example.com" />
    </div>
  ),
};
