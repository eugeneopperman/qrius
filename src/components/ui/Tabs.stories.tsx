import type { Meta, StoryObj } from '@storybook/react';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from './Tabs';
import { Home, Settings, User } from 'lucide-react';

const meta = {
  title: 'UI/Tabs',
  component: TabGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TabGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <TabGroup>
      <TabList>
        <Tab>Tab One</Tab>
        <Tab>Tab Two</Tab>
        <Tab>Tab Three</Tab>
      </TabList>
      <TabPanels className="mt-4">
        <TabPanel>
          <p className="text-gray-700 dark:text-gray-300">Content for tab one.</p>
        </TabPanel>
        <TabPanel>
          <p className="text-gray-700 dark:text-gray-300">Content for tab two.</p>
        </TabPanel>
        <TabPanel>
          <p className="text-gray-700 dark:text-gray-300">Content for tab three.</p>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  ),
};

export const WithIcons: Story = {
  args: { children: null },
  render: () => (
    <TabGroup>
      <TabList>
        <Tab icon={Home}>Home</Tab>
        <Tab icon={User}>Profile</Tab>
        <Tab icon={Settings}>Settings</Tab>
      </TabList>
      <TabPanels className="mt-4">
        <TabPanel>
          <p className="text-gray-700 dark:text-gray-300">Home content goes here.</p>
        </TabPanel>
        <TabPanel>
          <p className="text-gray-700 dark:text-gray-300">Profile content goes here.</p>
        </TabPanel>
        <TabPanel>
          <p className="text-gray-700 dark:text-gray-300">Settings content goes here.</p>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  ),
};

export const DefaultTab: Story = {
  args: { children: null },
  render: () => (
    <TabGroup defaultTab={1}>
      <TabList>
        <Tab>First</Tab>
        <Tab>Second (Default)</Tab>
        <Tab>Third</Tab>
      </TabList>
      <TabPanels className="mt-4">
        <TabPanel>
          <p className="text-gray-700 dark:text-gray-300">First panel.</p>
        </TabPanel>
        <TabPanel>
          <p className="text-gray-700 dark:text-gray-300">Second panel — selected by default.</p>
        </TabPanel>
        <TabPanel>
          <p className="text-gray-700 dark:text-gray-300">Third panel.</p>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  ),
};

export const ManyTabs: Story = {
  args: { children: null },
  render: () => (
    <TabGroup>
      <TabList>
        {['Overview', 'Analytics', 'Reports', 'Notifications', 'Team', 'Billing', 'API'].map(
          (label) => (
            <Tab key={label}>{label}</Tab>
          )
        )}
      </TabList>
      <TabPanels className="mt-4">
        {['Overview', 'Analytics', 'Reports', 'Notifications', 'Team', 'Billing', 'API'].map(
          (label) => (
            <TabPanel key={label}>
              <p className="text-gray-700 dark:text-gray-300">{label} content.</p>
            </TabPanel>
          )
        )}
      </TabPanels>
    </TabGroup>
  ),
};
