import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SelectButton, IconSelectButton, ColorPaletteSelect, GradientPresetSelect } from './SelectButton';
import { AlignLeft, AlignCenter, AlignRight, Square, Circle, Triangle } from 'lucide-react';
import { COLOR_PALETTES } from '../../config/constants';

const meta = {
  title: 'UI/SelectButton',
  component: SelectButton,
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
      description: 'Optional label displayed above options',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the buttons',
    },
    showPreview: {
      control: 'boolean',
      description: 'Show preview elements in a grid layout',
    },
  },
} satisfies Meta<typeof SelectButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const dummyArgs = { options: [], value: '', onChange: () => {} };

const shapeOptions = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
];

function DefaultDemo() {
  const [value, setValue] = useState('square');
  return <SelectButton options={shapeOptions} value={value} onChange={setValue} />;
}

export const Default: Story = {
  args: { ...dummyArgs },
  render: () => <DefaultDemo />,
};

function WithLabelDemo() {
  const [value, setValue] = useState('square');
  return <SelectButton options={shapeOptions} value={value} onChange={setValue} label="Pattern" />;
}

export const WithLabel: Story = {
  args: { ...dummyArgs },
  render: () => <WithLabelDemo />,
};

function SmallSizeDemo() {
  const [value, setValue] = useState('square');
  return <SelectButton options={shapeOptions} value={value} onChange={setValue} size="sm" />;
}

export const SmallSize: Story = {
  args: { ...dummyArgs },
  render: () => <SmallSizeDemo />,
};

function WithIconsDemo() {
  const [value, setValue] = useState('left');
  return (
    <SelectButton
      options={[
        { value: 'left', label: 'Left', icon: AlignLeft },
        { value: 'center', label: 'Center', icon: AlignCenter },
        { value: 'right', label: 'Right', icon: AlignRight },
      ]}
      value={value}
      onChange={setValue}
      label="Alignment"
    />
  );
}

export const WithIcons: Story = {
  args: { ...dummyArgs },
  render: () => <WithIconsDemo />,
};

function IconOnlyDemo() {
  const [value, setValue] = useState('square');
  return (
    <IconSelectButton
      options={[
        { value: 'square', label: 'Square', icon: Square },
        { value: 'circle', label: 'Circle', icon: Circle },
        { value: 'triangle', label: 'Triangle', icon: Triangle },
      ]}
      value={value}
      onChange={setValue}
      label="Shape"
    />
  );
}

export const IconOnly: Story = {
  args: { ...dummyArgs },
  render: () => <IconOnlyDemo />,
};

function ColorPaletteDemo() {
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  return (
    <ColorPaletteSelect
      options={[...COLOR_PALETTES]}
      currentQrColor={qrColor}
      currentBgColor={bgColor}
      onChange={(qr, bg) => {
        setQrColor(qr);
        setBgColor(bg);
      }}
      label="Color Palette"
    />
  );
}

export const ColorPalette: Story = {
  args: { ...dummyArgs },
  render: () => <ColorPaletteDemo />,
};

export const GradientPresets: Story = {
  args: { ...dummyArgs },
  render: () => (
    <GradientPresetSelect
      options={[
        { name: 'Indigo to Pink', gradient: 'linear-gradient(45deg, #6366F1, #EC4899)' },
        { name: 'Blue to Cyan', gradient: 'linear-gradient(90deg, #3B82F6, #06B6D4)' },
        { name: 'Green to Yellow', gradient: 'linear-gradient(135deg, #22C55E, #EAB308)' },
        { name: 'Purple to Orange', gradient: 'linear-gradient(45deg, #8B5CF6, #F97316)' },
        { name: 'Red to Pink', gradient: 'radial-gradient(circle, #EF4444, #EC4899)' },
        { name: 'Teal Radial', gradient: 'radial-gradient(circle, #14B8A6, #0F172A)' },
      ]}
      onSelect={(index) => console.log('Selected gradient index:', index)}
      label="Gradient Presets"
    />
  ),
};
