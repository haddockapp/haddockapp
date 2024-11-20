import type { Meta, StoryObj } from '@storybook/react';
import { Autocomplete } from '@/components/molecules/autocomplete';

const meta = {
  title: 'Molecules/Autocomplete',
  component: Autocomplete,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disables the autocomplete input',
    },
    options: {
      control: 'object',
      description: 'Array of options to display in the dropdown',
    },
    onChange: {
      action: 'changed',
      description: 'Callback function when selection changes',
    },
  },
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample options for all stories
const sampleOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'orange', label: 'Orange' },
  { value: 'grape', label: 'Grape' },
  { value: 'mango', label: 'Mango' },
  { value: 'pineapple', label: 'Pineapple' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'blueberry', label: 'Blueberry' },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
  },
};

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    disabled: true,
  },
};

export const WithManyOptions: Story = {
  args: {
    options: [
      ...sampleOptions,
      { value: 'kiwi', label: 'Kiwi' },
      { value: 'peach', label: 'Peach' },
      { value: 'plum', label: 'Plum' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'watermelon', label: 'Watermelon' },
      { value: 'papaya', label: 'Papaya' },
      { value: 'fig', label: 'Fig' },
      { value: 'dragonfruit', label: 'Dragon Fruit' },
    ],
  },
};

export const SingleOption: Story = {
  args: {
    options: [{ value: 'single', label: 'Single Option' }],
  },
};
