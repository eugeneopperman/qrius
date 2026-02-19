import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorPicker } from './ColorPicker';

const meta = {
  title: 'UI/ColorPicker',
  component: ColorPicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label displayed above the picker',
    },
    value: {
      control: 'color',
      description: 'Current hex color value',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: '#3B82F6', onChange: () => {} },
  render: () => {
    const [color, setColor] = useState('#3B82F6');
    return <ColorPicker value={color} onChange={setColor} />;
  },
};

export const WithLabel: Story = {
  args: { value: '#EF4444', onChange: () => {} },
  render: () => {
    const [color, setColor] = useState('#EF4444');
    return <ColorPicker label="QR Code Color" value={color} onChange={setColor} />;
  },
};

export const CustomPresets: Story = {
  args: { value: '#FF6B6B', onChange: () => {} },
  render: () => {
    const [color, setColor] = useState('#FF6B6B');
    const presets = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    return <ColorPicker label="Brand Color" value={color} onChange={setColor} presets={presets} />;
  },
};

export const DarkColor: Story = {
  args: { value: '#000000', onChange: () => {} },
  render: () => {
    const [color, setColor] = useState('#000000');
    return <ColorPicker label="Background" value={color} onChange={setColor} />;
  },
};
