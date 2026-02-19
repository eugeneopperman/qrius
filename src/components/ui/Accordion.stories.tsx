import type { Meta, StoryObj } from '@storybook/react';
import { AccordionItem } from './Accordion';
import { Palette } from 'lucide-react';

const meta = {
  title: 'UI/AccordionItem',
  component: AccordionItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title text displayed in the accordion header',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Whether the accordion starts in an open state',
    },
    icon: {
      description: 'Optional icon displayed next to the title',
    },
    children: {
      control: 'text',
      description: 'Content displayed when the accordion is expanded',
    },
  },
} satisfies Meta<typeof AccordionItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Accordion Item',
    children: 'This is the content inside the accordion. It is hidden by default and revealed when the header is clicked.',
  },
};

export const DefaultOpen: Story = {
  args: {
    title: 'Open by Default',
    defaultOpen: true,
    children: 'This accordion item starts in the open state. The content is visible immediately without user interaction.',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Color Settings',
    icon: <Palette className="w-5 h-5" />,
    children: 'Accordion item with an icon next to the title. The icon receives special styling when the item is expanded.',
  },
};

export const MultipleItems: Story = {
  args: {
    title: 'Multiple Items',
    children: 'See render',
  },
  render: () => (
    <div className="w-96">
      <AccordionItem title="First Section" icon={<Palette className="w-5 h-5" />}>
        Content for the first accordion section. Each item operates independently.
      </AccordionItem>
      <AccordionItem title="Second Section" defaultOpen>
        Content for the second accordion section. This one starts open by default.
      </AccordionItem>
      <AccordionItem title="Third Section">
        Content for the third accordion section. Click the header to expand or collapse.
      </AccordionItem>
    </div>
  ),
};
