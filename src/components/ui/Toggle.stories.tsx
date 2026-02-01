import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toggle, InlineToggle } from './Toggle';
import { HelpCircle } from 'lucide-react';

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the toggle is checked/on',
    },
    label: {
      control: 'text',
      description: 'Label text for the toggle',
    },
    description: {
      control: 'text',
      description: 'Additional description text',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the toggle switch',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper for stories
const ToggleWrapper = (args: Parameters<typeof Toggle>[0]) => {
  const [checked, setChecked] = useState(args.checked ?? false);
  return <Toggle {...args} checked={checked} onChange={setChecked} />;
};

export const Default: Story = {
  render: (args) => <ToggleWrapper {...args} />,
  args: {
    label: 'Enable feature',
    checked: false,
    onChange: () => {},
  },
};

export const WithDescription: Story = {
  render: (args) => <ToggleWrapper {...args} />,
  args: {
    label: 'Dark mode',
    description: 'Use dark theme across the application',
    checked: false,
    onChange: () => {},
  },
};

export const Small: Story = {
  render: (args) => <ToggleWrapper {...args} />,
  args: {
    label: 'Compact toggle',
    size: 'sm',
    checked: false,
    onChange: () => {},
  },
};

export const Checked: Story = {
  render: (args) => <ToggleWrapper {...args} />,
  args: {
    label: 'Enabled',
    checked: true,
    onChange: () => {},
  },
};

export const Disabled: Story = {
  render: (args) => <ToggleWrapper {...args} />,
  args: {
    label: 'Disabled toggle',
    disabled: true,
    checked: false,
    onChange: () => {},
  },
};

export const DisabledChecked: Story = {
  render: (args) => <ToggleWrapper {...args} />,
  args: {
    label: 'Disabled (on)',
    checked: true,
    disabled: true,
    onChange: () => {},
  },
};

// Inline Toggle stories
const InlineToggleWrapper = (props: { label: string; tooltip?: React.ReactNode }) => {
  const [checked, setChecked] = useState(false);
  return <InlineToggle {...props} checked={checked} onChange={setChecked} />;
};

export const Inline: Story = {
  args: {
    label: 'Use gradient',
    checked: false,
    onChange: () => {},
  },
  render: () => (
    <div className="w-64">
      <InlineToggleWrapper label="Use gradient" />
    </div>
  ),
};

export const InlineWithTooltip: Story = {
  args: {
    label: 'Show URL',
    checked: false,
    onChange: () => {},
  },
  render: () => (
    <div className="w-64">
      <InlineToggleWrapper
        label="Show URL"
        tooltip={<HelpCircle className="w-3.5 h-3.5 text-gray-400" />}
      />
    </div>
  ),
};

export const AllStates: Story = {
  args: {
    label: 'Toggle',
    checked: false,
    onChange: () => {},
  },
  render: () => {
    const ToggleDemo = ({ label, ...props }: { label: string; checked?: boolean; description?: string; disabled?: boolean; size?: 'sm' | 'md' }) => {
      const [checked, setChecked] = useState(props.checked ?? false);
      return <Toggle {...props} label={label} checked={checked} onChange={setChecked} />;
    };

    const InlineDemo = ({ label }: { label: string }) => {
      const [checked, setChecked] = useState(false);
      return <InlineToggle label={label} checked={checked} onChange={setChecked} />;
    };

    return (
      <div className="space-y-4">
        <ToggleDemo label="Off" />
        <ToggleDemo label="On" checked />
        <ToggleDemo label="With description" description="Additional info here" />
        <ToggleDemo label="Disabled" disabled />
        <ToggleDemo label="Small size" size="sm" />
        <div className="w-64">
          <InlineDemo label="Inline style" />
        </div>
      </div>
    );
  },
};
