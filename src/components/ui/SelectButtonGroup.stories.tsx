import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SelectButtonGroup } from './SelectButtonGroup';

const meta = {
  title: 'UI/SelectButtonGroup',
  component: SelectButtonGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Currently selected value',
    },
    label: {
      control: 'text',
      description: 'Optional label displayed above the group',
    },
    layout: {
      control: 'select',
      options: ['flex', 'grid'],
      description: 'Layout mode for the button group',
    },
    gridCols: {
      control: 'text',
      description: 'Tailwind grid-cols class when layout is grid',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the buttons',
    },
    showPreview: {
      control: 'boolean',
      description: 'Show preview elements in buttons',
    },
  },
} satisfies Meta<typeof SelectButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultOptions = [
  { value: 'square' as const, label: 'Square' },
  { value: 'rounded' as const, label: 'Rounded' },
  { value: 'dots' as const, label: 'Dots' },
  { value: 'classy' as const, label: 'Classy' },
  { value: 'extra-rounded' as const, label: 'Extra Rounded' },
];

const defaultArgs = { options: defaultOptions, value: 'square', onChange: () => {} } as const;

export const Default: Story = {
  args: { ...defaultArgs },
  render: () => {
    const [value, setValue] = useState('square');
    return (
      <SelectButtonGroup
        options={defaultOptions}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithLabel: Story = {
  args: { ...defaultArgs },
  render: () => {
    const [value, setValue] = useState('square');
    return (
      <SelectButtonGroup
        options={defaultOptions}
        value={value}
        onChange={setValue}
        label="Dot Style"
      />
    );
  },
};

export const GridLayout: Story = {
  args: { ...defaultArgs },
  render: () => {
    const [value, setValue] = useState('square');
    return (
      <div style={{ width: 320 }}>
        <SelectButtonGroup
          options={defaultOptions}
          value={value}
          onChange={setValue}
          label="Dot Style (Grid)"
          layout="grid"
          gridCols="grid-cols-3"
        />
      </div>
    );
  },
};

export const SmallSize: Story = {
  args: { ...defaultArgs },
  render: () => {
    const [value, setValue] = useState('square');
    return (
      <SelectButtonGroup
        options={defaultOptions}
        value={value}
        onChange={setValue}
        label="Small Buttons"
        size="sm"
      />
    );
  },
};
