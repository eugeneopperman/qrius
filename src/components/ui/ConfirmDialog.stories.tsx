import type { Meta, StoryObj } from '@storybook/react';
import { ConfirmDialog } from './ConfirmDialog';

const meta = {
  title: 'UI/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the dialog is visible',
    },
    onClose: {
      action: 'onClose',
      description: 'Callback when dialog is dismissed',
    },
    onConfirm: {
      action: 'onConfirm',
      description: 'Callback when confirm button is clicked',
    },
    title: {
      control: 'text',
      description: 'Dialog title text',
    },
    message: {
      control: 'text',
      description: 'Dialog message body',
    },
    confirmLabel: {
      control: 'text',
      description: 'Text for the confirm button',
    },
    cancelLabel: {
      control: 'text',
      description: 'Text for the cancel button',
    },
    variant: {
      control: 'select',
      options: ['danger', 'warning', 'info'],
      description: 'Visual style variant of the dialog',
    },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DangerVariant: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Delete Item?',
    message: 'This action cannot be undone.',
    variant: 'danger',
  },
};

export const WarningVariant: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Unsaved Changes',
    message: 'You have unsaved changes.',
    variant: 'warning',
  },
};

export const InfoVariant: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Confirm Action',
    message: 'Are you sure?',
    variant: 'info',
  },
};

export const CustomLabels: Story = {
  args: {
    isOpen: true,
    onClose: () => {},
    onConfirm: () => {},
    title: 'Delete Item?',
    message: 'This action cannot be undone.',
    variant: 'danger',
    confirmLabel: 'Yes, delete it',
    cancelLabel: 'Keep it',
  },
};
