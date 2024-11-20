import type { Meta, StoryObj } from '@storybook/react';
import Stepdots from '@/components/molecules/stepdots';

const meta = {
  title: 'Molecules/Stepdots',
  component: Stepdots,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    step: {
      control: { type: 'number', min: 0 },
      description: 'Current active step (zero-based index)',
    },
    total: {
      control: { type: 'number', min: 1 },
      description: 'Total number of steps',
    },
  },
} satisfies Meta<typeof Stepdots>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    step: 1,
    total: 5,
  },
};

export const FirstStep: Story = {
  args: {
    step: 0,
    total: 5,
  },
};

export const LastStep: Story = {
  args: {
    step: 4,
    total: 5,
  },
};

export const MinimalSteps: Story = {
  args: {
    step: 0,
    total: 2,
  },
};

export const ManySteps: Story = {
  args: {
    step: 4,
    total: 10,
  },
};

export const AllCompleted: Story = {
  args: {
    step: 5,
    total: 5,
  },
};
