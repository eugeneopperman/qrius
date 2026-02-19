import type { Meta, StoryObj } from '@storybook/react';
import { Dropdown } from './Dropdown';
import { Button } from './Button';

const meta = {
  title: 'UI/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Alignment of the dropdown menu relative to the trigger',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the container',
    },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const dummyRenderProps = {
  trigger: () => null,
  children: () => null,
};

export const Default: Story = {
  args: {
    ...dummyRenderProps,
    align: 'left',
  },
  render: (args) => (
    <Dropdown
      {...args}
      trigger={({ toggle }) => (
        <Button variant="secondary" onClick={toggle}>
          Options
        </Button>
      )}
    >
      {({ close }) => (
        <div className="py-1 min-w-[160px]">
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={close}
          >
            Edit
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={close}
          >
            Duplicate
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={close}
          >
            Delete
          </button>
        </div>
      )}
    </Dropdown>
  ),
};

export const RightAligned: Story = {
  args: {
    ...dummyRenderProps,
    align: 'right',
  },
  render: (args) => (
    <div className="flex justify-end w-[300px]">
      <Dropdown
        {...args}
        trigger={({ toggle }) => (
          <Button variant="secondary" onClick={toggle}>
            Options
          </Button>
        )}
      >
        {({ close }) => (
          <div className="py-1 min-w-[160px]">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={close}
            >
              Edit
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={close}
            >
              Duplicate
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={close}
            >
              Delete
            </button>
          </div>
        )}
      </Dropdown>
    </div>
  ),
};
